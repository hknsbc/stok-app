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
};

const PLANS: Record<AppMode, Plan[]> = {
  pet: [
    {
      key: "pro",
      name: "Pro",
      color: "#f97316",
      price: "9.000 TL + KDV",
      priceNote: "yıllık · ~750 TL/ay",
      contactUs: false,
      popular: false,
      features: [
        "Sınırsız pet kartı",
        "Aşı takvimi & SKT takibi",
        "WhatsApp otomatik hatırlatma",
        "Müşteri sadakat kartı",
        "Ürün & stok yönetimi",
        "Satış & alış kayıtları",
        "Mobil uyumlu panel",
        "1 kullanıcı",
      ],
    },
    {
      key: "business",
      name: "Business",
      color: "#10b981",
      price: "Fiyat Alınız",
      contactUs: true,
      popular: true,
      features: [
        "Pro plan dahil",
        "Çoklu kullanıcı",
        "Zincir mağaza yönetimi",
        "Gelişmiş raporlar & analizler",
        "Özel WhatsApp kampanyaları",
        "Öncelikli destek",
      ],
    },
    {
      key: "enterprise",
      name: "Enterprise",
      color: "#8b5cf6",
      price: "Fiyat Alınız",
      contactUs: true,
      popular: false,
      features: [
        "Business plan dahil",
        "Özel modüller",
        "Özel entegrasyonlar",
        "Eğitim + onboarding",
        "SLA garantisi",
      ],
    },
  ],

  vet: [
    {
      key: "pro",
      name: "Pro",
      color: "#0ea5e9",
      price: "2.490 TL + KDV",
      priceNote: "aylık",
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
      price: "990 TL + KDV",
      priceNote: "aylık",
      contactUs: false,
      popular: false,
      features: [
        "Sınırsız ürün & stok",
        "Barkod okuyucu desteği",
        "Alış & satış yönetimi",
        "Cari hesap takibi",
        "Temel raporlar",
        "Mobil uyumlu panel",
        "1 kullanıcı",
      ],
    },
    {
      key: "business",
      name: "Business",
      color: "#10b981",
      price: "2.490 TL + KDV",
      priceNote: "aylık",
      contactUs: false,
      popular: true,
      features: [
        "Pro plan dahil",
        "Çoklu kullanıcı (10'a kadar)",
        "Çoklu şube desteği",
        "Gelişmiş raporlar & analizler",
        "REST API erişimi",
        "Toplu veri import / export",
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
  const { t } = useLang();
  const { mode } = useMode();
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);

  const plans = PLANS[mode] ?? PLANS.stok;
  const meta = MODE_META[mode] ?? MODE_META.stok;

  useEffect(() => {
    const fetchPlan = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase.from("profiles").select("plan").eq("id", user.id).single();
      if (!error && data?.plan) setCurrentPlan(data.plan);
    };
    fetchPlan();
  }, []);

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

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  {!plan.contactUs && mode === "pet" && plan.key === "pro" && (
                    <div style={{ marginTop: 6, display: "inline-block", padding: "3px 10px", background: "#fef3c7", borderRadius: 12, fontSize: 12, fontWeight: 600, color: "#d97706" }}>
                      KDV dahil değildir
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul style={{ listStyle: "none", padding: 0, margin: 0, marginBottom: 24, flex: 1 }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 9, fontSize: 14, color: "#374151" }}>
                      <span style={{ color: plan.color, fontWeight: "bold", fontSize: 15, flexShrink: 0, marginTop: 1 }}>✓</span>
                      {f}
                    </li>
                  ))}
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
