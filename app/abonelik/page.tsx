"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import { useLang } from "@/lib/LangContext";

const TEKLIF_MAIL = "mailto:pazarlama@marssoft.com.tr?subject=Fiyat%20Teklifi%20Talebi";

export default function Abonelik() {
  const { t } = useLang();
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);

  const plans = [
    {
      key: "pro",
      name: "Pro",
      color: "#06b6d4",
      price: "99 USD / month",
      contactUs: false,
      popular: false,
      features: [
        "Tekne kartı",
        "Bakım geçmişi",
        "Parça stokları",
        "Seri numarası takibi",
        "İşçilik + malzeme maliyeti",
        "WhatsApp hatırlatma",
        "Mobil uyum",
        "3 kolonlu dashboard",
      ],
    },
    {
      key: "business",
      name: "Business",
      color: "#10b981",
      price: "199 USD / month",
      contactUs: false,
      popular: true,
      features: [
        "Pro plan dahil",
        "Çoklu kullanıcı",
        "Çoklu şube",
        "Gelişmiş raporlar",
      ],
    },
    {
      key: "enterprise",
      name: "Enterprise",
      color: "#f59e0b",
      price: "399–699 USD / month",
      contactUs: true,
      popular: false,
      features: [
        "Business plan dahil",
        "Marina/tersane özel modüller",
        "Özel entegrasyonlar",
        "Eğitim + onboarding",
      ],
    },
  ];

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
        <h1 style={{ fontSize: 28, fontWeight: "bold", marginBottom: 8 }}>{t.abonelikTitle}</h1>
        <p style={{ color: "#888", marginBottom: 32 }}>{t.abonelikSubtitle}</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24, maxWidth: 640 }}>
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

                <div style={{ marginBottom: 24, minHeight: 64 }}>
                  <span style={{ fontSize: 26, fontWeight: "bold", color: plan.color }}>{plan.price}</span>
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
                ) : plan.contactUs ? (
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
