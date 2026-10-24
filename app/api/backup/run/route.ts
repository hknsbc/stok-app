import { requireTenantUser } from "@/lib/backup/auth";
import { advanceJob, getConnection, getRunningJob, startBackup } from "@/lib/backup/engine";
import { publicJob } from "@/lib/backup/api";
import { rateLimit } from "@/lib/rate-limit";

export const maxDuration = 300;

// "Şimdi Yedek Al": ilk çağrı işi başlatır ve bir adım yürütür; istemci `done` olana dek
// aynı uç noktayı tekrar çağırır (her çağrı ≤ ~4 dk). Gece yedeği aynı motoru cron ile sürdürür.
export async function POST(request: Request) {
  const user = await requireTenantUser(request);
  if (!user) return Response.json({ error: "Yetkisiz erişim" }, { status: 401 });

  const conn = await getConnection(user.tenantId);
  if (!conn || conn.status !== "connected") {
    return Response.json({ error: "Google Drive bağlı değil veya yeniden bağlanmalı." }, { status: 400 });
  }

  let running = await getRunningJob(user.tenantId);
  if (!running) {
    if (!rateLimit(`backup-start:${user.tenantId}`, 6, 60 * 60 * 1000)) {
      return Response.json({ error: "Saatte en fazla 6 manuel yedek alınabilir." }, { status: 429 });
    }
    running = await startBackup(user.tenantId, "manual");
  }
  const { job, busy } = await advanceJob(running.id);
  return Response.json({ job: publicJob(job), busy: Boolean(busy), done: job.status !== "running" });
}
