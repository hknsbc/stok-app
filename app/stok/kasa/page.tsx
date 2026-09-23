"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";

const COLOR = "#6366f1";

type SaleRow = {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  total: number;
  cost: number;
  notes: string | null;
  payment_method: "nakit" | "banka" | "kredi_kart" | null;
  created_at: string;
};

type ProductMap = Record<string, string>;

export default function Kasa() {
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

  // Eski kayıtlarda payment_method boş olabilir — notes içinden tahmin et (geriye dönük uyumluluk)
  const resolveOdeme = (s: SaleRow): "nakit" | "banka" | "kredi_kart" | "diger" => {
    if (s.payment_method) return s.payment_method;
    const n = (s.notes ?? "").toLowerCase();
    if (n.includes("nakit")) return "nakit";
    if (n.includes("banka")) return "banka";
    if (n.includes("kredi") || n.includes("kart")) return "kredi_kart";
    return "diger";
  };

  const nakitSatislar = satislar.filter((s) => resolveOdeme(s) === "nakit");
  const bankaSatislar = satislar.filter((s) => resolveOdeme(s) === "banka");
  const krediSatislar = satislar.filter((s) => resolveOdeme(s) === "kredi_kart");
  const digerSatislar = satislar.filter((s) => resolveOdeme(s) === "diger");

  const toplam = (rows: SaleRow[]) => rows.reduce((a, r) => a + Number(r.total || 0), 0);
  const adet = (rows: SaleRow[]) => rows.reduce((a, r) => a + Number(r.quantity || 0), 0);

  const genelCiro = toplam(satislar);
  const genelAdet = adet(satislar);

  const odemeYontemleri = [
    { label: "💵 Nakit", rows: nakitSatislar, color: "#10b981" },
    { label: "🏦 Banka", rows: bankaSatislar, color: "#0ea5e9" },
    { label: "💳 Kredi Kartı", rows: krediSatislar, color: COLOR },
  ];

  return (
    <DashboardLayout>
      <div>
        <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: "bold", margin: 0, color: "#1e1b4b" }}>💰 Kasa</h1>
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
          <>
            {/* Üst özet kartları */}
            <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
              <div style={{ background: "white", borderRadius: 14, padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", borderLeft: `4px solid ${COLOR}` }}>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Günlük Toplam Ciro</div>
                <div style={{ fontSize: 24, fontWeight: "bold", color: COLOR }}>₺{genelCiro.toFixed(2)}</div>
              </div>
              <div style={{ background: "white", borderRadius: 14, padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", borderLeft: "4px solid #10b981" }}>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Satılan Adet</div>
                <div style={{ fontSize: 24, fontWeight: "bold", color: "#10b981" }}>{genelAdet}</div>
              </div>
              <div style={{ background: "white", borderRadius: 14, padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", borderLeft: "4px solid #f59e0b" }}>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>İşlem Sayısı</div>
                <div style={{ fontSize: 24, fontWeight: "bold", color: "#f59e0b" }}>{satislar.length}</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="stok-3col">
              {/* Sol: Ödeme yöntemi dağılımı */}
              <div style={{ background: "white", borderRadius: 14, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: "#1e1b4b" }}>Ödeme Yöntemi</h2>
                {odemeYontemleri.map(({ label, rows, color }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f3f4f6" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>{label}</div>
                      <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{rows.length} işlem · {adet(rows)} adet</div>
                    </div>
                    <span style={{ fontSize: 16, fontWeight: "bold", color }}>₺{toplam(rows).toFixed(2)}</span>
                  </div>
                ))}
                {digerSatislar.length > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>Diğer / Belirtilmemiş</div>
                      <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{digerSatislar.length} işlem</div>
                    </div>
                    <span style={{ fontSize: 16, fontWeight: "bold", color: "#9ca3af" }}>₺{toplam(digerSatislar).toFixed(2)}</span>
                  </div>
                )}
                {satislar.length === 0 && (
                  <p style={{ color: "#aaa", fontSize: 13, margin: 0 }}>Bugün henüz satış yok.</p>
                )}
              </div>

              {/* Sağ: Son işlemler */}
              <div style={{ background: "white", borderRadius: 14, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: "#1e1b4b" }}>Son İşlemler</h2>
                {satislar.length === 0 ? (
                  <p style={{ color: "#aaa", fontSize: 13, margin: 0 }}>Bugün işlem yok.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 420, overflowY: "auto" }}>
                    {satislar.map((s) => {
                      const odeme = resolveOdeme(s);
                      const icon = odeme === "nakit" ? "💵" : odeme === "banka" ? "🏦" : odeme === "kredi_kart" ? "💳" : "—";
                      return (
                        <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f9fafb" }}>
                          <div>
                            <div style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{productMap[s.product_id] ?? "—"}</div>
                            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                              {new Date(s.created_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })} · {s.quantity} adet · {icon}
                            </div>
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 600, color: COLOR }}>₺{Number(s.total).toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
