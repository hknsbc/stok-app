import { supabaseAdmin, verifyAdmin } from "@/lib/supabase-admin";

// Plan fiyatları (aylık TL)
const PLAN_PRICES: Record<string, number> = {
  temel: 1990,
  profesyonel: 1990,
};

export async function GET(request: Request) {
  const admin = await verifyAdmin(request);
  if (!admin) return Response.json({ error: "Yetkisiz erisim" }, { status: 403 });

  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const { data: profiles } = await supabaseAdmin.from("profiles").select("*");
  const profileMap: Record<string, any> = {};
  for (const p of profiles ?? []) profileMap[p.id] = p;

  const now = new Date();
  const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  let activeCount = 0;
  let expiredCount = 0;
  let estimatedMRR = 0;
  const expiringSoon: { id: string; email: string; daysLeft: number; plan: string | null; expiresAt: string }[] = [];
  const planCounts: Record<string, number> = {};

  for (const u of users) {
    const p = profileMap[u.id];
    if (!p) continue;

    const plan: string | null = p.plan ?? null;
    if (plan) {
      planCounts[plan] = (planCounts[plan] ?? 0) + 1;
    }

    const expiry = p.subscription_expires_at ? new Date(p.subscription_expires_at) : null;

    if (expiry) {
      const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysLeft > 0) {
        activeCount++;
        if (plan && PLAN_PRICES[plan]) {
          estimatedMRR += PLAN_PRICES[plan];
        }
        if (expiry <= in30) {
          expiringSoon.push({
            id: u.id,
            email: u.email ?? "-",
            daysLeft,
            plan,
            expiresAt: p.subscription_expires_at,
          });
        }
      } else {
        expiredCount++;
      }
    }
  }

  // En yakın bitiş tarihine göre sırala
  expiringSoon.sort((a, b) => a.daysLeft - b.daysLeft);

  return Response.json({
    totalUsers: users.length,
    activeUsers: activeCount,
    expiredUsers: expiredCount,
    estimatedMRR,
    expiringSoon,
    planCounts,
  });
}
