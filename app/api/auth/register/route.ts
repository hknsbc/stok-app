import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "Geçersiz istek." }, { status: 400 });

  const { email, password, mode, phone, companyName, selectedPlan, marketingConsent, requiredConsent } = body as {
    email?: string;
    password?: string;
    mode?: string;
    phone?: string;
    companyName?: string;
    selectedPlan?: "temel" | "profesyonel";
    marketingConsent?: boolean;
    requiredConsent?: boolean;
  };

  // Zorunlu onay backend'de de kontrol edilir — client tarafı sadece UX için.
  if (requiredConsent !== true) {
    return Response.json(
      { error: "Kullanım Şartları, Gizlilik Politikası ve Aydınlatma Metni onayı zorunludur." },
      { status: 400 }
    );
  }
  if (!email || !password) {
    return Response.json({ error: "E-posta ve şifre zorunludur." }, { status: 400 });
  }

  const plan = selectedPlan ?? "temel";
  const isPro = plan === "profesyonel";
  const isPetTrial = mode === "pet" || mode === "vet";
  const isStok = mode === "stok";

  const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { plan, has_branches: isPro },
  });
  if (createError || !created.user) {
    return Response.json({ error: createError?.message ?? "Kayıt oluşturulamadı." }, { status: 400 });
  }

  const userId = created.user.id;
  const now = new Date().toISOString();
  const trialExpiry = new Date();
  trialExpiry.setDate(trialExpiry.getDate() + 7);

  await supabaseAdmin.from("profiles").update({
    plan,
    is_active: isPetTrial,
    marketing_consent: Boolean(marketingConsent),
    privacy_terms_accepted_at: now,
    kvkk_accepted_at: now,
    ...(isStok ? { phone: phone ?? null, company_name: companyName ?? null } : {}),
    ...(isPetTrial ? { subscription_expires_at: trialExpiry.toISOString() } : {}),
  }).eq("id", userId);

  if (isPro) {
    const { data: profile } = await supabaseAdmin.from("profiles").select("tenant_id").eq("id", userId).single();
    if (profile?.tenant_id) {
      await supabaseAdmin.from("tenants").update({ has_branches: true }).eq("id", profile.tenant_id);
    }
  }

  return Response.json({ ok: true, autoLogin: isPetTrial });
}
