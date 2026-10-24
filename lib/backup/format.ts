import { BACKUP_VERSION } from "./config";

// Yedek dosyası GEÇERLİ JSON'dur, ama satır tabanlı yazılır: her kayıt kendi satırında.
// Böylece 1M+ satırlık dosya hem akış halinde yazılır hem de geri yüklemede
// belleğe tamamen alınmadan (JSON.parse yok) satır satır okunur.
//
// {
// "backupVersion":"1.0",
// "companyName":"...",
// "tenantId":"...",
// "backupDate":"...",
// "recordCounts":{...},          ← yedek başında sayılan tahmini adetler
// "data":{
// "products":[
// {...}
// ,{...}
// ]
// ,"customers":[
// ...
// ]
// },
// "recordCountsActual":{...},    ← gerçekten yazılan adetler
// "complete":true                ← dosya eksiksiz bittiğinin işareti
// }

export type BackupHeader = {
  companyName: string;
  tenantId: string;
  backupDate: string;
  recordCounts: Record<string, number>;
};

export function headerText(h: BackupHeader): string {
  return (
    "{\n" +
    `"backupVersion":${JSON.stringify(BACKUP_VERSION)},\n` +
    `"companyName":${JSON.stringify(h.companyName)},\n` +
    `"tenantId":${JSON.stringify(h.tenantId)},\n` +
    `"backupDate":${JSON.stringify(h.backupDate)},\n` +
    `"recordCounts":${JSON.stringify(h.recordCounts)},\n` +
    `"data":{\n`
  );
}

export function tableStartText(table: string, first: boolean): string {
  return `${first ? "" : ","}"${table}":[\n`;
}

export function rowsText(rows: unknown[], wroteBefore: boolean): string {
  let out = "";
  for (let i = 0; i < rows.length; i++) {
    out += (wroteBefore || i > 0 ? "," : "") + JSON.stringify(rows[i]) + "\n";
  }
  return out;
}

export const TABLE_END_TEXT = "]\n";

export function footerText(actual: Record<string, number>): string {
  return `},\n"recordCountsActual":${JSON.stringify(actual)},\n"complete":true\n}\n`;
}

export type ParsedLine =
  | { kind: "table"; table: string }
  | { kind: "row"; row: Record<string, unknown> }
  | { kind: "tableEnd" }
  | { kind: "meta"; key: string; value: unknown }
  | { kind: "other" };

const TABLE_RE = /^,?"([a-z_]+)":\[$/;
const META_RE = /^"(backupVersion|companyName|tenantId|backupDate|recordCounts|recordCountsActual|complete)":(.*?),?$/;

export function parseLine(line: string): ParsedLine {
  const l = line.trimEnd();
  if (l === "") return { kind: "other" };
  const t = TABLE_RE.exec(l);
  if (t) return { kind: "table", table: t[1] };
  if (l === "]") return { kind: "tableEnd" };
  const first = l.charCodeAt(0) === 44 ? 1 : 0; // ','
  if (l.charCodeAt(first) === 123 /* { */ && l !== "{") {
    return { kind: "row", row: JSON.parse(l.slice(first)) };
  }
  const m = META_RE.exec(l);
  if (m) {
    try {
      return { kind: "meta", key: m[1], value: JSON.parse(m[2]) };
    } catch {
      return { kind: "other" };
    }
  }
  return { kind: "other" };
}

// Dosyanın başındaki / sonundaki metinden üst bilgi ve bütünlük bilgisini çıkarır.
export function parseMeta(text: string): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const line of text.split("\n")) {
    // Parça sınırında kesilmiş (yarım) satırlar yok sayılır.
    let p: ParsedLine;
    try { p = parseLine(line); } catch { continue; }
    if (p.kind === "meta") out[p.key] = p.value;
  }
  return out;
}
