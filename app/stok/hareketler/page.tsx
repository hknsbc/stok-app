"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";

type Movement = {
  id: string;
  product_id: string;
  warehouse_id: string | null;
  change_type: string;
  quantity_delta: number;
  previous_quantity: number | null;
  new_quantity: number | null;
  reference_type: string | null;
  note: string | null;
  created_at: string;
};

const CHANGE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  ilk_giris: { label: "İlk Giriş", icon: "🆕", color: "#6366f1" },
  yeni_depo_atama: { label: "Yeni Depo Ataması", icon: "🏬", color: "#6366f1" },
  manuel_duzenleme: { label: "Manuel Düzenleme", icon: "✏️", color: "#f59e0b" },
  satis: { label: "Satış", icon: "🛒", color: "#ef4444" },
  alis: { label: "Alış", icon: "📥", color: "#10b981" },
  transfer_cikis: { label: "Transfer (Çıkış)", icon: "⬆️", color: "#f59e0b" },
  transfer_giris: { label: "Transfer (Giriş)", icon: "⬇️", color: "#10b981" },
};

export default function HareketlerPage() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [productMap, setProductMap] = useState<Record<string, string>>({});
  const [warehouseMap, setWarehouseMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [productFilter, setProductFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data: profile } = await supabase.from("profiles").select("tenant_id").eq("id", user.id).single();
      if (!profile?.tenant_id) { setLoading(false); return; }

      const [movRes, prodRes, whRes] = await Promise.all([
        supabase.from("stock_movements").select("*").eq("tenant_id", profile.tenant_id).order("created_at", { ascending: false }).limit(300),
        supabase.from("products").select("id, name").eq("tenant_id", profile.tenant_id),
        supabase.from("warehouses").select("id, name").eq("tenant_id", profile.tenant_id),
      ]);
      if (movRes.data) setMovements(movRes.data);
      if (prodRes.data) {
        const map: Record<string, string> = {};
        prodRes.data.forEach((p) => { map[p.id] = p.name; });
        setProductMap(map);
      }
      if (whRes.data) {
        const map: Record<string, string> = {};
        whRes.data.forEach((w) => { map[w.id] = w.name; });
        setWarehouseMap(map);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = movements.filter((m) => {
    const productName = productMap[m.product_id] ?? "";
    if (productFilter && !productName.toLowerCase().includes(productFilter.toLowerCase())) return false;
    if (typeFilter && m.change_type !== typeFilter) return false;
    return true;
  });

  const th: React.CSSProperties = { padding: "10px 14px", textAlign: "left", fontSize: 12, color: "#555", fontWeight: 600, borderBottom: "2px solid #eee", background: "#f9fafb" };
  const td: React.CSSProperties = { padding: "10px 14px", fontSize: 13, borderBottom: "1px solid #f3f4f6" };

  return (
    <DashboardLayout>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: "bold", marginBottom: 20 }}>📜 Stok Hareketleri</h1>

        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Ürün adına göre filtrele..."
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            style={{ padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, minWidth: 220, outline: "none" }}
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none" }}
          >
            <option value="">Tüm hareket tipleri</option>
            {Object.entries(CHANGE_LABELS).map(([key, v]) => (
              <option key={key} value={key}>{v.label}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <p style={{ color: "#888" }}>Yükleniyor...</p>
        ) : (
          <div className="table-scroll" style={{ background: "white", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 780 }}>
              <thead>
                <tr>
                  <th style={th}>Tarih</th>
                  <th style={th}>Ürün</th>
                  <th style={th}>Depo</th>
                  <th style={th}>Hareket</th>
                  <th style={th}>Değişim</th>
                  <th style={th}>Önce → Sonra</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => {
                  const meta = CHANGE_LABELS[m.change_type] ?? { label: m.change_type, icon: "•", color: "#6b7280" };
                  return (
                    <tr key={m.id}>
                      <td style={td}>
                        {new Date(m.created_at).toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td style={td}>{productMap[m.product_id] ?? "—"}</td>
                      <td style={td}>{m.warehouse_id ? (warehouseMap[m.warehouse_id] ?? "—") : "—"}</td>
                      <td style={td}>
                        <span style={{ color: meta.color, fontWeight: 600 }}>{meta.icon} {meta.label}</span>
                      </td>
                      <td style={{ ...td, fontWeight: 700, color: m.quantity_delta >= 0 ? "#10b981" : "#ef4444" }}>
                        {m.quantity_delta >= 0 ? "+" : ""}{m.quantity_delta}
                      </td>
                      <td style={{ ...td, color: "#888" }}>
                        {m.previous_quantity ?? "—"} → {m.new_quantity ?? "—"}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: 32, textAlign: "center", color: "#aaa", fontSize: 13 }}>
                      Kayıt bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
