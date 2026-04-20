"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";

const TEKLIF_MAIL = "mailto:pazarlama@marssoft.com.tr?subject=Fiyat%20Teklifi%20Talebi";

const plans = [
  {
    key: "temel",
    name: "Temel Plan",
    color: "#6366f1",
    priceLabel: "2.500 TL",
    period: "/ay",
    teklifAl: false,
    popular: false,
    features: [
      "1 Kullanici",
      "500 Urun",
      "Stok Takibi",
      "Temel Raporlar",
      "Barkod Destegi",
      "E-posta Destek",
    ],
  },
  {
    key: "profesyonel",
    name: "Profesyonel Plan",
    color: "#10b981",
    priceLabel: null,
    period: null,
    teklifAl: true,
    popular: true,
    features: [
      "5 Kullanici",
      "Sinirsiz Urun",
      "Stok Takibi",
      "Gelismis Raporlar",
      "Cari Yonetimi",
      "Barkod Destegi",
      "Oncelikli Destek",
    ],
  },
  {
    key: "kurumsal",
    name: "Kurumsal Plan",
    color: "#f59e0b",
    priceLabel: null,
    period: null,
    teklifAl: true,
    popular: false,
    features: [
      "Sinirsiz Kullanici",
      "Sinirsiz Urun",
      "Tam Raporlama",
      "Cari Yonetimi",
      "Barkod Destegi",
      "API Erisimi",
      "7/24 Destek",
      "Ozel Entegrasyon",
    ],
  },
];

export default function Abonelik() {
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlan = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data } = await supabase.from("profiles").select("plan, tenant_id").eq("id", user.id).single();
      if (data?.plan) setCurrentPlan(data.plan);
      if (data?.tenant_id) setTenantId(data.tenant_id);
    };
    fetchPlan();
  }, []);

  const handleUpgradeToPro = async () => {
    if (!userId) return;
    if (!confirm("Profesyonel Plan'a geçmek istediğinizden emin misiniz? Bu işlem şube yönetimini aktif edecektir.")) return;
    setUpgrading(true);
    await supabase.from("profiles").update({ plan: "profesyonel" }).eq("id", userId);
    if (tenantId) {
      await supabase.from("tenants").update({ has_branches: true }).eq("id", tenantId);
    }
    setCurrentPlan("profesyonel");
    setUpgrading(false);
    window.location.reload();
  };

  return (
    <DashboardLayout>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: "bold", marginBottom: 8 }}>Abonelik Planlari</h1>
        <p style={{ color: "#888", marginBottom: 32 }}>Isletmenize uygun plani secin</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, maxWidth: 920 }}>
          {plans.map((plan) => {
            const isCurrent = currentPlan === plan.key;
            return (
              <div key={plan.key} style={{
                background: "white",
                borderRadius: 16,
                padding: 28,
                boxShadow: plan.popular ? "0 4px 24px rgba(16,185,129,0.15)" : "0 1px 4px rgba(0,0,0,0.08)",
                border: plan.popular ? "2px solid #10b981" : "2px solid transparent",
                position: "relative",
                display: "flex",
                flexDirection: "column",
              }}>
                {plan.popular && (
                  <div style={{
                    position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)",
                    background: "#10b981", color: "white", fontSize: 11, fontWeight: "bold",
                    padding: "4px 16px", borderRadius: 20, whiteSpace: "nowrap",
                  }}>
                    POPULER
                  </div>
                )}

                <h2 style={{ fontSize: 19, fontWeight: "bold", marginBottom: 12, color: "#1e1b4b" }}>{plan.name}</h2>

                {/* Fiyat alanı */}
                <div style={{ marginBottom: 24, minHeight: 52 }}>
                  {plan.priceLabel ? (
                    <div>
                      <span style={{ fontSize: 34, fontWeight: "bold", color: plan.color }}>{plan.priceLabel}</span>
                      <span style={{ color: "#888", fontSize: 14 }}>{plan.period}</span>
                    </div>
                  ) : (
                    <div style={{ background: "#f9fafb", borderRadius: 10, padding: "10px 14px", display: "inline-block" }}>
                      <p style={{ margin: 0, fontSize: 13, color: "#555", fontWeight: 500 }}>Fiyat Teklifi Icin Bize Ulasin</p>
                    </div>
                  )}
                </div>

                {/* Özellikler */}
                <ul style={{ listStyle: "none", padding: 0, margin: 0, marginBottom: 24, flex: 1 }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9, fontSize: 14, color: "#374151" }}>
                      <span style={{ color: plan.color, fontWeight: "bold", fontSize: 15 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* Buton */}
                {isCurrent ? (
                  <div style={{ width: "100%", padding: "10px 0", background: "#e5e7eb", color: "#555", borderRadius: 8, textAlign: "center", fontSize: 14, fontWeight: "bold" }}>
                    Mevcut Planınız
                  </div>
                ) : plan.key === "profesyonel" && currentPlan === "temel" ? (
                  <button
                    onClick={handleUpgradeToPro}
                    disabled={upgrading}
                    style={{
                      width: "100%", padding: "11px 0",
                      background: plan.color, color: "white", border: "none",
                      borderRadius: 8, cursor: upgrading ? "not-allowed" : "pointer",
                      fontSize: 14, fontWeight: "bold", opacity: upgrading ? 0.7 : 1,
                    }}
                  >
                    {upgrading ? "Güncelleniyor..." : "Profesyonel Plan'a Geç"}
                  </button>
                ) : plan.teklifAl ? (
                  <a href={TEKLIF_MAIL} style={{
                    display: "block", width: "100%", padding: "11px 0",
                    background: plan.color, color: "white", borderRadius: 8,
                    textAlign: "center", textDecoration: "none", fontSize: 14, fontWeight: "bold",
                  }}>
                    Teklif Al
                  </a>
                ) : (
                  <button style={{
                    width: "100%", padding: "11px 0",
                    background: plan.color, color: "white", border: "none",
                    borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: "bold",
                  }}>
                    Hemen Basla
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
