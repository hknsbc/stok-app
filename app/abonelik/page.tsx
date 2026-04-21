"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import { useLang } from "@/lib/LangContext";

const TEKLIF_MAIL = "mailto:pazarlama@marssoft.com.tr?subject=Fiyat%20Teklifi%20Talebi";

export default function Abonelik() {
  const { t, lang } = useLang();
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);

  const plans = [
    {
      key: "temel",
      name: t.temelPlanName,
      color: "#6366f1",
      priceLabel: "2.500 TL",
      period: lang === "tr" ? "/ay" : "/mo",
      teklifAl: false,
      popular: false,
      features: t.temelFeatures,
    },
    {
      key: "profesyonel",
      name: t.proPlanName,
      color: "#10b981",
      priceLabel: null,
      period: null,
      teklifAl: true,
      popular: true,
      features: t.proFeatures,
    },
    {
      key: "kurumsal",
      name: t.kurumPlanName,
      color: "#f59e0b",
      priceLabel: null,
      period: null,
      teklifAl: true,
      popular: false,
      features: t.kurumFeatures,
    },
  ];

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
    if (!confirm(t.upgradeConfirm)) return;
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
        <h1 style={{ fontSize: 28, fontWeight: "bold", marginBottom: 8 }}>{t.abonelikTitle}</h1>
        <p style={{ color: "#888", marginBottom: 32 }}>{t.abonelikSubtitle}</p>

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
                    {t.popular}
                  </div>
                )}

                <h2 style={{ fontSize: 19, fontWeight: "bold", marginBottom: 12, color: "#1e1b4b" }}>{plan.name}</h2>

                <div style={{ marginBottom: 24, minHeight: 52 }}>
                  {plan.priceLabel ? (
                    <div>
                      <span style={{ fontSize: 34, fontWeight: "bold", color: plan.color }}>{plan.priceLabel}</span>
                      <span style={{ color: "#888", fontSize: 14 }}>{plan.period}</span>
                    </div>
                  ) : (
                    <div style={{ background: "#f9fafb", borderRadius: 10, padding: "10px 14px", display: "inline-block" }}>
                      <p style={{ margin: 0, fontSize: 13, color: "#555", fontWeight: 500 }}>{t.contactUs}</p>
                    </div>
                  )}
                </div>

                <ul style={{ listStyle: "none", padding: 0, margin: 0, marginBottom: 24, flex: 1 }}>
                  {(plan.features as readonly string[]).map((f) => (
                    <li key={f} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9, fontSize: 14, color: "#374151" }}>
                      <span style={{ color: plan.color, fontWeight: "bold", fontSize: 15 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <div style={{ width: "100%", padding: "10px 0", background: "#e5e7eb", color: "#555", borderRadius: 8, textAlign: "center", fontSize: 14, fontWeight: "bold" }}>
                    {t.currentPlan}
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
                    {upgrading ? t.upgrading : t.upgradeToPro}
                  </button>
                ) : plan.teklifAl ? (
                  <a href={TEKLIF_MAIL} style={{
                    display: "block", width: "100%", padding: "11px 0",
                    background: plan.color, color: "white", borderRadius: 8,
                    textAlign: "center", textDecoration: "none", fontSize: 14, fontWeight: "bold",
                  }}>
                    {t.getQuote}
                  </a>
                ) : (
                  <button style={{
                    width: "100%", padding: "11px 0",
                    background: plan.color, color: "white", border: "none",
                    borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: "bold",
                  }}>
                    {t.getStarted}
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
