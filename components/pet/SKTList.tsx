"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";

type Product = {
  id: string;
  name: string;
  barcode: string | null;
  stock: number;
  category: string | null;
  expiry_date: string | null;
};

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(dateStr);
  return Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function rowColor(days: number): { bg: string; border: string; badge: string } {
  if (days < 0) return { bg: "#fef2f2", border: "#fecaca", badge: "#ef4444" };
  if (days <= 30) return { bg: "#fff7ed", border: "#fed7aa", badge: "#f97316" };
  if (days <= 60) return { bg: "#fefce8", border: "#fde68a", badge: "#eab308" };
  return { bg: "#f0fdf4", border: "#bbf7d0", badge: "#16a34a" };
}

function badgeLabel(days: number): string {
  if (days < 0) return `${Math.abs(days)}g geçti`;
  if (days === 0) return "Bugün";
  return `${days} gün`;
}

export default function SKTList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<"all" | "expired" | "soon" | "ok">("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("products")
        .select("id, name, barcode, stock, category, expiry_date")
        .not("expiry_date", "is", null)
        .order("expiry_date", { ascending: true });
      if (data) setProducts(data);
      setLoading(false);
    };
    fetch();
  }, []);

  const withDays = products.map((p) => ({ ...p, days: daysUntil(p.expiry_date!) }));

  const filtered = withDays.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode ?? "").includes(search) ||
      (p.category ?? "").toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === "expired") return p.days < 0;
    if (filter === "soon") return p.days >= 0 && p.days <= 60;
    if (filter === "ok") return p.days > 60;
    return true;
  });

  const counts = {
    expired: withDays.filter((p) => p.days < 0).length,
    soon30: withDays.filter((p) => p.days >= 0 && p.days <= 30).length,
    soon60: withDays.filter((p) => p.days > 30 && p.days <= 60).length,
    ok: withDays.filter((p) => p.days > 60).length,
  };

  const filterBtn = (key: typeof filter, label: string, color: string, count: number) => (
    <button
      onClick={() => setFilter(key)}
      style={{
        padding: "7px 16px", borderRadius: 20, border: "none", cursor: "pointer",
        fontWeight: 600, fontSize: 13,
        background: filter === key ? color : "#f3f4f6",
        color: filter === key ? "white" : "#555",
      }}
    >
      {label} <span style={{ opacity: 0.8 }}>({count})</span>
    </button>
  );

  return (
    <DashboardLayout>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: "bold", marginBottom: 8 }}>⚠️ SKT Takibi</h1>
        <p style={{ color: "#888", marginBottom: 20, fontSize: 14 }}>
          Son kullanma tarihi atanmış ürünlerin takibi
        </p>

        {/* Summary badges */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 18px", textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: "bold", color: "#ef4444" }}>{counts.expired}</div>
            <div style={{ fontSize: 12, color: "#888" }}>Süresi Geçmiş</div>
          </div>
          <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10, padding: "10px 18px", textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: "bold", color: "#f97316" }}>{counts.soon30}</div>
            <div style={{ fontSize: 12, color: "#888" }}>≤30 Gün</div>
          </div>
          <div style={{ background: "#fefce8", border: "1px solid #fde68a", borderRadius: 10, padding: "10px 18px", textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: "bold", color: "#eab308" }}>{counts.soon60}</div>
            <div style={{ fontSize: 12, color: "#888" }}>31–60 Gün</div>
          </div>
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "10px 18px", textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: "bold", color: "#16a34a" }}>{counts.ok}</div>
            <div style={{ fontSize: 12, color: "#888" }}>60+ Gün</div>
          </div>
        </div>

        {/* Filter + Search */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          {filterBtn("all", "Tümü", "#6366f1", withDays.length)}
          {filterBtn("expired", "Geçmiş", "#ef4444", counts.expired)}
          {filterBtn("soon", "Yaklaşan", "#f97316", counts.soon30 + counts.soon60)}
          {filterBtn("ok", "Yeterli", "#16a34a", counts.ok)}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ürün adı, barkod veya kategori..."
            style={{
              marginLeft: "auto", padding: "7px 14px", border: "1px solid #e5e7eb",
              borderRadius: 8, fontSize: 13, outline: "none", minWidth: 220,
            }}
          />
        </div>

        {loading ? (
          <p style={{ color: "#888" }}>Yükleniyor...</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map((p) => {
              const colors = rowColor(p.days);
              return (
                <div key={p.id} style={{
                  background: colors.bg, border: `1px solid ${colors.border}`,
                  borderRadius: 10, padding: "12px 16px",
                  display: "flex", alignItems: "center", gap: 14,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: "#888", display: "flex", gap: 10 }}>
                      {p.barcode && <span>🔖 {p.barcode}</span>}
                      {p.category && <span>📦 {p.category}</span>}
                      <span>Stok: {p.stock}</span>
                      <span>SKT: {p.expiry_date}</span>
                    </div>
                  </div>
                  <span style={{
                    padding: "4px 14px", borderRadius: 20, fontSize: 13,
                    fontWeight: "bold", background: colors.badge, color: "white",
                    flexShrink: 0,
                  }}>
                    {badgeLabel(p.days)}
                  </span>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ padding: 32, textAlign: "center", color: "#aaa", fontSize: 14, background: "white", borderRadius: 12 }}>
                Bu filtreye uygun ürün bulunamadı.
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
