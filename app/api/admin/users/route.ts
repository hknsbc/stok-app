import { supabaseAdmin, verifyAdmin, listAllUsers } from "@/lib/supabase-admin";

export async function GET(request: Request) {
  const admin = await verifyAdmin(request);
  if (!admin) return Response.json({ error: "Yetkisiz erisim" }, { status: 403 });

  // Tüm auth kullanıcılarını çek
  const { users, error: authError } = await listAllUsers();
  if (authError || !users) return Response.json({ error: authError?.message ?? "Kullanıcılar alınamadı" }, { status: 500 });

  // Tüm profilleri çek (service role RLS bypass)
  const { data: profiles } = await supabaseAdmin.from("profiles").select("*");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profileMap: Record<string, Record<string, any>> = {};
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
    company_name: profileMap[u.id]?.company_name ?? null,
    phone: profileMap[u.id]?.phone ?? null,
  }));

  return Response.json(result);
}
