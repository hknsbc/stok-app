import { supabaseAdmin } from "@/lib/supabase-admin";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PLANS = ["temel", "profesyonel"] as const;
const MODES = ["stok", "pet", "vet", "marine"] as const;

export async function POST(request: Request) {
  // IP başına saatte 5 kayıt denemesi
  if (!rateLimit(`register:${clientIp(request)}`, 5, 60 * 60 * 1000)) {
    return Response.json({ error: "Çok fazla deneme. Lütfen daha sonra tekrar deneyin." }, { status: 429 });
  }

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

  if (typeof email !== "string" || typeof password !== "string" || !EMAIL_RE.test(email.trim()) || email.length > 254) {
    return Response.json({ error: "Geçerli bir e-posta adresi girin." }, { status: 400 });
  }
  if (password.length < 8 || password.length > 128) {
    return Response.json({ error: "Şifre en az 8 karakter olmalıdır." }, { status: 400 });
  }
  if (selectedPlan !== undefined && !PLANS.includes(selectedPlan)) {
    return Response.json({ error: "Geçersiz plan." }, { status: 400 });
  }
  if (mode !== undefined && !MODES.includes(mode as (typeof MODES)[number])) {
    return Response.json({ error: "Geçersiz mod." }, { status: 400 });
  }
  if ((phone && phone.length > 30) || (companyName && companyName.length > 200)) {
    return Response.json({ error: "Geçersiz alan uzunluğu." }, { status: 400 });
  }

  const plan = selectedPlan ?? "temel";
  const isPro = plan === "profesyonel";
  const isPetTrial = mode === "pet" || mode === "vet";
  const isStok = mode === "stok";

  if (isStok && !phone?.trim()) {
    return Response.json({ error: "Telefon numarası zorunludur." }, { status: 400 });
  }

  const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: email.trim(),
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

  const { error: profileError } = await supabaseAdmin.from("profiles").update({
    plan,
    is_active: isPetTrial,
    marketing_consent: Boolean(marketingConsent),
    privacy_terms_accepted_at: now,
    kvkk_accepted_at: now,
    ...(isStok ? { phone: phone ?? null, company_name: companyName ?? null } : {}),
    ...(isPetTrial ? { subscription_expires_at: trialExpiry.toISOString() } : {}),
  }).eq("id", userId);

  // Profil güncellenemezse hesap varsayılan (aktif) değerlerle kalmasın: kullanıcıyı geri al.
  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(userId);
    return Response.json({ error: "Kayıt tamamlanamadı. Lütfen tekrar deneyin." }, { status: 500 });
  }

  if (isPro) {
    const { data: profile } = await supabaseAdmin.from("profiles").select("tenant_id").eq("id", userId).single();
    if (profile?.tenant_id) {
      await supabaseAdmin.from("tenants").update({ has_branches: true }).eq("id", profile.tenant_id);
    }
  }

  return Response.json({ ok: true, autoLogin: isPetTrial });
}
