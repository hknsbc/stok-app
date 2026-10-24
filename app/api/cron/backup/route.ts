import { isCronAuthorized } from "@/lib/backup/auth";
import { cronTick } from "@/lib/backup/engine";

export const maxDuration = 300;

// Vercel Cron (vercel.json). Her çağrıda devam eden işleri sürdürür; İstanbul 00:00–06:00 arasında
// bugün yedeği olmayan bağlı firmalar için gece yedeğini başlatır.
export async function GET(request: Request) {
  if (!isCronAuthorized(request)) return Response.json({ error: "Yetkisiz" }, { status: 401 });
  const summary = await cronTick();
  return Response.json({ ok: true, ...summary });
}
