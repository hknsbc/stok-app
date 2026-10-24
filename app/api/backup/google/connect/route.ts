import { requireTenantUser } from "@/lib/backup/auth";
import { signState } from "@/lib/backup/crypto";
import { buildAuthUrl, googleConfigured } from "@/lib/backup/google";

export async function GET(request: Request) {
  const user = await requireTenantUser(request);
  if (!user) return Response.json({ error: "Yetkisiz erişim" }, { status: 401 });
  if (!googleConfigured()) {
    return Response.json({ error: "Google entegrasyonu yapılandırılmamış (GOOGLE_CLIENT_ID/SECRET/REDIRECT_URI, BACKUP_ENCRYPTION_KEY)." }, { status: 503 });
  }
  return Response.json({ url: buildAuthUrl(signState({ tenantId: user.tenantId, userId: user.userId })) });
}
