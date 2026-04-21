"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import { useLang } from "@/lib/LangContext";

type Product = {
  id: string;
  name: string;
  price: number;
  selling_price: number;
  stock: number;
  barcode?: string;
};

type CartItem = {
  product: Product;
  quantity: number;
};

type OdemeYontemi = "nakit" | "kredi_kart";

export default function YeniSatis() {
  const { t } = useLang();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [odeme, setOdeme] = useState<OdemeYontemi>("nakit");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [urunListeAcik, setUrunListeAcik] = useState(true);
  const [barcodeMsg, setBarcodeMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const barcodeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProducts();
    barcodeRef.current?.focus();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from("products").select("*");
    if (data) setProducts(data);
    if (error) console.error("Products fetch error:", error.message);
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleBarcodeEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const val = barcodeInput.trim();
    if (!val) return;

    const found = products.find((p) => p.barcode === val);
    if (found) {
      if (found.stock <= 0) {
        setBarcodeMsg({ text: `${t.insufficientStock} ${found.name}`, ok: false });
      } else {
        addToCart(found);
        setBarcodeMsg({ text: `${t.addedToCart} ${found.name}`, ok: true });
      }
    } else {
      setBarcodeMsg({ text: `${t.barcodeNotFound} ${val}`, ok: false });
    }
    setBarcodeInput("");
    setTimeout(() => setBarcodeMsg(null), 2500);
  };

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => i.product.id === productId ? { ...i, quantity: i.quantity + delta } : i)
        .filter((i) => i.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const totalTutar = cart.reduce((acc, i) => acc + (i.product.selling_price || i.product.price) * i.quantity, 0);

  const handleOnay = async () => {
    if (cart.length === 0) return;
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert(t.loginRequired); setSaving(false); return; }
    const { data: profile } = await supabase.from("profiles").select("tenant_id").eq("id", user.id).single();
    if (!profile?.tenant_id) { alert(t.tenantNotFound); setSaving(false); return; }

    const today = new Date().toISOString().split("T")[0];
    const paymentNote = odeme === "nakit" ? t.cash.replace("💵 ", "") : t.creditCard.replace("💳 ", "");

    const inserts = cart.map((item) => ({
      product_id: item.product.id,
      quantity: item.quantity,
      price: item.product.selling_price > 0 ? item.product.selling_price : item.product.price,
      total: (item.product.selling_price > 0 ? item.product.selling_price : item.product.price) * item.quantity,
      cost: item.product.price * item.quantity,
      date: today,
      notes: `Payment: ${paymentNote}`,
      tenant_id: profile.tenant_id,
    }));

    const { error } = await supabase.from("sales").insert(inserts);
    if (error) { alert(`${t.errorPrefix} ${error.message}`); setSaving(false); return; }

    setCart([]);
    setSuccess(true);
    setSaving(false);
    fetchProducts();
    setTimeout(() => { setSuccess(false); barcodeRef.current?.focus(); }, 2500);
  };

  const inputStyle: React.CSSProperties = { padding: "10px 14px", border: "2px solid #6366f1", borderRadius: 8, fontSize: 15, width: "100%", outline: "none" };

  return (
    <DashboardLayout>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }}>

        <div>
          <h1 style={{ fontSize: 26, fontWeight: "bold", marginBottom: 20 }}>{t.yeniSatisTitle}</h1>

          <div style={{ background: "white", padding: 20, borderRadius: 12, marginBottom: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <label style={{ fontSize: 13, color: "#555", display: "block", marginBottom: 8, fontWeight: 600 }}>
              {t.barcodeReader}
            </label>
            <input
              ref={barcodeRef}
              type="text"
              placeholder={t.barcodeScanPlaceholder}
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyDown={handleBarcodeEnter}
              style={inputStyle}
              autoComplete="off"
            />
            {barcodeMsg && (
              <p style={{ marginTop: 8, fontSize: 13, color: barcodeMsg.ok ? "#10b981" : "#ef4444", fontWeight: 500 }}>
                {barcodeMsg.ok ? "✓" : "✗"} {barcodeMsg.text}
              </p>
            )}
          </div>

          <div style={{ background: "white", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", overflow: "hidden" }}>
            <button
              onClick={() => setUrunListeAcik((v) => !v)}
              style={{ width: "100%", padding: "14px 20px", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <span style={{ fontSize: 14, fontWeight: 600, color: "#333" }}>{t.quickAdd}</span>
              <span style={{ fontSize: 18, color: "#6366f1" }}>{urunListeAcik ? "▲" : "▼"}</span>
            </button>

            {urunListeAcik && (
              <div style={{ borderTop: "1px solid #f3f4f6" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f9fafb" }}>
                      <th style={{ padding: "9px 16px", textAlign: "left", fontSize: 12, color: "#555", fontWeight: 600 }}>{t.productNameCol}</th>
                      <th style={{ padding: "9px 12px", textAlign: "right", fontSize: 12, color: "#555", fontWeight: 600 }}>{t.sellPriceCol2}</th>
                      <th style={{ padding: "9px 12px", textAlign: "center", fontSize: 12, color: "#555", fontWeight: 600 }}>{t.stockCount}</th>
                      <th style={{ padding: "9px 12px", textAlign: "center", fontSize: 12, color: "#555", fontWeight: 600 }} />
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => {
                      const satisFiyati = p.selling_price != null && p.selling_price > 0 ? p.selling_price : p.price;
                      const stokYok = p.stock <= 0;
                      return (
                        <tr key={p.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                          <td style={{ padding: "10px 16px", fontSize: 13, color: stokYok ? "#aaa" : "#1e1b4b", fontWeight: 500 }}>{p.name}</td>
                          <td style={{ padding: "10px 12px", fontSize: 13, textAlign: "right", color: stokYok ? "#aaa" : "#6366f1" }}>{satisFiyati.toFixed(2)} TL</td>
                          <td style={{ padding: "10px 12px", fontSize: 13, textAlign: "center", color: stokYok ? "#ef4444" : "#555" }}>{p.stock}</td>
                          <td style={{ padding: "10px 12px", textAlign: "center" }}>
                            <button
                              onClick={() => addToCart(p)}
                              disabled={stokYok}
                              style={{
                                padding: "5px 14px",
                                background: stokYok ? "#e5e7eb" : "#6366f1",
                                color: stokYok ? "#aaa" : "white",
                                border: "none",
                                borderRadius: 6,
                                cursor: stokYok ? "not-allowed" : "pointer",
                                fontSize: 12,
                                fontWeight: 600,
                              }}
                            >
                              {t.addBtn}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {products.length === 0 && (
                      <tr><td colSpan={4} style={{ padding: 20, textAlign: "center", color: "#aaa", fontSize: 13 }}>{t.noProductsFound}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div style={{ position: "sticky", top: 24 }}>
          <div style={{ background: "white", borderRadius: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.1)", overflow: "hidden" }}>
            <div style={{ background: "#1a1a2e", color: "white", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: "bold", fontSize: 16 }}>{t.cart}</span>
              <span style={{ background: "#6366f1", borderRadius: 20, padding: "2px 10px", fontSize: 13 }}>{cart.length} {t.items}</span>
            </div>

            <div style={{ overflowX: "auto", maxHeight: 400, overflowY: "auto" }}>
              {cart.length === 0 ? (
                <p style={{ padding: 28, textAlign: "center", color: "#aaa", fontSize: 13 }}>{t.cartEmpty}</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f9fafb" }}>
                      <th style={{ padding: "8px 12px", textAlign: "left", fontSize: 12, color: "#555", fontWeight: 600, borderBottom: "1px solid #eee" }}>{t.productNameCol}</th>
                      <th style={{ padding: "8px 12px", textAlign: "right", fontSize: 12, color: "#555", fontWeight: 600, borderBottom: "1px solid #eee" }}>{t.sellPriceCol2}</th>
                      <th style={{ padding: "8px 12px", textAlign: "center", fontSize: 12, color: "#555", fontWeight: 600, borderBottom: "1px solid #eee" }}>{t.quantity}</th>
                      <th style={{ padding: "8px 12px", textAlign: "right", fontSize: 12, color: "#555", fontWeight: 600, borderBottom: "1px solid #eee" }}>{t.subtotal}</th>
                      <th style={{ padding: "8px 8px", borderBottom: "1px solid #eee" }} />
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item) => {
                      const satisFiyati = item.product.selling_price > 0 ? item.product.selling_price : item.product.price;
                      return (
                        <tr key={item.product.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                          <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 500 }}>{item.product.name}</td>
                          <td style={{ padding: "10px 12px", fontSize: 13, textAlign: "right", color: "#6366f1" }}>{satisFiyati.toFixed(2)} TL</td>
                          <td style={{ padding: "10px 8px", textAlign: "center" }}>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                              <button onClick={() => updateQty(item.product.id, -1)} style={{ width: 24, height: 24, borderRadius: 5, border: "1px solid #ddd", background: "#f9fafb", cursor: "pointer", fontSize: 15, lineHeight: 1 }}>−</button>
                              <span style={{ fontSize: 13, fontWeight: "bold", minWidth: 22, textAlign: "center" }}>{item.quantity}</span>
                              <button onClick={() => updateQty(item.product.id, 1)} style={{ width: 24, height: 24, borderRadius: 5, border: "1px solid #ddd", background: "#f9fafb", cursor: "pointer", fontSize: 15, lineHeight: 1 }}>+</button>
                            </div>
                          </td>
                          <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: "bold", textAlign: "right" }}>{(satisFiyati * item.quantity).toFixed(2)} TL</td>
                          <td style={{ padding: "10px 8px", textAlign: "center" }}>
                            <button onClick={() => removeFromCart(item.product.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 15 }}>✕</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <div style={{ padding: "16px 20px", borderTop: "2px solid #f3f4f6" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: "bold", marginBottom: 16 }}>
                <span>{t.totalAmount}</span><span style={{ color: "#6366f1" }}>{totalTutar.toFixed(2)} TL</span>
              </div>

              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                {(["nakit", "kredi_kart"] as OdemeYontemi[]).map((y) => (
                  <button key={y} onClick={() => setOdeme(y)} style={{
                    flex: 1, padding: "9px 0", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600,
                    border: "2px solid " + (odeme === y ? "#6366f1" : "#e5e7eb"),
                    background: odeme === y ? "#6366f1" : "white",
                    color: odeme === y ? "white" : "#333",
                  }}>
                    {y === "nakit" ? t.cash : t.creditCard}
                  </button>
                ))}
              </div>

              {success && (
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: 12, textAlign: "center", color: "#16a34a", fontWeight: 600, marginBottom: 12, fontSize: 14 }}>
                  {t.successSale}
                </div>
              )}

              <button
                onClick={handleOnay}
                disabled={cart.length === 0 || saving}
                style={{
                  width: "100%", padding: "13px 0", borderRadius: 10, border: "none",
                  background: cart.length === 0 ? "#e5e7eb" : "#10b981",
                  color: cart.length === 0 ? "#aaa" : "white",
                  cursor: cart.length === 0 ? "not-allowed" : "pointer",
                  fontSize: 15, fontWeight: "bold",
                }}
              >
                {saving ? t.saving : `${t.completeSale} (${cart.length} ${t.productsLabel})`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
