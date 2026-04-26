"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import { useRouter } from "next/navigation";

type Part = {
  id: string;
  name: string;
  barcode: string | null;
  category: string | null;
  stock: number;
  price: number;
  selling_price: number;
};

const MARINE_CATEGORIES = [
  "Motor Parçaları", "Elektrik / Elektronik", "Fiberglass / Epoksi / Boya",
  "Sarf Malzemeleri", "Güverte Donanımı", "Emniyet Ekipmanları",
  "Hidrolik", "Yakıt Sistemi", "Diğer",
];

const th: React.CSSProperties = {
  padding: "10px 14px", textAlign: "left", fontSize: 12, color: "#64748b",
  fontWeight: 700, borderBottom: "2px solid #e2e8f0", background: "#f8fafc",
  textTransform: "uppercase", letterSpacing: 0.4,
};
const td: React.CSSProperties = { padding: "11px 14px", fontSize: 13, borderBottom: "1px solid #f1f5f9" };

export default function PartsStockList() {
  const router = useRouter();
  const [parts, setParts] = useState<Part[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("products")
      .select("id, name, barcode, category, stock, price, selling_price")
      .in("category", MARINE_CATEGORIES)
      .order("category")
      .then(({ data }) => { if (data) setParts(data); setLoading(false); });
  }, []);

  const filtered = parts.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode ?? "").toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "all" || p.category === category;
    return matchSearch && matchCat;
  });

  const criticalCount = parts.filter((p) => p.stock <= 3).length;

  const handleDelete = async (id: string) => {
    if (!confirm("Bu parçayı silmek istediğinizden emin misiniz?")) return;
    await supabase.from("products").delete().eq("id", id);
    setParts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <DashboardLayout>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h1 style={{ fontSize: 26, fontWeight: "bold", color: "#0c2340" }}>🔩 Parça Stokları</h1>
          <button onClick={() => router.push("/marine/parca/ekle")}
            style={{ padding: "10px 20px", background: "#06b6d4", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
            + Yeni Parça
          </button>
        </div>

        {criticalCount > 0 && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#dc2626" }}>
              {criticalCount} ürünün stoğu kritik seviyede (≤3 adet)
            </span>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Parça adı veya seri no ara..."
            style={{ flex: 1, minWidth: 200, padding: "9px 14px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13, outline: "none" }}
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            style={{ padding: "9px 14px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13, outline: "none", background: "white" }}>
            <option value="all">Tüm Kategoriler</option>
            {MARINE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {loading ? (
          <p style={{ color: "#94a3b8" }}>Yükleniyor...</p>
        ) : (
          <div style={{ background: "white", borderRadius: 12, boxShadow: "0 2px 12px rgba(6,182,212,0.08)", overflow: "hidden", border: "1px solid #e0f7fa" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>Parça</th>
                  <th style={th}>Seri No</th>
                  <th style={th}>Kategori</th>
                  <th style={th}>Stok</th>
                  <th style={th}>Alış</th>
                  <th style={th}>Satış</th>
                  <th style={th}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const isCritical = p.stock <= 3;
                  return (
                    <tr key={p.id}>
                      <td style={td}>
                        <span style={{ fontWeight: 600, color: "#0c2340" }}>{p.name}</span>
                      </td>
                      <td style={td}>
                        {p.barcode ? (
                          <span style={{ fontFamily: "monospace", background: "#e0f7fa", color: "#0891b2", padding: "2px 8px", borderRadius: 6, fontSize: 12 }}>
                            {p.barcode}
                          </span>
                        ) : "—"}
                      </td>
                      <td style={td}>
                        <span style={{ background: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: 6, fontSize: 12 }}>
                          {p.category ?? "—"}
                        </span>
                      </td>
                      <td style={{ ...td, fontWeight: 700, color: isCritical ? "#ef4444" : p.stock <= 10 ? "#d97706" : "#16a34a" }}>
                        {p.stock} {isCritical && "⚠️"}
                      </td>
                      <td style={td}>₺{Number(p.price).toFixed(2)}</td>
                      <td style={{ ...td, color: "#06b6d4", fontWeight: 600 }}>₺{Number(p.selling_price).toFixed(2)}</td>
                      <td style={td}>
                        <button onClick={() => router.push(`/marine/parca/${p.id}/duzenle`)}
                          style={{ padding: "5px 12px", background: "#06b6d4", color: "white", borderRadius: 6, border: "none", cursor: "pointer", marginRight: 6, fontSize: 12, fontWeight: 600 }}>
                          Düzenle
                        </button>
                        <button onClick={() => handleDelete(p.id)}
                          style={{ padding: "5px 12px", background: "#fee2e2", color: "#dc2626", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                          Sil
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: 28, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                    {search || category !== "all" ? "Arama sonucu bulunamadı." : "Henüz marine parçası eklenmemiş."}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
