import { BACKUP_TABLES, CHUNK_ALIGN, FLUSH_BYTES, PAGE_SIZE } from "./config";
import { footerText, headerText, rowsText, tableStartText, TABLE_END_TEXT } from "./format";
import { countRows, fetchPage } from "./tables";
import type { Ctx } from "./types";

class Out {
  parts: Buffer[] = [];
  size = 0;
  push(s: string) {
    const b = Buffer.from(s, "utf8");
    this.parts.push(b);
    this.size += b.length;
  }
  take(tail: Buffer): Buffer {
    const all = Buffer.concat([tail, ...this.parts]);
    this.parts = [];
    this.size = 0;
    return all;
  }
}

// Verilen bayt akışını Drive'a gönderir: 256 KiB'ın tam katlarını yükler, kalanı (tail) state'te tutar.
async function flush(ctx: Ctx, out: Out, final: boolean) {
  const st = ctx.state.json!;
  const tail = st.tailB64 ? Buffer.from(st.tailB64, "base64") : Buffer.alloc(0);
  const all = out.take(tail);
  if (final) {
    const file = await ctx.drive.putChunk(st.uploadUri!, st.offset, all, true);
    if (!file) throw new Error("Drive yüklemeyi tamamlamadı");
    st.offset += all.length;
    st.tailB64 = "";
    st.fileId = file.id;
    st.size = st.offset;
    return;
  }
  const n = Math.floor(all.length / CHUNK_ALIGN) * CHUNK_ALIGN;
  if (n > 0) {
    await ctx.drive.putChunk(st.uploadUri!, st.offset, all.subarray(0, n), false);
    st.offset += n;
  }
  st.tailB64 = all.subarray(n).toString("base64");
}

/**
 * JSON yedeğini tablo tablo, 1000'lik sayfalarla okuyup Drive'a akıtır.
 * Bellekte hiçbir zaman ~FLUSH_BYTES'tan fazla veri tutulmaz. Süre dolarsa durumu kaydedip çıkar;
 * sonraki çağrı kaldığı satırdan (keyset imleci) devam eder. true → tamamlandı.
 */
export async function runJsonPhase(ctx: Ctx, companyName: string): Promise<boolean> {
  const st = ctx.state.json!;
  if (st.done) return true;
  const out = new Out();

  if (!st.uploadUri) {
    for (const t of BACKUP_TABLES) {
      const n = await countRows(t, ctx.tenantId);
      if (n === null) st.skipped.push(t);
      else st.expected[t] = n;
    }
    st.uploadUri = await ctx.drive.startResumable(ctx.folders.Daily, st.name, "application/json");
    out.push(headerText({ companyName, tenantId: ctx.tenantId, backupDate: new Date().toISOString(), recordCounts: st.expected }));
    await flush(ctx, out, false);
    await ctx.persist();
  } else if (st.offset > 0) {
    // Önceki adımda Drive'a ne kadar yazıldığı, kayıtlı durumla birebir aynı olmalı.
    const status = await ctx.drive.resumableStatus(st.uploadUri);
    if (status.received !== st.offset) {
      throw new Error(`Drive yükleme durumu tutarsız (Drive: ${status.received}, kayıt: ${st.offset}). Yedek yeniden başlatılmalı.`);
    }
  }

  while (st.tableIdx < BACKUP_TABLES.length) {
    const table = BACKUP_TABLES[st.tableIdx];
    if (st.skipped.includes(table)) { st.tableIdx++; continue; }

    const page = await fetchPage(table, ctx.tenantId, st.lastId);
    if (page.missing) {
      st.skipped.push(table);
      st.tableIdx++;
      continue;
    }
    if (!st.tableOpen) {
      out.push(tableStartText(table, st.tablesWritten === 0));
      st.tableOpen = true;
      st.tablesWritten++;
    }
    if (page.rows.length) {
      out.push(rowsText(page.rows, st.tableRows > 0));
      st.tableRows += page.rows.length;
      st.counts[table] = (st.counts[table] ?? 0) + page.rows.length;
      st.lastId = String(page.rows[page.rows.length - 1].id);
    }
    if (page.rows.length < PAGE_SIZE) {
      out.push(TABLE_END_TEXT);
      st.counts[table] = st.counts[table] ?? 0;
      st.tableOpen = false;
      st.tableIdx++;
      st.tableRows = 0;
      st.lastId = null;
    }

    // Durum yalnızca burada, imleç ve gönderilen/bekleyen bayt tutarlıyken kaydedilir.
    if (out.size >= FLUSH_BYTES || Date.now() > ctx.deadline) {
      await flush(ctx, out, false);
      await ctx.persist();
      if (Date.now() > ctx.deadline && st.tableIdx < BACKUP_TABLES.length) return false;
    }
  }

  out.push(footerText(st.counts));
  await flush(ctx, out, true);
  st.done = true;
  await ctx.persist();
  return true;
}
