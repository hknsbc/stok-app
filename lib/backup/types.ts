import type { Drive } from "./google";
import type { SubFolder } from "./config";

export type JobRow = {
  id: string;
  tenant_id: string;
  operation: "backup" | "restore";
  trigger: "manual" | "cron";
  status: "running" | "success" | "failed";
  phase: string | null;
  started_at: string;
  finished_at: string | null;
  file_name: string | null;
  file_size: number | null;
  drive_file_id: string | null;
  record_counts: Record<string, number> | null;
  error_message: string | null;
  warnings: string[];
  state: JobState;
};

// Bir işin kaldığı yer. Her adım sonunda DB'ye yazılır; sonraki çağrı buradan devam eder.
export type JobState = {
  // backup
  json?: {
    name: string;
    uploadUri?: string;
    offset: number;
    tailB64: string;
    tableIdx: number;
    tableOpen: boolean;
    tablesWritten: number;
    tableRows: number;
    lastId: string | null;
    counts: Record<string, number>;
    expected: Record<string, number>;
    skipped: string[];
    done?: boolean;
    fileId?: string;
    size?: number;
    tenantName?: string;
  };
  excelIdx?: number;
  excelFiles?: { name: string; rows: number; truncated: boolean }[];
  docsDone?: boolean;
  docsCount?: number;
  // restore
  restore?: {
    fileId: string;
    fileName: string;
    mode: "replace" | "merge";
    stage: "init" | "purge" | "import" | "reconcile" | "documents" | "done";
    srcTenant?: string;
    size?: number;
    expected?: Record<string, number>;
    purgeIdx: number;
    byteOffset: number;
    curTable: string | null;
    productsStart: number | null;
    reconOffset: number;
    restored: Record<string, number>;
    docIdx: number;
    docsRestored: number;
  };
};

export type Ctx = {
  job: JobRow;
  state: JobState;
  tenantId: string;
  drive: Drive;
  folders: Record<SubFolder, string>;
  deadline: number; // bu adımın bitmesi gereken zaman (ms epoch)
  persist: () => Promise<void>;
  warn: (msg: string) => void;
};
