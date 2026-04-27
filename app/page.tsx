"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import { useLang } from "@/lib/LangContext";

export default function AnaSayfa() {
  const { t, lang } = useLang();
  const [toplamCari, setToplamCari] = useState<number | null>(null);
  const [stokDegeri, setStokDegeri] = useState<number | null>(null);
  const [buAySatis, setBuAySatis] = useState<number | null>(null);
  const [lisansDurumu, setLisansDurumu] = useState<string>("...");
  const [firmaAdi, setFirmaAdi] = useState<string | null>(null);

  const fetchStats = useCallback(async (tid: string) => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString().split("T")[0];

    const [cariRes, stokRes, satisRes] = await Promise.all([
      supabase.from("customers").select("id", { count: "exact", head: true }).eq("tenant_id", tid),
      supabase.from("products").select("price, stock").eq("tenant_id", tid),
      supabase.from("sales").select("total").eq("tenant_id", tid).gte("date", monthStart),
    ]);

    if (cariRes.count !== null) setToplamCari(cariRes.count);

    if (stokRes.data) {
      const deger = stokRes.data.reduce(
        (acc, p) => acc + Number(p.price || 0) * Number(p.stock || 0), 0
      );
      setStokDegeri(deger);
    }

    if (satisRes.data) {
      const toplam = satisRes.data.reduce((acc, s) => acc + Number(s.total || 0), 0);
      setBuAySatis(toplam);
    }
  }, []);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_status, plan, company_name, tenant_id")
        .eq("id", user.id)
        .single();

      const tid = profile?.tenant_id as string | undefined;
      if (!tid) return;

      setFirmaAdi(profile?.company_name ?? user.email ?? null);

      if (profile?.subscription_status === "active") {
        setLisansDurumu(`${t.statusActive}${profile.plan ? ` (${profile.plan})` : ""}`);
      } else if (profile?.subscription_status) {
        setLisansDurumu(profile.subscription_status);
      } else {
        setLisansDurumu(t.statusActive);
      }

      await fetchStats(tid);

      channel = supabase
        .channel("dashboard-live")
        .on("postgres_changes", { event: "*", schema: "public", table: "products", filter: `tenant_id=eq.${tid}` }, () => fetchStats(tid))
        .on("postgres_changes", { event: "*", schema: "public", table: "sales", filter: `tenant_id=eq.${tid}` }, () => fetchStats(tid))
        .on("postgres_changes", { event: "*", schema: "public", table: "customers", filter: `tenant_id=eq.${tid}` }, () => fetchStats(tid))
        .subscribe();
    };

    init();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [lang, fetchStats]);

  const locale = lang === "tr" ? "tr-TR" : "en-US";
  const fmt = (val: number | null, suffix = "") =>
    val === null ? "..." : `${val.toLocaleString(locale)}${suffix}`;

  return (
    <DashboardLayout>
      <div>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: "bold" }}>{t.dashTitle}</h1>
          {firmaAdi && (
            <p style={{ fontSize: 16, color: "#6366f1", fontWeight: "500", marginTop: 4 }}>
              {firmaAdi}
            </p>
          )}
        </div>

        <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
          <div style={{ background: "white", padding: 24, borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <p style={{ color: "#888", fontSize: 13, marginBottom: 8 }}>{t.totalCustomers}</p>
            <p style={{ fontSize: 28, fontWeight: "bold" }}>{fmt(toplamCari)}</p>
          </div>
          <div style={{ background: "white", padding: 24, borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <p style={{ color: "#888", fontSize: 13, marginBottom: 8 }}>{t.stockValue}</p>
            <p style={{ fontSize: 28, fontWeight: "bold", color: "#6366f1" }}>{fmt(stokDegeri, " TL")}</p>
          </div>
          <div style={{ background: "white", padding: 24, borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <p style={{ color: "#888", fontSize: 13, marginBottom: 8 }}>{t.monthlySales}</p>
            <p style={{ fontSize: 28, fontWeight: "bold", color: "#10b981" }}>{fmt(buAySatis, " TL")}</p>
          </div>
          <div style={{ background: "white", padding: 24, borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <p style={{ color: "#888", fontSize: 13, marginBottom: 8 }}>{t.licenseLabel}</p>
            <p style={{ fontSize: 20, fontWeight: "bold", color: lisansDurumu.startsWith(t.statusActive) ? "#10b981" : "#f59e0b" }}>
              {lisansDurumu}
            </p>
          </div>
        </div>

        <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          <a href="/cari" style={{ background: "white", padding: 24, borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", textDecoration: "none", color: "inherit" }}>
            <h2 style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>{t.menuCari}</h2>
            <p style={{ color: "#888", fontSize: 13 }}>{t.customerDesc}</p>
            <button style={{ marginTop: 16, padding: "8px 20px", background: "#6366f1", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}>{t.open}</button>
          </a>
          <a href="/stok" style={{ background: "white", padding: 24, borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", textDecoration: "none", color: "inherit" }}>
            <h2 style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>{t.menuStok}</h2>
            <p style={{ color: "#888", fontSize: 13 }}>{t.stockDesc}</p>
            <button style={{ marginTop: 16, padding: "8px 20px", background: "#6366f1", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}>{t.open}</button>
          </a>
          <a href="/satislar" style={{ background: "white", padding: 24, borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", textDecoration: "none", color: "inherit" }}>
            <h2 style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>{t.menuSatislar}</h2>
            <p style={{ color: "#888", fontSize: 13 }}>{t.salesDesc}</p>
            <button style={{ marginTop: 16, padding: "8px 20px", background: "#6366f1", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}>{t.open}</button>
          </a>
        </div>
      </div>
    </DashboardLayout>
  );
}
