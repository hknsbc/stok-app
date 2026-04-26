"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";

const VET_MEDICINE_CATEGORIES = ["Antibiyotik", "Anestezi", "Aşı", "Steroid", "Anti-paraziter", "Vitamin", "Serum", "Dezenfektan", "Pansuman", "Diğer İlaç"];

type Medicine = { id: string; name: string; barcode: string; category: string; stock: number; price: number; selling_price: number; expiry_date?: string };

export default function MedicineStock() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [category, setCategory] = useState("Tümü");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from("profiles").select("tenant_id").eq("id", user.id).single();
      if (!profile?.tenant_id) return;
      const { data } = await supabase.from("products").select("id,name,barcode,category,stock,price,selling_price,expiry_date").eq("tenant_id", profile.tenant_id).in("category", VET_MEDICINE_CATEGORIES).order("name");
      setMedicines(data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" ilaç kaydını silmek istiyor musunuz?`)) return;
    await supabase.from("products").delete().eq("id", id);
    setMedicines((prev) => prev.filter((m) => m.id !== id));
  };

  const today = new Date().toISOString().split("T")[0];
  const filtered = medicines.filter((m) => {
    const matchCat = category === "Tümü" || m.category === category;
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || (m.barcode ?? "").includes(search);
    return matchCat && matchSearch;
  });

  const criticalCount = medicines.filter((m) => m.stock <= 5).length;
  const expiredCount = medicines.filter((m) => m.expiry_date && m.expiry_date < today).length;

  return (
    <DashboardLayout>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h1 style={{ fontSize: 24, fontWeight: "bold" }}>💊 İlaç Stoku</h1>
          <Link href="/stok/yeni" style={{ padding: "10px 20px", background: "#8b5cf6", color: "white", borderRadius: 8, textDecoration: "none", fontWeight: "bold", fontSize: 14 }}>
            + Yeni İlaç
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          <div style={{ background: "white", padding: "14px 18px", borderRadius: 10, borderLeft: "4px solid #ef4444", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: 11, color: "#888" }}>Kritik Stok (≤5)</div>
            <div style={{ fontSize: 22, fontWeight: "bold", color: "#ef4444" }}>{criticalCount}</div>
          </div>
          <div style={{ background: "white", padding: "14px 18px", borderRadius: 10, borderLeft: "4px solid #f59e0b", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: 11, color: "#888" }}>Süresi Geçmiş</div>
            <div style={{ fontSize: 22, fontWeight: "bold", color: "#f59e0b" }}>{expiredCount}</div>
          </div>
        </div>

        <div style={{ background: "white", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #f3f4f6", display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input type="text" placeholder="İlaç adı veya barkod ara..." value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: 180, padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none" }} />
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none" }}>
              <option>Tümü</option>
              {VET_MEDICINE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#888" }}>Yükleniyor...</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  {["İlaç Adı", "Kategori", "Stok", "Maliyet", "Satış Fiyatı", "SKT", ""].map((h) => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, color: "#555", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => {
                  const critical = m.stock <= 5;
                  const expired = m.expiry_date && m.expiry_date < today;
                  return (
                    <tr key={m.id} style={{ borderTop: "1px solid #f3f4f6", background: expired ? "#fef2f2" : critical ? "#fffbeb" : "white" }}>
                      <td style={{ padding: "11px 14px", fontWeight: 600, fontSize: 14 }}>{m.name}</td>
                      <td style={{ padding: "11px 14px", fontSize: 12 }}>
                        <span style={{ padding: "3px 8px", background: "#f3f4f6", borderRadius: 12, fontSize: 11, fontWeight: 600 }}>{m.category}</span>
                      </td>
                      <td style={{ padding: "11px 14px", fontWeight: "bold", color: m.stock === 0 ? "#ef4444" : critical ? "#f59e0b" : "#10b981" }}>
                        {m.stock === 0 ? "Tükendi" : m.stock}
                      </td>
                      <td style={{ padding: "11px 14px", fontSize: 13, color: "#555" }}>{Number(m.price || 0).toLocaleString("tr-TR")} TL</td>
                      <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 600, color: "#6366f1" }}>{Number(m.selling_price || 0).toLocaleString("tr-TR")} TL</td>
                      <td style={{ padding: "11px 14px", fontSize: 12, color: expired ? "#ef4444" : "#888", fontWeight: expired ? 700 : 400 }}>
                        {m.expiry_date ?? "—"}{expired ? " ⚠️" : ""}
                      </td>
                      <td style={{ padding: "11px 14px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <Link href={`/stok/${m.id}/duzenle`} style={{ padding: "5px 12px", background: "#f5f3ff", color: "#8b5cf6", borderRadius: 6, textDecoration: "none", fontSize: 12, fontWeight: 600 }}>Düzenle</Link>
                          <button onClick={() => handleDelete(m.id, m.name)} style={{ padding: "5px 12px", background: "#fef2f2", color: "#ef4444", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Sil</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={7}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "52px 24px" }}>
                      <div style={{ fontSize: 36 }}>💊</div>
                      <p style={{ fontSize: 15, fontWeight: 600, color: "#374151", margin: 0 }}>Henüz ilaç kaydı yok.</p>
                      <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>Kullanıma hazır.</p>
                    </div>
                  </td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
