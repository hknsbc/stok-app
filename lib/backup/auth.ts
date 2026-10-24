import { supabaseAdmin } from "@/lib/supabase-admin";

export type TenantUser = { userId: string; tenantId: string };

// Oturum açmış, aktif ve bir tenant'a bağlı kullanıcıyı doğrular (Bearer token).
// Uygulamada rol alanı yok (plan başına tek kullanıcı), tenant'ın hesabı = firma sahibi.
export async function requireTenantUser(request: Request): Promise<TenantUser | null> {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return null;
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;
  const { data: profile } = await supabaseAdmin
    .from("profiles").select("tenant_id,is_active").eq("id", user.id).single();
  if (!profile?.tenant_id || profile.is_active === false) return null;
  return { userId: user.id, tenantId: profile.tenant_id };
}

// Cron uç noktası: Vercel Cron `Authorization: Bearer $CRON_SECRET` gönderir.
export function isCronAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("Authorization") === `Bearer ${secret}`;
}
