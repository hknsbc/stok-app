import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireTenantUser } from "@/lib/backup/auth";
import { driveFor, getConnection } from "@/lib/backup/engine";
import { googleConfigured } from "@/lib/backup/google";
import { publicJob } from "@/lib/backup/api";
import type { JobRow } from "@/lib/backup/types";

export const maxDuration = 60;

export async function GET(request: Request) {
  const user = await requireTenantUser(request);
  if (!user) return Response.json({ error: "Yetkisiz erişim" }, { status: 401 });

  const configured = googleConfigured();
  const conn = await getConnection(user.tenantId);

  const [{ data: logs }, { data: lastOk }] = await Promise.all([
    supabaseAdmin.from("backup_logs").select("*").eq("tenant_id", user.tenantId).order("started_at", { ascending: false }).limit(15),
    supabaseAdmin.from("backup_logs").select("*").eq("tenant_id", user.tenantId).eq("operation", "backup").eq("status", "success")
      .order("finished_at", { ascending: false }).limit(1),
  ]);

  // Drive'a gerçekten ulaşılabiliyor mu + kota (en iyi çaba; hata durumunda bağlantı "hata" gösterilir).
  let drive: { reachable: boolean; usedBytes?: number; limitBytes?: number | null; folderUrl?: string; error?: string } | null = null;
  if (conn && configured) {
    try {
      const d = await driveFor(conn);
      const about = await d.about();
      drive = {
        reachable: true, usedBytes: about.used, limitBytes: about.limit,
        folderUrl: conn.root_folder_id ? `https://drive.google.com/drive/folders/${conn.root_folder_id}` : undefined,
      };
    } catch (e) {
      drive = { reachable: false, error: (e as Error).message };
    }
  }

  const jobs = (logs ?? []) as JobRow[];
  const running = jobs.find((j) => j.status === "running");
  return Response.json({
    configured,
    connected: Boolean(conn),
    connection: conn ? { email: conn.google_email, status: conn.status, lastError: conn.last_error } : null,
    drive,
    lastBackup: lastOk?.[0] ? publicJob(lastOk[0] as JobRow) : null,
    running: running ? publicJob(running) : null,
    logs: jobs.map(publicJob),
  });
}
