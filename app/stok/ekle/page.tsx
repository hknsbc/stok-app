"use client";
import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { useLang } from "@/lib/LangContext";

export default function UrunEkle() {
  const router = useRouter();
  const { t } = useLang();
  const [name, setName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [stock, setStock] = useState("");
  const [alisFiyati, setAlisFiyati] = useState("");
  const [satisFiyati, setSatisFiyati] = useState("");
  const [barcodeScanned, setBarcodeScanned] = useState(false);
  const barcodeRef = useRef<HTMLInputElement>(null);

  // Scanner Enter basınca görsel onay
  const handleBarcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (barcode.trim()) {
        setBarcodeScanned(true);
        setTimeout(() => setBarcodeScanned(false), 2000);
      }
    }
  };

  const handleSave = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert(t.loginRequired); return; }

    const { data: profile } = await supabase
      .from("profiles").select("tenant_id").eq("id", user.id).single();
    if (!profile?.tenant_id) { alert(t.tenantNotFound); return; }

    const { error } = await supabase.from("products").insert({
      name,
      barcode: barcode.trim() || null,
      stock: Number(stock),
      price: Number(alisFiyati),
      selling_price: Number(satisFiyati),
      tenant_id: profile.tenant_id,
    });

    if (error) { alert(`${t.errorPrefix} ${error.message}`); return; }
    router.push("/stok");
  };

  const inputStyle: React.CSSProperties = {
    padding: 10, border: "1px solid #ccc", borderRadius: 6,
    width: "100%", fontSize: 14, boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 13, color: "#555", marginBottom: 4,
    display: "block", fontWeight: 500,
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 480 }}>
        <h1 style={{ fontSize: 28, fontWeight: "bold", marginBottom: 24 }}>{t.addProductTitle}</h1>
        <form onSubmit={handleSave} style={{
          background: "white", padding: 28, borderRadius: 12,
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", gap: 16,
        }}>
          <div>
            <label style={labelStyle}>{t.productName}</label>
            <input
              type="text"
              placeholder={t.productName}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          {/* Barkod — scanner ile okutulabilir */}
          <div>
            <label style={labelStyle}>
              🔖 {t.barcodeLabel}
              <span style={{ fontSize: 11, color: "#888", fontWeight: 400, marginLeft: 6 }}>
                (okutun veya yazın)
              </span>
            </label>
            <input
              ref={barcodeRef}
              type="text"
              placeholder={t.barcodePlaceholderScan}
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={handleBarcodeKeyDown}
              style={{
                ...inputStyle,
                border: barcodeScanned
                  ? "2px solid #10b981"
                  : barcode
                  ? "2px solid #6366f1"
                  : "1px solid #ccc",
              }}
            />
            {barcodeScanned && (
              <p style={{ marginTop: 6, fontSize: 12, color: "#10b981", fontWeight: 600 }}>
                ✓ Barkod atandı: {barcode}
              </p>
            )}
            {barcode && !barcodeScanned && (
              <p style={{ marginTop: 6, fontSize: 12, color: "#6366f1" }}>
                Barkod: {barcode}
              </p>
            )}
          </div>

          <div>
            <label style={labelStyle}>{t.stockCount}</label>
            <input
              type="number"
              placeholder="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>{t.buyPrice}</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={alisFiyati}
              onChange={(e) => setAlisFiyati(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>{t.sellPrice}</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={satisFiyati}
              onChange={(e) => setSatisFiyati(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          {alisFiyati && satisFiyati && (
            <div style={{ background: "#f0fdf4", padding: 12, borderRadius: 8, fontSize: 13, color: "#16a34a" }}>
              {t.unitProfit} {(Number(satisFiyati) - Number(alisFiyati)).toFixed(2)} TL
              {Number(alisFiyati) > 0 &&
                ` (%${(((Number(satisFiyati) - Number(alisFiyati)) / Number(alisFiyati)) * 100).toFixed(1)})`}
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button type="submit" style={{
              flex: 1, padding: "11px 0", background: "#6366f1",
              color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold",
            }}>
              {t.save}
            </button>
            <button type="button" onClick={() => router.push("/stok")} style={{
              flex: 1, padding: "11px 0", background: "#eee",
              border: "none", borderRadius: 8, cursor: "pointer",
            }}>
              {t.cancel}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
