import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireTenantUser } from "@/lib/backup/auth";
import { advanceJob, driveFor, ensureFolders, getConnection, getRunningJob, startJob } from "@/lib/backup/engine";
import { publicJob } from "@/lib/backup/api";

export const maxDuration = 300;

const CONFIRM = "GERİ YÜKLE";

// Tek tıkla geri yükleme. İlk çağrı: { fileId, mode, confirm }. Sonraki çağrılar (gövdesiz) işi sürdürür.
export async function POST(request: Request) {
  const user = await requireTenantUser(request);
  if (!user) return Response.json({ error: "Yetkisiz erişim" }, { status: 401 });

  const conn = await getConnection(user.tenantId);
  if (!conn || conn.status !== "connected") return Response.json({ error: "Google Drive bağlı değil" }, { status: 400 });

  const body = (await request.json().catch(() => ({}))) as { fileId?: string; mode?: string; confirm?: string };
  let job = await getRunningJob(user.tenantId);

  if (!job) {
    if (!body.fileId) return Response.json({ error: "Yedek dosyası seçilmedi" }, { status: 400 });
    const mode = body.mode === "merge" ? "merge" : "replace";
    if (body.confirm?.trim().toLocaleUpperCase("tr-TR") !== CONFIRM) {
      return Response.json({ error: `Onay için "${CONFIRM}" yazın.` }, { status: 400 });
    }
    try {
      const drive = await driveFor(conn);
      const folders = await ensureFolders(drive, conn);
      const meta = await drive.get(body.fileId);
      // Yalnızca bu tenant'ın yedek klasörlerindeki .json dosyaları geri yüklenebilir.
      const allowed = [folders.Daily, folders.Monthly, folders.Yearly];
      if (!meta.name.endsWith(".json") || !meta.parents?.some((p) => allowed.includes(p))) {
        return Response.json({ error: "Geçersiz yedek dosyası" }, { status: 400 });
      }
      if (mode === "replace") {
        // Mevcut veri silineceği için: son 1 saat içinde bir güvenlik yedeği şart (veri varsa).
        const { data: ok } = await supabaseAdmin.from("backup_logs").select("id").eq("tenant_id", user.tenantId)
          .eq("operation", "backup").eq("status", "success").gte("finished_at", new Date(Date.now() - 3_600_000).toISOString()).limit(1);
        const { count } = await supabaseAdmin.from("products").select("id", { count: "exact", head: true }).eq("tenant_id", user.tenantId);
        if (!ok?.length && (count ?? 0) > 0) {
          return Response.json({
            error: "Mevcut verinin üzerine yazılacak. Önce \"Şimdi Yedek Al\" ile güvenlik yedeği alın (son 1 saat içinde).",
            needsBackup: true,
          }, { status: 409 });
        }
      }
      job = await startJob(user.tenantId, "restore", "manual", {
        restore: {
          fileId: body.fileId, fileName: meta.name, mode, stage: "init", purgeIdx: 0, byteOffset: 0, curTable: null,
          productsStart: null, reconOffset: 0, restored: {}, docIdx: 0, docsRestored: 0,
        },
      }, meta.name);
    } catch (e) {
      return Response.json({ error: (e as Error).message }, { status: 502 });
    }
  }

  const { job: after, busy } = await advanceJob(job.id);
  return Response.json({ job: publicJob(after), busy: Boolean(busy), done: after.status !== "running" });
}
