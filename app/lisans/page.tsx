"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import { useLang } from "@/lib/LangContext";

type LicenseInfo = {
  plan: string | null;
  subscription_status: string | null;
  license_expires_at: string | null;
  email: string | null;
  tenant_id: string | null;
};

export default function Lisans() {
  const { t, lang } = useLang();
  const [info, setInfo] = useState<LicenseInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLisans = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from("profiles")
        .select("plan, subscription_status, license_expires_at, tenant_id")
        .eq("id", user.id)
        .single();
      setInfo({
        plan: data?.plan ?? null,
        subscription_status: data?.subscription_status ?? null,
        license_expires_at: data?.license_expires_at ?? null,
        email: user.email ?? null,
        tenant_id: data?.tenant_id ?? null,
      });
      setLoading(false);
    };
    fetchLisans();
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
        <h1 style={{ fontSize: 28, fontWeight: "bold", marginBottom: 24 }}>{t.lisansTitle}</h1>

        {loading ? (
          <p style={{ color: "#888" }}>{t.loading}</p>
        ) : (
          <div style={{ maxWidth: 600 }}>
            <div style={{ background: "white", borderRadius: 16, padding: 32, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: statusColor(info?.subscription_status ?? null),
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 24,
                }}>
                  {info?.subscription_status === "active" ? "✓" : "!"}
                </div>
                <div>
                  <p style={{ fontSize: 13, color: "#888", margin: 0 }}>{t.lisansStatusLabel}</p>
                  <p style={{ fontSize: 20, fontWeight: "bold", color: statusColor(info?.subscription_status ?? null), margin: 0 }}>
                    {statusLabel(info?.subscription_status ?? null)}
                  </p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ background: "#f9fafb", padding: 16, borderRadius: 10 }}>
                  <p style={{ color: "#888", fontSize: 12, margin: "0 0 4px" }}>{t.planLabel}</p>
                  <p style={{ fontWeight: "bold", margin: 0, textTransform: "capitalize" }}>
                    {info?.plan ?? t.temelPlanName}
                  </p>
                </div>
                <div style={{ background: "#f9fafb", padding: 16, borderRadius: 10 }}>
                  <p style={{ color: "#888", fontSize: 12, margin: "0 0 4px" }}>{t.email}</p>
                  <p style={{ fontWeight: "bold", margin: 0, fontSize: 13 }}>
                    {info?.email ?? "-"}
                  </p>
                </div>
                <div style={{ background: "#f9fafb", padding: 16, borderRadius: 10 }}>
                  <p style={{ color: "#888", fontSize: 12, margin: "0 0 4px" }}>{t.validUntil}</p>
                  <p style={{ fontWeight: "bold", margin: 0 }}>
                    {info?.license_expires_at
                      ? new Date(info.license_expires_at).toLocaleDateString(locale)
                      : t.unlimited}
                  </p>
                </div>
                <div style={{ background: "#f9fafb", padding: 16, borderRadius: 10 }}>
                  <p style={{ color: "#888", fontSize: 12, margin: "0 0 4px" }}>{t.tenantId}</p>
                  <p style={{ fontWeight: "bold", margin: 0, fontSize: 11, wordBreak: "break-all" }}>
                    {info?.tenant_id ?? "-"}
                  </p>
                </div>
              </div>
            </div>

            <a href="/abonelik" style={{
              display: "inline-block",
              padding: "12px 28px",
              background: "#6366f1",
              color: "white",
              borderRadius: 10,
              textDecoration: "none",
              fontWeight: "bold",
            }}>
              {t.upgradePlan}
            </a>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
