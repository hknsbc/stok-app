"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";

export default function AnaSayfa() {
  const [toplamCari, setToplamCari] = useState<number | null>(null);
  const [stokDegeri, setStokDegeri] = useState<number | null>(null);
  const [buAySatis, setBuAySatis] = useState<number | null>(null);
  const [lisansDurumu, setLisansDurumu] = useState<string>("Yukleniyor");

  useEffect(() => {
    const fetchData = async () => {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];

      const [cariRes, stokRes, satisRes, userRes] = await Promise.all([
        supabase.from("customers").select("id", { count: "exact", head: true }),
        supabase.from("products").select("price, stock"),
        supabase.from("sales").select("total").gte("date", monthStart),
        supabase.auth.getUser(),
      ]);

      if (cariRes.count !== null) setToplamCari(cariRes.count);

      if (stokRes.data) {
        const deger = stokRes.data.reduce((acc, p) => acc + Number(p.price || 0) * Number(p.stock || 0), 0);
        setStokDegeri(deger);
      }

      if (satisRes.data) {
        const toplam = satisRes.data.reduce((acc, s) => acc + Number(s.total), 0);
        setBuAySatis(toplam);
      }

      const user = userRes.data.user;
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("subscription_status, plan")
          .eq("id", user.id)
          .single();
        if (profile?.subscription_status === "active") {
          setLisansDurumu(`Aktif${profile.plan ? ` (${profile.plan})` : ""}`);
        } else if (profile?.subscription_status) {
          setLisansDurumu(profile.subscription_status);
        } else {
          setLisansDurumu("Aktif");
        }
      } else {
        setLisansDurumu("-");
      }
    };
    fetchData();
  }, []);

  const fmt = (val: number | null, suffix = "") =>
    val === null ? "..." : `${val.toLocaleString("tr-TR")}${suffix}`;

  return (
    <DashboardLayout>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: "bold", marginBottom: 24 }}>Ana Sayfa</h1>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
          <div style={{ background: "white", padding: 24, borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <p style={{ color: "#888", fontSize: 13, marginBottom: 8 }}>Toplam Cari</p>
            <p style={{ fontSize: 28, fontWeight: "bold" }}>{fmt(toplamCari)}</p>
          </div>
          <div style={{ background: "white", padding: 24, borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <p style={{ color: "#888", fontSize: 13, marginBottom: 8 }}>Stok Degeri</p>
            <p style={{ fontSize: 28, fontWeight: "bold", color: "#6366f1" }}>{fmt(stokDegeri, " TL")}</p>
          </div>
          <div style={{ background: "white", padding: 24, borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <p style={{ color: "#888", fontSize: 13, marginBottom: 8 }}>Bu Ay Satislar</p>
            <p style={{ fontSize: 28, fontWeight: "bold", color: "#10b981" }}>{fmt(buAySatis, " TL")}</p>
          </div>
          <div style={{ background: "white", padding: 24, borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <p style={{ color: "#888", fontSize: 13, marginBottom: 8 }}>Lisans</p>
            <p style={{ fontSize: 20, fontWeight: "bold", color: lisansDurumu.startsWith("Aktif") ? "#10b981" : "#f59e0b" }}>{lisansDurumu}</p>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          <a href="/cari" style={{ background: "white", padding: 24, borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", textDecoration: "none", color: "inherit" }}>
            <h2 style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>Cari</h2>
            <p style={{ color: "#888", fontSize: 13 }}>Musteri ve tedarikci kartlarini yonetin</p>
            <button style={{ marginTop: 16, padding: "8px 20px", background: "#6366f1", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}>Ac</button>
          </a>
          <a href="/stok" style={{ background: "white", padding: 24, borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", textDecoration: "none", color: "inherit" }}>
            <h2 style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>Stok</h2>
            <p style={{ color: "#888", fontSize: 13 }}>Urun envanterini takip edin</p>
            <button style={{ marginTop: 16, padding: "8px 20px", background: "#6366f1", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}>Ac</button>
          </a>
          <a href="/satislar" style={{ background: "white", padding: 24, borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", textDecoration: "none", color: "inherit" }}>
            <h2 style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>Satislar</h2>
            <p style={{ color: "#888", fontSize: 13 }}>Satis islemlerini yonetin</p>
            <button style={{ marginTop: 16, padding: "8px 20px", background: "#6366f1", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}>Ac</button>
          </a>
        </div>
      </div>
    </DashboardLayout>
  );
}
