// Yedekleme sistemi sabitleri.

export const BACKUP_VERSION = "1.0";
export const ROOT_FOLDER_NAME = "StokPanel Backups";
export const SUBFOLDERS = ["Daily", "Monthly", "Yearly", "Excel", "Reports", "Documents"] as const;
export type SubFolder = (typeof SUBFOLDERS)[number];

// Yedeklenen tablolar, GERİ YÜKLEME (FK) sırasıyla. tenants/profiles yedeğe girer
// ama geri yüklenmez: profiles, auth.users'a bağlıdır (şifreler Supabase Auth'ta durur).
export const BACKUP_TABLES = [
  "tenants",
  "profiles",
  "warehouses",
  "products",
  "customers",
  "product_stock",
  "stock_movements",
  "sales",
  "purchases",
] as const;
export type BackupTable = (typeof BACKUP_TABLES)[number];

export const RESTORE_TABLES: readonly BackupTable[] = [
  "warehouses",
  "products",
  "customers",
  "product_stock",
  "stock_movements",
  "sales",
  "purchases",
];

// Replace modunda silme sırası: bağımlı (çocuk) tablolar önce.
export const PURGE_ORDER: readonly BackupTable[] = [...RESTORE_TABLES].reverse();

export const PAGE_SIZE = 1000; // PostgREST tek istekte en fazla 1000 satır döndürür
export const FLUSH_BYTES = 8 * 1024 * 1024; // Drive'a gönderilen parça (256 KiB katı)
export const CHUNK_ALIGN = 256 * 1024;
export const RESTORE_BATCH = 500;

// Tek bir fonksiyon çağrısının çalışma bütçesi (route maxDuration = 300 sn).
export const STEP_BUDGET_MS = 240_000;
export const LEASE_MS = 290_000;
export const STALE_JOB_MS = 3 * 60 * 60 * 1000;

export const DAILY_RETENTION_DAYS = 35; // Daily klasörü; Monthly ve Yearly ASLA silinmez

export const EXCEL_MAX_ROWS = 250_000; // Excel sayfa sınırı 1.048.576 satırdır
export const DOCUMENT_MAX_BYTES = 100 * 1024 * 1024;

export const DOCUMENT_BUCKETS = (process.env.BACKUP_DOCUMENT_BUCKETS ?? "documents,product-images,invoices")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export const TIMEZONE = "Europe/Istanbul";
