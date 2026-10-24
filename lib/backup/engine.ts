import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  DAILY_RETENTION_DAYS, LEASE_MS, STALE_JOB_MS, STEP_BUDGET_MS, TIMEZONE, type SubFolder,
} from "./config";
import { decryptSecret } from "./crypto";
import { runDocumentsPhase } from "./documents";
import { runExcelPhase } from "./excel";
import { Drive, GoogleAuthError, refreshAccessToken } from "./google";
import { runJsonPhase } from "./backup-json";
import { runRestoreStep } from "./restore";
import type { Ctx, JobRow, JobState } from "./types";

export type Connection = {
  tenant_id: string;
  google_email: string | null;
  refresh_token_enc: string;
  root_folder_id: string | null;
  folder_ids: Record<SubFolder, string> | Record<string, never>;
  status: "connected" | "error";
  last_error: string | null;
};

export const isoDateIn = (d: Date, tz = TIMEZONE) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);

const hourIn = (d: Date, tz = TIMEZONE) =>
  Number(new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", hourCycle: "h23" }).format(d));

export async function getConnection(tenantId: string): Promise<Connection | null> {
  const { data } = await supabaseAdmin.from("backup_connections").select("*").eq("tenant_id", tenantId).maybeSingle();
  return (data as Connection | null) ?? null;
}

export async function driveFor(conn: Connection): Promise<Drive> {
  try {
    return new Drive(await refreshAccessToken(decryptSecret(conn.refresh_token_enc)));
  } catch (e) {
    if (e instanceof GoogleAuthError) {
      await supabaseAdmin.from("backup_connections").update({ status: "error", last_error: e.message }).eq("tenant_id", conn.tenant_id);
    }
    throw e;
  }
}

// Klasör yapısını doğrular (kullanıcı Drive'da silmiş olabilir) ve gerekirse yeniden oluşturur.
export async function ensureFolders(drive: Drive, conn: Connection): Promise<Record<SubFolder, string>> {
  const ids = conn.folder_ids as Record<SubFolder, string>;
  const required: SubFolder[] = ["Daily", "Monthly", "Yearly", "Excel", "Reports", "Documents"];
  if (conn.root_folder_id && required.every((f) => ids[f]) && (await drive.exists(ids.Daily)) && (await drive.exists(ids.Documents))) {
    return ids;
  }
  const { rootId, folders } = await drive.ensureStructure();
  await supabaseAdmin.from("backup_connections")
    .update({ root_folder_id: rootId, folder_ids: folders, status: "connected", last_error: null })
    .eq("tenant_id", conn.tenant_id);
  conn.root_folder_id = rootId;
  conn.folder_ids = folders;
  return folders;
}

async function tenantCompanyName(tenantId: string): Promise<string> {
  const { data } = await supabaseAdmin.from("profiles").select("company_name").eq("tenant_id", tenantId).not("company_name", "is", null).limit(1);
  return (data?.[0]?.company_name as string | undefined) ?? "StokPanel";
}

// ── İş başlatma ────────────────────────────────────────────────────────────
export async function startJob(
  tenantId: string, operation: "backup" | "restore", trigger: "manual" | "cron", state: JobState, fileName?: string
): Promise<JobRow> {
  const { data, error } = await supabaseAdmin.from("backup_logs")
    .insert({ tenant_id: tenantId, operation, trigger, phase: operation === "backup" ? "json" : "init", state, file_name: fileName ?? null })
    .select("*").single();
  if (error) {
    // Aynı tenant için zaten çalışan iş var (kısmi benzersiz indeks).
    if (error.code === "23505") {
      const running = await getRunningJob(tenantId);
      if (running) return running;
    }
    throw new Error(`İş başlatılamadı: ${error.message}`);
  }
  return data as JobRow;
}

export async function getRunningJob(tenantId: string): Promise<JobRow | null> {
  const { data } = await supabaseAdmin.from("backup_logs").select("*").eq("tenant_id", tenantId).eq("status", "running").maybeSingle();
  return (data as JobRow | null) ?? null;
}

export async function startBackup(tenantId: string, trigger: "manual" | "cron"): Promise<JobRow> {
  const now = new Date();
  const date = isoDateIn(now);
  const time = new Intl.DateTimeFormat("en-GB", { timeZone: TIMEZONE, hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" })
    .format(now).replaceAll(":", "");
  // Gece yedeği: 2026-10-24.json — manuel yedekler günlük dosyanın üzerine yazmaz.
  const name = trigger === "cron" ? `${date}.json` : `${date}_${time}-manuel.json`;
  return startJob(tenantId, "backup", trigger, {
    json: { name, offset: 0, tailB64: "", tableIdx: 0, tableOpen: false, tablesWritten: 0, tableRows: 0, lastId: null, counts: {}, expected: {}, skipped: [] },
  }, name);
}

// ── Adım yürütme ───────────────────────────────────────────────────────────
export type StepResult = { job: JobRow; busy?: boolean };

export async function advanceJob(jobId: string, budgetMs = STEP_BUDGET_MS): Promise<StepResult> {
  const started = Date.now();
  // Kira (lease): aynı işi aynı anda iki istek yürütmesin (tarayıcı + cron).
  const nowIso = new Date().toISOString();
  const { data: leased } = await supabaseAdmin.from("backup_logs")
    .update({ lease_until: new Date(started + LEASE_MS).toISOString() })
    .eq("id", jobId).eq("status", "running").or(`lease_until.is.null,lease_until.lt.${nowIso}`)
    .select("*").maybeSingle();

  if (!leased) {
    const { data: cur } = await supabaseAdmin.from("backup_logs").select("*").eq("id", jobId).single();
    return { job: cur as JobRow, busy: true };
  }

  const job = leased as JobRow;
  const warnings: string[] = Array.isArray(job.warnings) ? [...job.warnings] : [];
  const state: JobState = job.state ?? {};

  const persist = async () => {
    const { error } = await supabaseAdmin.from("backup_logs").update({
      state, warnings, phase: job.phase, file_name: job.file_name, updated_at: new Date().toISOString(),
    }).eq("id", job.id);
    if (error) throw new Error(`Durum kaydedilemedi: ${error.message}`);
  };

  try {
    if (Date.now() - new Date(job.started_at).getTime() > STALE_JOB_MS) {
      throw new Error("İş çok uzun sürdüğü için iptal edildi (3 saat)");
    }
    const conn = await getConnection(job.tenant_id);
    if (!conn) throw new Error("Google Drive bağlantısı yok");
    const drive = await driveFor(conn);
    const folders = await ensureFolders(drive, conn);
    const ctx: Ctx = {
      job, state, tenantId: job.tenant_id, drive, folders, deadline: started + budgetMs, persist,
      warn: (m) => { if (!warnings.includes(m) && warnings.length < 50) warnings.push(m); },
    };

    if (job.operation === "backup") await stepBackup(ctx, conn, warnings);
    else await stepRestore(ctx, warnings);
  } catch (e) {
    const message = (e as Error).message ?? String(e);
    await supabaseAdmin.from("backup_logs").update({
      status: "failed", error_message: message.slice(0, 2000), finished_at: new Date().toISOString(),
      state, warnings, lease_until: null, updated_at: new Date().toISOString(),
    }).eq("id", job.id);
  }

  await supabaseAdmin.from("backup_logs").update({ lease_until: null }).eq("id", job.id);
  const { data: fresh } = await supabaseAdmin.from("backup_logs").select("*").eq("id", job.id).single();
  return { job: fresh as JobRow };
}

async function stepBackup(ctx: Ctx, conn: Connection, warnings: string[]) {
  const { job, state } = ctx;
  if (job.phase === "json") {
    const company = state.json!.tenantName ?? (state.json!.tenantName = await tenantCompanyName(ctx.tenantId));
    if (!(await runJsonPhase(ctx, company))) return;
    job.phase = "excel";
    await ctx.persist();
  }
  if (job.phase === "excel") {
    if (!(await runExcelPhase(ctx))) return;
    job.phase = "documents";
    await ctx.persist();
  }
  if (job.phase === "documents") {
    if (!(await runDocumentsPhase(ctx))) return;
    job.phase = "finalize";
    await ctx.persist();
  }
  if (job.phase === "finalize") {
    await finalizeBackup(ctx, conn, warnings);
  }
}

async function finalizeBackup(ctx: Ctx, conn: Connection, warnings: string[]) {
  const { job, state, drive, folders } = ctx;
  const js = state.json!;
  const now = new Date();
  const runDate = isoDateIn(now);
  const [y, m, d] = runDate.split("-").map(Number);

  // Aynı adlı eski dosyaları temizle (gece yedeği aynı gün yeniden alınırsa tek kopya kalsın).
  for (const f of await drive.findInFolder(folders.Daily, js.name)) {
    if (f.id !== js.fileId) await drive.delete(f.id).catch(() => {});
  }

  // Gece 00:00 yedeği önceki günün kapanışını içerir: ayın/yılın 1'inde bir önceki dönemin arşivi oluşur.
  // Arşivler Drive'da sunucu tarafında kopyalanır (yeniden indirme yok) ve ASLA otomatik silinmez.
  if (job.trigger === "cron" && d === 1) {
    const prev = new Date(Date.UTC(y, m - 2, 1));
    const monthName = `${prev.getUTCFullYear()}-${String(prev.getUTCMonth() + 1).padStart(2, "0")}.json`;
    await archiveCopy(drive, js.fileId!, folders.Monthly, monthName);
    if (m === 1) await archiveCopy(drive, js.fileId!, folders.Yearly, `${y - 1}.json`);
  }

  // Daily klasöründe yalnızca bu sistemin adlandırdığı eski dosyalar rotasyona girer.
  const cutoff = Date.now() - DAILY_RETENTION_DAYS * 86_400_000;
  const nameRe = /^\d{4}-\d{2}-\d{2}(_\d{6}-manuel)?\.json$/;
  for (const f of await drive.list(`'${folders.Daily}' in parents and trashed = false`, "createdTime asc")) {
    if (nameRe.test(f.name) && f.id !== js.fileId && f.createdTime && new Date(f.createdTime).getTime() < cutoff) {
      await drive.delete(f.id).catch(() => {});
    }
  }

  // Reports: her yedeğin özeti
  const report = {
    date: runDate, trigger: job.trigger, startedAt: job.started_at, finishedAt: now.toISOString(),
    jsonFile: js.name, jsonBytes: js.size, recordCounts: js.counts, expectedCounts: js.expected,
    skippedTables: js.skipped, excel: state.excelFiles ?? [], documentsUploaded: state.docsCount ?? 0, warnings,
  };
  await drive.upsertSmall(folders.Reports, `backup-report-${runDate}.json`, Buffer.from(JSON.stringify(report, null, 2)), "application/json");

  await supabaseAdmin.from("backup_logs").update({
    status: "success", phase: "done", finished_at: now.toISOString(), file_name: js.name, file_size: js.size,
    drive_file_id: js.fileId, record_counts: js.counts, warnings, state, error_message: null, updated_at: now.toISOString(),
  }).eq("id", job.id);
  await supabaseAdmin.from("backup_connections").update({ status: "connected", last_error: null }).eq("tenant_id", conn.tenant_id);
}

async function archiveCopy(drive: Drive, sourceId: string, folderId: string, name: string) {
  const old = await drive.findInFolder(folderId, name);
  await drive.copy(sourceId, name, folderId);
  for (const f of old) await drive.delete(f.id).catch(() => {});
}

async function stepRestore(ctx: Ctx, warnings: string[]) {
  const { job, state } = ctx;
  const outcome = await runRestoreStep(ctx);
  job.phase = state.restore!.stage;
  if (!outcome.finished) { await ctx.persist(); return; }

  const rs = state.restore!;
  const failed = outcome.verification.length > 0;
  await supabaseAdmin.from("backup_logs").update({
    status: failed ? "failed" : "success", phase: "done", finished_at: new Date().toISOString(),
    record_counts: rs.restored, warnings, state, updated_at: new Date().toISOString(),
    error_message: failed ? `Doğrulama uyuşmazlığı: ${outcome.verification.join("; ")}` : null,
  }).eq("id", job.id);
}

// ── Cron ───────────────────────────────────────────────────────────────────
export type TickSummary = { resumed: number; started: number; failedStale: number };

/**
 * Cron her çağrıldığında: (1) takılı kalmış işleri kapatır, (2) devam eden işleri sürdürür,
 * (3) İstanbul saatiyle 00:00–06:00 arasında bugün yedeği olmayan bağlı tenantlar için yedek başlatır.
 * Süre dolarsa kalan işler bir sonraki çağrıya (5 dk sonra) kalır.
 */
export async function cronTick(budgetMs = 270_000): Promise<TickSummary> {
  const t0 = Date.now();
  const summary: TickSummary = { resumed: 0, started: 0, failedStale: 0 };
  const left = () => budgetMs - (Date.now() - t0);

  const { data: stale } = await supabaseAdmin.from("backup_logs")
    .update({ status: "failed", error_message: "İş zaman aşımına uğradı (3 saatten uzun sürdü)", finished_at: new Date().toISOString(), lease_until: null })
    .eq("status", "running").lt("started_at", new Date(Date.now() - STALE_JOB_MS).toISOString()).select("id");
  summary.failedStale = stale?.length ?? 0;

  const { data: running } = await supabaseAdmin.from("backup_logs").select("id,tenant_id").eq("status", "running").order("started_at");
  for (const j of running ?? []) {
    if (left() < 30_000) return summary;
    await advanceJob(j.id, Math.min(STEP_BUDGET_MS, left() - 15_000));
    summary.resumed++;
  }

  const now = new Date();
  if (hourIn(now) >= 6) return summary;
  const today = isoDateIn(now);
  const { data: conns } = await supabaseAdmin.from("backup_connections").select("tenant_id").eq("status", "connected");
  for (const c of conns ?? []) {
    if (left() < 30_000) return summary;
    const { data: recent } = await supabaseAdmin.from("backup_logs").select("status,started_at")
      .eq("tenant_id", c.tenant_id).eq("operation", "backup").eq("trigger", "cron")
      .gte("started_at", new Date(Date.now() - 20 * 3_600_000).toISOString()).order("started_at", { ascending: false });
    if (recent?.some((r) => r.status !== "failed")) continue; // bugün başarılı/çalışan yedek var
    // Başarısız geceler: en çok 3 kez, aralarında en az 30 dk bekleyerek yeniden dene.
    if (recent && (recent.length >= 3 || (recent[0] && Date.now() - new Date(recent[0].started_at).getTime() < 30 * 60_000))) continue;
    try {
      const job = await startBackup(c.tenant_id, "cron");
      summary.started++;
      await advanceJob(job.id, Math.min(STEP_BUDGET_MS, left() - 15_000));
    } catch (e) {
      console.error(`[backup] ${today} tenant ${c.tenant_id} başlatılamadı:`, (e as Error).message);
    }
  }
  return summary;
}
