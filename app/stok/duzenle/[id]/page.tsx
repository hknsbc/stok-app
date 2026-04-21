"use client";
import { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { useLang } from "@/lib/LangContext";

export default function UrunDuzenle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { t } = useLang();

  const [name, setName] = useState("");
  const [stock, setStock] = useState("");
  const [alisFiyati, setAlisFiyati] = useState("");
  const [satisFiyati, setSatisFiyati] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products").select("*").eq("id", id).single();
      if (error || !data) { alert(t.productNotFound); router.push("/stok"); return; }
      setName(data.name);
      setStock(String(data.stock ?? ""));
      setAlisFiyati(String(data.price ?? ""));
      setSatisFiyati(String(data.selling_price ?? ""));
      setLoading(false);
    };
    fetchProduct();
  }, [id, router]);

  const handleSave = async (e: any) => {
    e.preventDefault();
    const { error } = await supabase.from("products").update({
      name,
      stock: Number(stock),
      price: Number(alisFiyati),
      selling_price: Number(satisFiyati),
    }).eq("id", id);

    if (error) { alert(`${t.errorPrefix} ${error.message}`); return; }
    router.push("/stok");
  };

  const inputStyle = { padding: 10, border: "1px solid #ccc", borderRadius: 6, width: "100%", fontSize: 14 };
  const labelStyle = { fontSize: 13, color: "#555", marginBottom: 4, display: "block" as const };

  if (loading) return <DashboardLayout><p style={{ color: "#888" }}>{t.loading}</p></DashboardLayout>;

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 480 }}>
        <h1 style={{ fontSize: 28, fontWeight: "bold", marginBottom: 24 }}>{t.editProduct}</h1>
        <form onSubmit={handleSave} style={{ background: "white", padding: 28, borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={labelStyle}>{t.productName}</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>{t.stockCount}</label>
            <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>{t.buyPrice}</label>
            <input type="number" step="0.01" value={alisFiyati} onChange={(e) => setAlisFiyati(e.target.value)} required style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>{t.sellPrice}</label>
            <input type="number" step="0.01" value={satisFiyati} onChange={(e) => setSatisFiyati(e.target.value)} required style={inputStyle} />
          </div>
          {alisFiyati && satisFiyati && (
            <div style={{ background: "#f0fdf4", padding: 12, borderRadius: 8, fontSize: 13, color: "#16a34a" }}>
              {t.unitProfit} {(Number(satisFiyati) - Number(alisFiyati)).toFixed(2)} TL
              {Number(alisFiyati) > 0 && ` (%${(((Number(satisFiyati) - Number(alisFiyati)) / Number(alisFiyati)) * 100).toFixed(1)})`}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button type="submit" style={{ flex: 1, padding: "11px 0", background: "black", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold" }}>
              {t.update}
            </button>
            <button type="button" onClick={() => router.push("/stok")} style={{ flex: 1, padding: "11px 0", background: "#eee", border: "none", borderRadius: 8, cursor: "pointer" }}>
              {t.cancel}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
