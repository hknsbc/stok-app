"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";

export default function UrunEkle() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [stock, setStock] = useState("");
  const [alisFiyati, setAlisFiyati] = useState("");
  const [satisFiyati, setSatisFiyati] = useState("");

  const handleSave = async (e: any) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert("Giris yapmaniz gerekiyor!"); return; }

    const { data: profile } = await supabase
      .from("profiles").select("tenant_id").eq("id", user.id).single();
    if (!profile?.tenant_id) { alert("Tenant bulunamadi!"); return; }

    const { error } = await supabase.from("products").insert({
      name,
      barcode: barcode || null,
      stock: Number(stock),
      price: Number(alisFiyati),
      selling_price: Number(satisFiyati),
      tenant_id: profile.tenant_id,
    });

    if (error) { alert("Hata: " + error.message); return; }
    router.push("/stok");
  };

  const inputStyle = { padding: 10, border: "1px solid #ccc", borderRadius: 6, width: "100%", fontSize: 14 };
  const labelStyle = { fontSize: 13, color: "#555", marginBottom: 4, display: "block" as const };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 480 }}>
        <h1 style={{ fontSize: 28, fontWeight: "bold", marginBottom: 24 }}>Yeni Urun Ekle</h1>
        <form onSubmit={handleSave} style={{ background: "white", padding: 28, borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={labelStyle}>Urun Adi</label>
            <input type="text" placeholder="Urun adi" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Barkod</label>
            <input type="text" placeholder="Barkod okutun veya girin" value={barcode} onChange={(e) => setBarcode(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Stok Adedi</label>
            <input type="number" placeholder="0" value={stock} onChange={(e) => setStock(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Alis Fiyati (TL) — Maliyet</label>
            <input type="number" step="0.01" placeholder="0.00" value={alisFiyati} onChange={(e) => setAlisFiyati(e.target.value)} required style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Satis Fiyati (TL)</label>
            <input type="number" step="0.01" placeholder="0.00" value={satisFiyati} onChange={(e) => setSatisFiyati(e.target.value)} required style={inputStyle} />
          </div>
          {alisFiyati && satisFiyati && (
            <div style={{ background: "#f0fdf4", padding: 12, borderRadius: 8, fontSize: 13, color: "#16a34a" }}>
              Birim Kar: {(Number(satisFiyati) - Number(alisFiyati)).toFixed(2)} TL
              {Number(alisFiyati) > 0 && ` (%${(((Number(satisFiyati) - Number(alisFiyati)) / Number(alisFiyati)) * 100).toFixed(1)})`}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button type="submit" style={{ flex: 1, padding: "11px 0", background: "black", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold" }}>
              Kaydet
            </button>
            <button type="button" onClick={() => router.push("/stok")} style={{ flex: 1, padding: "11px 0", background: "#eee", border: "none", borderRadius: 8, cursor: "pointer" }}>
              Iptal
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
