"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";

const COLOR = "#f97316";

type SaleRow = {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  total: number;
  cost: number;
  notes: string | null;
  created_at: string;
};

type ProductMap = Record<string, string>;

type OzetSatir = {
  label: string;
  value: string;
  color?: string;
  bold?: boolean;
};

export default function GunSonu() {
  const [satislar, setSatislar] = useState<SaleRow[]>([]);
  const [productMap, setProductMap] = useState<ProductMap>({});
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const displayDate = today.toLocaleDateString("tr-TR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  useEffect(() => {
    const fetch = async () => {
      const [salesRes, prodRes] = await Promise.all([
        supabase.from("sales").select("*").eq("date", todayStr).order("created_at", { ascending: false }),
        supabase.from("products").select("id, name"),
      ]);
      if (salesRes.data) setSatislar(salesRes.data);
      if (prodRes.data) {
        const map: ProductMap = {};
        prodRes.data.forEach((p) => { map[p.id] = p.name; });
        setProductMap(map);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const parseOdeme = (notes: string | null): "nakit" | "kredi_kart" | "diger" => {
    if (!notes) return "diger";
    const n = notes.toLowerCase();
    if (n.includes("nakit")) return "nakit";
    if (n.includes("kredi") || n.includes("kart")) return "kredi_kart";
    return "diger";
  };

  const nakitSatislar = satislar.filter((s) => parseOdeme(s.notes) === "nakit");
  const krediSatislar = satislar.filter((s) => parseOdeme(s.notes) === "kredi_kart");

  const toplam = (rows: SaleRow[]) => rows.reduce((a, r) => a + Number(r.total || 0), 0);
  const maliyet = (rows: SaleRow[]) => rows.reduce((a, r) => a + Number(r.cost || 0), 0);
  const adet = (rows: SaleRow[]) => rows.reduce((a, r) => a + Number(r.quantity || 0), 0);

  const genelCiro = toplam(satislar);
  const genelMaliyet = maliyet(satislar);
  const genelKar = genelCiro - genelMaliyet;
  const karMarji = genelCiro > 0 ? ((genelKar / genelCiro) * 100).toFixed(1) : "0";

  // Ürün bazlı özet
  const urunOzet: Record<string, { name: string; qty: number; total: number }> = {};
  satislar.forEach((s) => {
    const name = productMap[s.product_id] ?? "Bilinmiyor";
    if (!urunOzet[s.product_id]) urunOzet[s.product_id] = { name, qty: 0, total: 0 };
    urunOzet[s.product_id].qty += Number(s.quantity || 0);
    urunOzet[s.product_id].total += Number(s.total || 0);
  });
  const urunListesi = Object.values(urunOzet).sort((a, b) => b.total - a.total);

  const ozetsatirlar: OzetSatir[] = [
    { label: "Toplam Ciro", value: `₺${genelCiro.toFixed(2)}`, color: COLOR, bold: true },
    { label: "Toplam Maliyet", value: `₺${genelMaliyet.toFixed(2)}`, color: "#6b7280" },
    { label: "Brüt Kar", value: `₺${genelKar.toFixed(2)}`, color: genelKar >= 0 ? "#10b981" : "#ef4444", bold: true },
    { label: "Kar Marjı", value: `%${karMarji}`, color: "#6366f1" },
    { label: "Satılan Adet", value: String(adet(satislar)), color: "#1e1b4b" },
    { label: "İşlem Sayısı", value: String(satislar.length), color: "#1e1b4b" },
  ];

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: "bold", margin: 0, color: "#1e1b4b" }}>📊 Gün Sonu Raporu</h1>
            <p style={{ color: "#888", margin: "4px 0 0", fontSize: 14 }}>{displayDate}</p>
          </div>
          <button
            onClick={() => window.print()}
            style={{ padding: "10px 20px", background: COLOR, color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 }}
          >
            🖨️ Yazdır
          </button>
        </div>

        {loading ? (
          <p style={{ color: "#888" }}>Yükleniyor...</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

            {/* Sol: Genel özet + ödeme yöntemi */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Genel Özet */}
              <div style={{ background: "white", borderRadius: 14, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: "#1e1b4b" }}>Genel Özet</h2>
                {ozetsatirlar.map((row) => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #f3f4f6" }}>
                    <span style={{ fontSize: 13, color: "#555" }}>{row.label}</span>
                    <span style={{ fontSize: 14, fontWeight: row.bold ? "bold" : 600, color: row.color ?? "#374151" }}>{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Ödeme Yöntemi */}
              <div style={{ background: "white", borderRadius: 14, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: "#1e1b4b" }}>Ödeme Yöntemi</h2>
                {[
                  { label: "💵 Nakit", rows: nakitSatislar, color: "#10b981" },
                  { label: "💳 Kredi Kart", rows: krediSatislar, color: "#6366f1" },
                ].map(({ label, rows, color }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f3f4f6" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>{label}</div>
                      <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{rows.length} işlem · {adet(rows)} adet</div>
                    </div>
                    <span style={{ fontSize: 16, fontWeight: "bold", color }}>₺{toplam(rows).toFixed(2)}</span>
                  </div>
                ))}
                {satislar.filter((s) => parseOdeme(s.notes) === "diger").length > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>Diğer</div>
                    <span style={{ fontSize: 16, fontWeight: "bold", color: "#9ca3af" }}>
                      ₺{toplam(satislar.filter((s) => parseOdeme(s.notes) === "diger")).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Sağ: Ürün bazlı satış + işlemler */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Ürün Özeti */}
              <div style={{ background: "white", borderRadius: 14, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: "#1e1b4b" }}>Ürün Bazlı Satış</h2>
                {urunListesi.length === 0 ? (
                  <p style={{ color: "#aaa", fontSize: 13, margin: 0 }}>Bugün satış yok.</p>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th style={{ fontSize: 11, color: "#888", fontWeight: 600, textAlign: "left", paddingBottom: 8 }}>Ürün</th>
                        <th style={{ fontSize: 11, color: "#888", fontWeight: 600, textAlign: "center", paddingBottom: 8 }}>Adet</th>
                        <th style={{ fontSize: 11, color: "#888", fontWeight: 600, textAlign: "right", paddingBottom: 8 }}>Ciro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {urunListesi.map((u) => (
                        <tr key={u.name} style={{ borderTop: "1px solid #f3f4f6" }}>
                          <td style={{ padding: "8px 0", fontSize: 13, color: "#374151" }}>{u.name}</td>
                          <td style={{ padding: "8px 0", fontSize: 13, textAlign: "center", color: "#6b7280" }}>{u.qty}</td>
                          <td style={{ padding: "8px 0", fontSize: 13, fontWeight: 600, textAlign: "right", color: COLOR }}>₺{u.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Son işlemler */}
              <div style={{ background: "white", borderRadius: 14, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: "#1e1b4b" }}>Son İşlemler</h2>
                {satislar.length === 0 ? (
                  <p style={{ color: "#aaa", fontSize: 13, margin: 0 }}>Bugün işlem yok.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 280, overflowY: "auto" }}>
                    {satislar.slice(0, 20).map((s) => (
                      <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f9fafb" }}>
                        <div>
                          <div style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{productMap[s.product_id] ?? "—"}</div>
                          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                            {new Date(s.created_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })} · {s.quantity} adet · {parseOdeme(s.notes) === "nakit" ? "💵" : parseOdeme(s.notes) === "kredi_kart" ? "💳" : "—"}
                          </div>
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 600, color: COLOR }}>₺{Number(s.total).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
