"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import { useLang } from "@/lib/LangContext";
import { useMode } from "@/lib/ModeContext";
import type { AppMode } from "@/lib/getMode";

const TEKLIF_MAIL = "mailto:pazarlama@marssoft.com.tr?subject=Fiyat%20Teklifi%20Talebi";

type Plan = {
  key: string;
  name: string;
  color: string;
  price: string;
  priceNote?: string;
  contactUs: boolean;
  popular: boolean;
  features: string[];
  soonFeatures?: string[];
};

const PLANS: Record<AppMode, Plan[]> = {
  pet: [
    {
      key: "profesyonel",
      name: "Profesyonel",
      color: "#f97316",
      price: "15.588 TL + KDV",
      priceNote: "yıllık · ~1.299 TL/ay",
      contactUs: false,
      popular: false,
      features: [
        "Cari yönetimi",
        "Ürün & stok yönetimi",
        "Alışlar & satışlar",
        "Pet Kartları",
        "SKT takibi",
        "Temel raporlar",
        "Barkod okutma",
        "1 kullanıcı",
        "Kasa / gün sonu raporu",
        "WhatsApp bildirimi",
      ],
      soonFeatures: ["Kasa / gün sonu raporu", "WhatsApp bildirimi"],
    },
    {
      key: "is",
      name: "İş Planı",
      color: "#10b981",
      price: "Fiyat Alınız",
      contactUs: true,
      popular: true,
      features: [
        "Profesyonel plan dahil",
        "Çoklu şube yönetimi",
        "Şubeler arası stok transferi",
        "Merkezi raporlama",
        "Kullanıcı yetkilendirme (kasiyer/müdür/sahip)",
        "Hedef / performans takibi",
      ],
      soonFeatures: [
        "Çoklu şube yönetimi",
        "Şubeler arası stok transferi",
        "Merkezi raporlama",
        "Kullanıcı yetkilendirme (kasiyer/müdür/sahip)",
        "Hedef / performans takibi",
      ],
    },
  ],

  vet: [
    {
      key: "pro",
      name: "Pro",
      color: "#0ea5e9",
      price: "9.000 TL + KDV",
      priceNote: "yıllık · ~750 TL/ay",
      contactUs: false,
      popular: false,
      features: [
        "Sınırsız hasta kartı",
        "Muayene & tedavi kayıtları",
        "Aşı takvimi yönetimi",
        "İlaç stok & SKT takibi",
        "WhatsApp otomatik hatırlatma",
        "Reçete oluşturma",
        "Faturalama",
        "1 veteriner hesabı",
      ],
    },
    {
      key: "business",
      name: "Business",
      color: "#8b5cf6",
      price: "Fiyat Alınız",
      contactUs: true,
      popular: true,
      features: [
        "Pro plan dahil",
        "Çoklu veteriner & personel",
        "Çoklu şube / klinik",
        "Laboratuvar entegrasyonu",
        "Batch & seri no takibi",
        "Gelişmiş raporlar",
        "Öncelikli destek",
      ],
    },
    {
      key: "enterprise",
      name: "Enterprise",
      color: "#f59e0b",
      price: "Fiyat Alınız",
      contactUs: true,
      popular: false,
      features: [
        "Business plan dahil",
        "Hastane / zincir klinik özel modüller",
        "Özel entegrasyonlar & API",
        "Eğitim + onboarding",
        "99.9% uptime SLA",
      ],
    },
  ],

  stok: [
    {
      key: "pro",
      name: "Pro",
      color: "#6366f1",
      price: "2.990 TL + KDV",
      priceNote: "aylık",
      contactUs: false,
      popular: true,
      features: [
        "500 adet ürüne kadar stok takibi",
        "Barkod okuyucu desteği",
        "Alış & satış yönetimi",
        "Cari hesap takibi",
        "Temel raporlar",
        "Mobil uyumlu panel",
        "1 kullanıcı",
        "Aylık servis pakete dahil",
      ],
    },
    {
      key: "enterprise",
      name: "Enterprise",
      color: "#f59e0b",
      price: "Fiyat Alınız",
      contactUs: true,
      popular: false,
      features: [
        "Pro plan dahil",
        "Sınırsız kullanıcı & şube",
        "Özel modüller & entegrasyonlar",
        "ERP / muhasebe entegrasyonu",
        "Eğitim + onboarding",
        "SLA garantisi",
      ],
    },
  ],

  marine: [
    {
      key: "pro",
      name: "Pro",
      color: "#06b6d4",
      price: "99 USD",
      priceNote: "aylık",
      contactUs: false,
      popular: false,
      features: [
        "Sınırsız tekne kartı",
        "Bakım geçmişi & takibi",
        "Parça stok yönetimi",
        "Seri numarası takibi",
        "İşçilik + malzeme maliyeti",
        "WhatsApp hatırlatma",
        "Mobil uyumlu panel",
        "3 kolonlu dashboard",
      ],
    },
    {
      key: "business",
      name: "Business",
      color: "#10b981",
      price: "199 USD",
      priceNote: "aylık",
      contactUs: false,
      popular: true,
      features: [
        "Pro plan dahil",
        "Çoklu kullanıcı (10'a kadar)",
        "Çoklu şube / marina",
        "Gelişmiş raporlar",
        "API erişimi",
        "Öncelikli destek",
      ],
    },
    {
      key: "enterprise",
      name: "Enterprise",
      color: "#f59e0b",
      price: "Fiyat Alınız",
      priceNote: "399–699 USD / ay",
      contactUs: true,
      popular: false,
      features: [
        "Business plan dahil",
        "Marina / tersane özel modüller",
        "Özel entegrasyonlar",
        "Eğitim + onboarding",
        "SLA garantisi",
      ],
    },
  ],
};

const PET_PLAN_NAMES: Record<string, string> = {
  profesyonel: "Profesyonel Plan",
  is: "İş Planı",
  temel: "Deneme",
};

type LicenseInfo = {
  plan: string | null;
  subscription_status: string | null;
  license_expires_at: string | null;
  subscription_expires_at: string | null;
  email: string | null;
  tenant_id: string | null;
};

const MODE_META: Record<AppMode, { title: string; subtitle: string; badge: string }> = {
  pet: {
    title: "Petshop Abonelik Planları",
    subtitle: "İşletmenize en uygun planı seçin. Yıllık ödemede en avantajlı fiyat.",
    badge: "🐾 Petshop Yazılımı",
  },
  vet: {
    title: "Veteriner Klinik Planları",
    subtitle: "Klinik büyüklüğünüze göre ölçeklenen esnek planlar.",
    badge: "🏥 Veteriner Yazılımı",
  },
  stok: {
    title: "Stok Yönetimi Planları",
    subtitle: "İşletmenize özel stok ve satış çözümleri.",
    badge: "📦 Stok Yazılımı",
  },
  marine: {
    title: "Marine Abonelik Planları",
    subtitle: "Marinalar ve tekne servis atölyeleri için profesyonel çözümler.",
    badge: "⚓ Marine Yazılımı",
  },
};

export default function Abonelik() {
  const { t, lang } = useLang();
  const { mode } = useMode();
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [license, setLicense] = useState<LicenseInfo | null>(null);
  const [licenseLoading, setLicenseLoading] = useState(true);

  const plans = PLANS[mode] ?? PLANS.stok;
  const meta = MODE_META[mode] ?? MODE_META.stok;

  useEffect(() => {
    const fetchPlan = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLicenseLoading(false); return; }
      const { data, error } = await supabase
        .from("profiles")
        .select("plan, subscription_status, license_expires_at, subscription_expires_at, tenant_id")
        .eq("id", user.id)
        .single();
      if (!error && data?.plan) setCurrentPlan(data.plan);
      setLicense({
        plan: data?.plan ?? null,
        subscription_status: data?.subscription_status ?? null,
        license_expires_at: data?.license_expires_at ?? null,
        subscription_expires_at: data?.subscription_expires_at ?? null,
        email: user.email ?? null,
        tenant_id: data?.tenant_id ?? null,
      });
      setLicenseLoading(false);
    };
    fetchPlan();
  }, []);

  const statusColor = (status: string | null) => {
    if (status === "active") return "#10b981";
    if (status === "expired") return "#ef4444";
    return "#f59e0b";
  };

  const statusLabel = (status: string | null) => {
    if (status === "active") return t.statusActive;
    if (status === "expired") return t.statusExpired;
    if (status === "trial") return t.statusTrial;
    return t.statusUnknown;
  };

  const locale = lang === "tr" ? "tr-TR" : "en-US";

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "inline-block", padding: "4px 14px", borderRadius: 20, background: "#f3f4f6", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 12 }}>
            {meta.badge}
          </div>
          <h1 style={{ fontSize: 28, fontWeight: "bold", marginBottom: 8 }}>{meta.title}</h1>
          <p style={{ color: "#888", fontSize: 15 }}>{meta.subtitle}</p>
        </div>

        {/* Lisans durumu */}
        {!licenseLoading && license && (
          <div style={{ background: "white", borderRadius: 16, padding: 28, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22, flexWrap: "wrap" }}>
              <div style={{
                width: 48, height: 48, borderRadius: "50%",
                background: statusColor(license.subscription_status),
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "white", flexShrink: 0,
              }}>
                {license.subscription_status === "active" ? "✓" : "!"}
              </div>
              <div>
                <p style={{ fontSize: 12, color: "#888", margin: 0 }}>{t.lisansStatusLabel}</p>
                <p style={{ fontSize: 18, fontWeight: "bold", color: statusColor(license.subscription_status), margin: 0 }}>
                  {statusLabel(license.subscription_status)}
                </p>
              </div>
            </div>

            <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
              <div style={{ background: "#f9fafb", padding: 14, borderRadius: 10 }}>
                <p style={{ color: "#888", fontSize: 11, margin: "0 0 4px" }}>{t.planLabel}</p>
                <p style={{ fontWeight: "bold", margin: 0, fontSize: 13, textTransform: "capitalize" }}>
                  {mode === "pet" ? (PET_PLAN_NAMES[license.plan ?? ""] ?? "Deneme") : (license.plan ?? t.temelPlanName)}
                </p>
              </div>
              <div style={{ background: "#f9fafb", padding: 14, borderRadius: 10 }}>
                <p style={{ color: "#888", fontSize: 11, margin: "0 0 4px" }}>{t.email}</p>
                <p style={{ fontWeight: "bold", margin: 0, fontSize: 12, wordBreak: "break-all" }}>{license.email ?? "-"}</p>
              </div>
              <div style={{ background: "#f9fafb", padding: 14, borderRadius: 10 }}>
                <p style={{ color: "#888", fontSize: 11, margin: "0 0 4px" }}>{t.validUntil}</p>
                <p style={{ fontWeight: "bold", margin: 0, fontSize: 13 }}>
                  {(() => {
                    const expiresAt = license.subscription_expires_at ?? license.license_expires_at;
                    if (!expiresAt) return t.unlimited;
                    const d = new Date(expiresAt);
                    const isTrialSoon = mode === "pet" && (d.getTime() - Date.now()) < 3 * 24 * 60 * 60 * 1000;
                    return (
                      <span style={{ color: isTrialSoon ? "#ef4444" : "inherit" }}>
                        {d.toLocaleDateString(locale)}
                        {mode === "pet" && license.plan === "temel" && " (Deneme)"}
                      </span>
                    );
                  })()}
                </p>
              </div>
              <div style={{ background: "#f9fafb", padding: 14, borderRadius: 10 }}>
                <p style={{ color: "#888", fontSize: 11, margin: "0 0 4px" }}>{t.tenantId}</p>
                <p style={{ fontWeight: "bold", margin: 0, fontSize: 10, wordBreak: "break-all" }}>{license.tenant_id ?? "-"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Plan cards */}
        <div className={plans.length <= 2 ? "grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl" : "grid grid-cols-1 md:grid-cols-3 gap-6"}>
          {plans.map((plan) => {
            const isCurrent = currentPlan === plan.key;
            return (
              <div
                key={plan.key}
                style={{
                  background: "white",
                  borderRadius: 16,
                  padding: 28,
                  boxShadow: plan.popular
                    ? `0 4px 24px ${plan.color}26`
                    : "0 1px 6px rgba(0,0,0,0.08)",
                  border: plan.popular ? `2px solid ${plan.color}` : "2px solid transparent",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div style={{
                    position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)",
                    background: plan.color, color: "white", fontSize: 11, fontWeight: "bold",
                    padding: "4px 16px", borderRadius: 20, whiteSpace: "nowrap",
                  }}>
                    ✦ EN POPÜLER
                  </div>
                )}

                {/* Plan name */}
                <h2 style={{ fontSize: 19, fontWeight: "bold", marginBottom: 6, color: "#1e1b4b" }}>
                  {plan.name}
                </h2>

                {/* Price */}
                <div style={{ marginBottom: 24, minHeight: 68 }}>
                  <div style={{ fontSize: plan.contactUs ? 22 : 26, fontWeight: "bold", color: plan.color }}>
                    {plan.price}
                  </div>
                  {plan.priceNote && (
                    <div style={{ fontSize: 13, color: "#888", marginTop: 3 }}>{plan.priceNote}</div>
                  )}
                </div>

                {/* Features */}
                <ul style={{ listStyle: "none", padding: 0, margin: 0, marginBottom: 24, flex: 1 }}>
                  {plan.features.map((f) => {
                    const isHighlight = f.toLowerCase().includes("aylık servis");
                    return (
                      <li key={f} style={{
                        display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 9, fontSize: 14,
                        color: isHighlight ? plan.color : "#374151", fontWeight: isHighlight ? 700 : 400,
                      }}>
                        <span style={{ color: plan.color, fontWeight: "bold", fontSize: 15, flexShrink: 0, marginTop: 1 }}>
                          {isHighlight ? "⭐" : "✓"}
                        </span>
                        {f}
                      </li>
                    );
                  })}
                </ul>

                {/* CTA */}
                {isCurrent ? (
                  <div style={{ width: "100%", padding: "10px 0", background: "#e5e7eb", color: "#555", borderRadius: 8, textAlign: "center", fontSize: 14, fontWeight: "bold" }}>
                    {t.currentPlan}
                  </div>
                ) : plan.contactUs ? (
                  <a
                    href={`${TEKLIF_MAIL}&body=${encodeURIComponent(`Merhaba,\n\n${plan.name} planı hakkında bilgi almak istiyorum.\n\nDomain: ${mode}.marssoft.com.tr`)}`}
                    style={{
                      display: "block", width: "100%", padding: "11px 0",
                      background: plan.color, color: "white", borderRadius: 8,
                      textAlign: "center", textDecoration: "none", fontSize: 14, fontWeight: "bold",
                    }}
                  >
                    Fiyat Alın →
                  </a>
                ) : (
                  <button
                    style={{
                      width: "100%", padding: "11px 0",
                      background: plan.color, color: "white", border: "none",
                      borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: "bold",
                    }}
                  >
                    Başla →
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom note */}
        <div style={{ marginTop: 36, padding: "16px 24px", background: "#f9fafb", borderRadius: 12, border: "1px solid #e5e7eb" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 32px", justifyContent: "center" }}>
            {["SSL güvenlik", "Günlük yedekleme", "7/24 teknik destek", "Ücretsiz güncellemeler", "İptal garantisi"].map((f) => (
              <span key={f} style={{ fontSize: 13, color: "#555", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "#10b981", fontWeight: "bold" }}>✓</span> {f}
              </span>
            ))}
          </div>
          <p style={{ textAlign: "center", marginTop: 12, fontSize: 12, color: "#888" }}>
            Tüm planlar için destek: <a href="mailto:pazarlama@marssoft.com.tr" style={{ color: "#6366f1", textDecoration: "none" }}>pazarlama@marssoft.com.tr</a>
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
