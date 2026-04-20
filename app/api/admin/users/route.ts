import { supabaseAdmin, verifyAdmin } from "@/lib/supabase-admin";

export async function GET(request: Request) {
  const admin = await verifyAdmin(request);
  if (!admin) return Response.json({ error: "Yetkisiz erisim" }, { status: 403 });

  // Tüm auth kullanıcılarını çek
  const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  if (authError) return Response.json({ error: authError.message }, { status: 500 });

  // Tüm profilleri çek (service role RLS bypass)
  const { data: profiles } = await supabaseAdmin.from("profiles").select("*");
  const profileMap: Record<string, any> = {};
  for (const p of profiles ?? []) profileMap[p.id] = p;

  const result = users.map((u) => ({
    id: u.id,
    email: u.email ?? "-",
    created_at: u.created_at,
    is_active: profileMap[u.id]?.is_active ?? true,
    is_superadmin: profileMap[u.id]?.is_superadmin ?? false,
    subscription_starts_at: profileMap[u.id]?.subscription_starts_at ?? null,
    subscription_expires_at: profileMap[u.id]?.subscription_expires_at ?? null,
    plan: profileMap[u.id]?.plan ?? null,
  }));

  return Response.json(result);
}
