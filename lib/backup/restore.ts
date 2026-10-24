import { supabaseAdmin } from "@/lib/supabase-admin";
import { PURGE_ORDER, RESTORE_BATCH, RESTORE_TABLES } from "./config";
import { parseLine, parseMeta, type ParsedLine } from "./format";
import { restoreDocuments } from "./documents";
import type { Drive } from "./google";
import type { Ctx } from "./types";

const enc = new TextEncoder();

/**
 * Drive'daki yedeği `startOffset` baytından itibaren AKIŞ olarak, satır satır okur (JSON.parse ile tüm dosya
 * belleğe alınmaz). onLine her satır için çağrılır ve satırın bittiği bayt konumunu alır. Süre dolarsa
 * flush çağrılıp çıkılır. Dönüş: son işlenen satırın bitiş konumu ve dosyanın sonuna gelinip gelinmediği.
 */
async function streamLines(
  drive: Drive, fileId: string, startOffset: number, size: number, deadline: number,
  onLine: (line: ParsedLine, startPos: number, endPos: number) => Promise<boolean | void>, // true → dur
  flush: () => Promise<void>
): Promise<{ pos: number; finished: boolean }> {
  if (startOffset >= size) { await flush(); return { pos: startOffset, finished: true }; }
  const res = await drive.download(fileId, startOffset);
  if (!res.body) throw new Error("Drive yanıtı boş");
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let pos = startOffset;
  let carry = "";
  let stop = false;

  const handle = async (text: string): Promise<boolean> => {
    const bytes = enc.encode(text).length + 1;
    const startPos = pos;
    pos += bytes;
    return (await onLine(parseLine(text), startPos, pos)) === true;
  };

  try {
    outer: for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      carry += decoder.decode(value, { stream: true });
      let nl: number;
      while ((nl = carry.indexOf("\n")) >= 0) {
        const line = carry.slice(0, nl);
        carry = carry.slice(nl + 1);
        if (await handle(line)) { stop = true; break outer; }
        if (Date.now() > deadline) { stop = true; break outer; }
      }
    }
    if (!stop && carry.length > 0) await handle(carry); // dosya sonunda \n yoksa
  } finally {
    await reader.cancel().catch(() => {});
  }
  await flush();
  return { pos, finished: !stop };
}

async function rpc(name: string, args: Record<string, unknown>): Promise<number> {
  const { data, error } = await supabaseAdmin.rpc(name, args);
  if (error) throw new Error(`${name}: ${error.message}`);
  return Number(data ?? 0);
}

async function readRange(drive: Drive, id: string, start: number, end: number): Promise<string> {
  return (await (await drive.download(id, start, end)).text());
}

// ── Aşamalar ───────────────────────────────────────────────────────────────
async function init(ctx: Ctx) {
  const rs = ctx.state.restore!;
  const meta = await ctx.drive.get(rs.fileId);
  const size = Number(meta.size ?? 0);
  if (!size) throw new Error("Yedek dosyası boş");
  const head = parseMeta(await readRange(ctx.drive, rs.fileId, 0, Math.min(size, 4096) - 1));
  const tail = parseMeta(await readRange(ctx.drive, rs.fileId, Math.max(0, size - 8192), size - 1));
  if (head.backupVersion !== "1.0") throw new Error(`Desteklenmeyen yedek sürümü: ${String(head.backupVersion)}`);
  if (tail.complete !== true) throw new Error("Yedek dosyası eksik veya bozuk (tamamlanma işareti yok). Geri yükleme yapılmadı.");
  if (typeof head.tenantId !== "string") throw new Error("Yedekte tenantId yok");
  rs.srcTenant = head.tenantId;
  rs.size = size;
  rs.expected = (tail.recordCountsActual ?? {}) as Record<string, number>;
  rs.stage = rs.mode === "replace" ? "purge" : "import";
}

async function purge(ctx: Ctx): Promise<boolean> {
  const rs = ctx.state.restore!;
  while (rs.purgeIdx < PURGE_ORDER.length) {
    const table = PURGE_ORDER[rs.purgeIdx];
    for (;;) {
      if (Date.now() > ctx.deadline) { await ctx.persist(); return false; }
      const n = await rpc("backup_purge_rows", { p_tenant: ctx.tenantId, p_table: table, p_limit: 5000 });
      if (n === 0) break;
    }
    rs.purgeIdx++;
    await ctx.persist();
  }
  rs.stage = "import";
  return true;
}

async function importRows(ctx: Ctx): Promise<boolean> {
  const rs = ctx.state.restore!;
  let batch: Record<string, unknown>[] = [];
  let batchTable: string | null = null;
  let table = rs.curTable;

  const commit = async (pos: number) => {
    if (batch.length && batchTable) {
      const n = await rpc("backup_restore_rows", {
        p_src_tenant: rs.srcTenant, p_tenant: ctx.tenantId, p_table: batchTable, p_rows: batch,
      });
      rs.restored[batchTable] = (rs.restored[batchTable] ?? 0) + n;
    }
    batch = [];
    rs.byteOffset = pos;
    rs.curTable = table;
    await ctx.persist();
  };

  const { pos, finished } = await streamLines(
    ctx.drive, rs.fileId, rs.byteOffset, rs.size!, ctx.deadline,
    async (line, startPos, endPos) => {
      if (line.kind === "table") {
        table = line.table;
        if (line.table === "products" && rs.productsStart === null) rs.productsStart = startPos;
      } else if (line.kind === "tableEnd") {
        table = null;
      } else if (line.kind === "row" && table && (RESTORE_TABLES as readonly string[]).includes(table)) {
        if (batchTable !== table) {
          await commit(startPos); // tablo değişti: önceki partiyi yaz
          batchTable = table;
        }
        batch.push(line.row);
        if (batch.length >= RESTORE_BATCH) await commit(endPos);
      }
    },
    async () => {}
  );
  await commit(pos);
  if (finished) rs.stage = "reconcile";
  return finished;
}

// Satış/alış trigger'ları import sırasında products.stock'u oynatmış olabilir: yedekteki değerleri geri yaz.
async function reconcile(ctx: Ctx): Promise<boolean> {
  const rs = ctx.state.restore!;
  if (rs.productsStart === null) { rs.stage = "documents"; return true; }
  let table: string | null = null;
  let batch: { id: unknown; stock: unknown }[] = [];
  const startAt = Math.max(rs.reconOffset, rs.productsStart);
  let inProducts = startAt > rs.productsStart; // yarıda kalmışsa zaten products satırlarının içindeyiz
  if (inProducts) table = "products";
  let done = false;

  const commit = async (pos: number) => {
    if (batch.length) await rpc("backup_reconcile_stock", { p_tenant: ctx.tenantId, p_rows: batch });
    batch = [];
    rs.reconOffset = pos;
    await ctx.persist();
  };

  const { pos } = await streamLines(
    ctx.drive, rs.fileId, startAt, rs.size!, ctx.deadline,
    async (line, _s, endPos) => {
      if (line.kind === "table") { table = line.table; inProducts = line.table === "products"; return; }
      if (line.kind === "tableEnd" && inProducts) { done = true; await commit(endPos); return true; }
      if (line.kind === "row" && table === "products") {
        batch.push({ id: line.row.id, stock: line.row.stock });
        if (batch.length >= RESTORE_BATCH) await commit(endPos);
      }
    },
    async () => {}
  );
  if (!done) await commit(pos);
  if (done) rs.stage = "documents";
  return done;
}

export type RestoreOutcome = { finished: boolean; warnings: string[]; verification: string[] };

export async function runRestoreStep(ctx: Ctx): Promise<RestoreOutcome> {
  const rs = ctx.state.restore!;
  const verification: string[] = [];
  for (;;) {
    if (rs.stage === "init") { await init(ctx); await ctx.persist(); }
    else if (rs.stage === "purge") { if (!(await purge(ctx))) break; }
    else if (rs.stage === "import") { if (!(await importRows(ctx))) break; }
    else if (rs.stage === "reconcile") { if (!(await reconcile(ctx))) break; }
    else if (rs.stage === "documents") {
      if (!(await restoreDocuments(ctx, rs.srcTenant!))) break;
      rs.stage = "done";
      await ctx.persist();
    } else if (rs.stage === "done") {
      for (const t of RESTORE_TABLES) {
        const want = rs.expected?.[t] ?? 0;
        const got = rs.restored[t] ?? 0;
        if (want !== got) verification.push(`${t}: yedekte ${want}, geri yüklenen ${got}`);
      }
      return { finished: true, warnings: [], verification };
    }
    if (Date.now() > ctx.deadline) break;
  }
  return { finished: false, warnings: [], verification };
}
