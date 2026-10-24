import { supabaseAdmin } from "@/lib/supabase-admin";
import { PAGE_SIZE, type BackupTable } from "./config";

export type PageResult = { rows: Record<string, unknown>[]; missing: boolean };

export function isMissingTable(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return error.code === "42P01" || error.code === "PGRST205" || /does not exist|Could not find the table/i.test(error.message ?? "");
}

const tenantColumn = (table: string) => (table === "tenants" ? "id" : "tenant_id");

// id üzerinden keyset sayfalama: OFFSET'in aksine 1M+ satırda da sabit hızlıdır.
export async function fetchPage(table: BackupTable, tenantId: string, afterId: string | null): Promise<PageResult> {
  let q = supabaseAdmin.from(table).select("*").eq(tenantColumn(table), tenantId).order("id", { ascending: true }).limit(PAGE_SIZE);
  if (afterId) q = q.gt("id", afterId);
  const { data, error } = await q;
  if (isMissingTable(error)) return { rows: [], missing: true };
  if (error) throw new Error(`${table} okunamadı: ${error.message}`);
  return { rows: (data ?? []) as Record<string, unknown>[], missing: false };
}

export async function countRows(table: BackupTable, tenantId: string): Promise<number | null> {
  const { count, error } = await supabaseAdmin
    .from(table).select("id", { count: "exact", head: true }).eq(tenantColumn(table), tenantId);
  if (isMissingTable(error)) return null;
  if (error) throw new Error(`${table} sayılamadı: ${error.message}`);
  return count ?? 0;
}
