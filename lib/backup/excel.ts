import ExcelJS from "exceljs";
import { PassThrough } from "stream";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { EXCEL_MAX_ROWS, PAGE_SIZE } from "./config";
import { isMissingTable } from "./tables";
import type { Ctx } from "./types";

type Row = Record<string, unknown>;
type Spec = {
  file: string;
  sheet: string;
  table: string;
  // Sıralama sütunu (en yeni kayıtlar önce). Yoksa id sırası.
  orderCol?: string;
  filter?: (q: ReturnType<typeof base>) => ReturnType<typeof base>;
  // Satırları toplulaştırır (ör. satış kalemlerinden fiş). Verilirse çıktı bu satırlardır.
  aggregate?: (rows: Row[]) => Row[];
};

const base = (table: string, tenantId: string) => supabaseAdmin.from(table).select("*").eq("tenant_id", tenantId);

const SPECS: Spec[] = [
  { file: "Products.xlsx", sheet: "Urunler", table: "products" },
  { file: "Customers.xlsx", sheet: "Musteriler", table: "customers", filter: (q) => q.in("type", ["musteri", "her_ikisi"]) },
  { file: "Suppliers.xlsx", sheet: "Tedarikciler", table: "customers", filter: (q) => q.in("type", ["tedarikci", "her_ikisi"]) },
  { file: "StockMovements.xlsx", sheet: "StokHareketleri", table: "stock_movements", orderCol: "created_at" },
  { file: "PurchaseOrders.xlsx", sheet: "Alislar", table: "purchases", orderCol: "date" },
  { file: "SalesOrders.xlsx", sheet: "Satislar", table: "sales", orderCol: "date" },
  { file: "Invoices.xlsx", sheet: "Fisler", table: "sales", orderCol: "date", aggregate: aggregateReceipts },
];

export const EXCEL_FILE_COUNT = SPECS.length;

// Stok panelinde ayrı fatura tablosu yok: çok kalemli satış fişi (sale_group_id) fatura olarak sunulur.
function aggregateReceipts(rows: Row[]): Row[] {
  const groups = new Map<string, Row>();
  for (const r of rows) {
    const key = String(r.sale_group_id ?? r.id);
    const g = groups.get(key);
    const total = Number(r.total ?? 0) || 0;
    if (g) {
      g.item_count = (g.item_count as number) + 1;
      g.total = (g.total as number) + total;
    } else {
      groups.set(key, {
        sale_group_id: key, date: r.date ?? null, customer_id: r.customer_id ?? null,
        warehouse_id: r.warehouse_id ?? null, payment_method: r.payment_method ?? null,
        item_count: 1, total,
      });
    }
  }
  return [...groups.values()];
}

async function readPage(spec: Spec, tenantId: string, cursor: { v: unknown; id: string } | null) {
  let q = base(spec.table, tenantId);
  if (spec.filter) q = spec.filter(q);
  if (spec.orderCol) {
    const c = spec.orderCol;
    q = q.order(c, { ascending: false }).order("id", { ascending: false });
    if (cursor) {
      // Bileşik keyset: (c, id) çiftine göre bir sonraki sayfa. PostgreSQL'de DESC sıralamada NULL'lar önce gelir.
      q = cursor.v === null
        ? q.or(`${c}.not.is.null,and(${c}.is.null,id.lt.${cursor.id})`)
        : q.or(`${c}.lt."${cursor.v}",and(${c}.eq."${cursor.v}",id.lt.${cursor.id})`);
    }
  } else {
    q = q.order("id", { ascending: true });
    if (cursor) q = q.gt("id", cursor.id);
  }
  const { data, error } = await q.limit(PAGE_SIZE);
  if (isMissingTable(error)) return null;
  if (error) throw new Error(`${spec.table} Excel için okunamadı: ${error.message}`);
  return (data ?? []) as Row[];
}

const cell = (v: unknown): string | number | boolean | Date | null => {
  if (v === null || v === undefined) return null;
  if (typeof v === "object") return JSON.stringify(v);
  return v as string | number | boolean;
};

async function buildWorkbook(ctx: Ctx, spec: Spec): Promise<{ buffer: Buffer; rows: number; truncated: boolean } | null> {
  const chunks: Buffer[] = [];
  const stream = new PassThrough();
  stream.on("data", (c: Buffer) => chunks.push(c));
  const ended = new Promise<void>((res) => stream.on("end", () => res()));
  const wb = new ExcelJS.stream.xlsx.WorkbookWriter({ stream, useStyles: false, useSharedStrings: false });
  const ws = wb.addWorksheet(spec.sheet);

  const hardStop = ctx.deadline + 25_000; // maxDuration'dan önce güvenli çıkış
  let cursor: { v: unknown; id: string } | null = null;
  let columns: string[] | null = null;
  let written = 0;
  let readRows = 0;
  let truncated = false;
  const buffered: Row[] = [];

  const writeRows = (rows: Row[]) => {
    for (const r of rows) {
      if (!columns) {
        columns = Object.keys(r);
        ws.addRow(columns).commit();
      }
      ws.addRow(columns.map((c) => cell(r[c]))).commit();
      written++;
    }
  };

  for (;;) {
    const page = await readPage(spec, ctx.tenantId, cursor);
    if (page === null) return null; // tablo yok
    readRows += page.length;
    if (spec.aggregate) buffered.push(...page);
    else writeRows(page);
    if (page.length < PAGE_SIZE) break;
    const last = page[page.length - 1];
    cursor = { v: spec.orderCol ? last[spec.orderCol] ?? null : null, id: String(last.id) };
    if (readRows >= EXCEL_MAX_ROWS || Date.now() > hardStop) { truncated = true; break; }
  }
  if (spec.aggregate) writeRows(spec.aggregate(buffered));

  const info = wb.addWorksheet("Bilgi");
  info.addRow(["Olusturulma", new Date().toISOString()]).commit();
  info.addRow(["Kaynak tablo", spec.table]).commit();
  info.addRow(["Satir sayisi", written]).commit();
  info.addRow([
    "Not",
    truncated
      ? `Excel sinirlari nedeniyle en yeni ${readRows} kayit yazildi. Tam veri JSON yedegindedir.`
      : "Tum kayitlar yazildi.",
  ]).commit();
  info.addRow(["Uyari", "Bu dosya yalnizca goruntuleme icindir; geri yukleme JSON yedegiyle yapilir."]).commit();
  ws.commit();
  info.commit();
  await wb.commit();
  await ended;
  return { buffer: Buffer.concat(chunks), rows: written, truncated };
}

const XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

/** Her dosya ayrı üretilip Excel klasörüne yüklenir; süre dolarsa kalan dosyalar sonraki adıma kalır. true → hepsi bitti. */
export async function runExcelPhase(ctx: Ctx): Promise<boolean> {
  const st = ctx.state;
  st.excelIdx ??= 0;
  st.excelFiles ??= [];
  while (st.excelIdx < SPECS.length) {
    if (Date.now() > ctx.deadline - 20_000 && st.excelIdx > 0) return false;
    const spec = SPECS[st.excelIdx];
    const built = await buildWorkbook(ctx, spec);
    if (built) {
      await ctx.drive.upsertSmall(ctx.folders.Excel, spec.file, built.buffer, XLSX);
      st.excelFiles.push({ name: spec.file, rows: built.rows, truncated: built.truncated });
      if (built.truncated) ctx.warn(`${spec.file}: Excel sınırı nedeniyle yalnızca en yeni ${built.rows} kayıt yazıldı (JSON yedek eksiksizdir)`);
    } else {
      ctx.warn(`${spec.file}: kaynak tablo (${spec.table}) bulunamadı, atlandı`);
    }
    st.excelIdx++;
    await ctx.persist();
  }
  return true;
}
