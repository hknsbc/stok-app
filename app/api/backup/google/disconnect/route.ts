import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireTenantUser } from "@/lib/backup/auth";
import { decryptSecret } from "@/lib/backup/crypto";
import { getConnection, getRunningJob } from "@/lib/backup/engine";
import { revokeToken } from "@/lib/backup/google";

// Bağlantıyı keser. Drive'daki yedek dosyalarına DOKUNULMAZ.
export async function POST(request: Request) {
  const user = await requireTenantUser(request);
  if (!user) return Response.json({ error: "Yetkisiz erişim" }, { status: 401 });
  if (await getRunningJob(user.tenantId)) {
    return Response.json({ error: "Devam eden bir yedekleme/geri yükleme var. Bitmesini bekleyin." }, { status: 409 });
  }
  const conn = await getConnection(user.tenantId);
  if (conn) {
    try { await revokeToken(decryptSecret(conn.refresh_token_enc)); } catch { /* token çözülemese de bağlantı silinir */ }
    await supabaseAdmin.from("backup_connections").delete().eq("tenant_id", user.tenantId);
  }
  return Response.json({ ok: true });
}
