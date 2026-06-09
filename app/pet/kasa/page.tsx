"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";

const COLOR = "#f97316";

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

type Odeme = "nakit" | "kredi_kart";

export default function Kasa() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [odeme, setOdeme] = useState<Odeme>("nakit");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [barcodeMsg, setBarcodeMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [quickSearch, setQuickSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [gunlukToplam, setGunlukToplam] = useState(0);
  const [gunlukAdet, setGunlukAdet] = useState(0);
  const barcodeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProducts();
    fetchGunlukOzet();
    barcodeRef.current?.focus();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*").gt("stock", 0).order("name");
    if (data) setProducts(data);
  };

  const fetchGunlukOzet = async () => {
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("sales")
      .select("total, quantity")
      .eq("date", today);
    if (data) {
      setGunlukToplam(data.reduce((s, r) => s + Number(r.total || 0), 0));
      setGunlukAdet(data.reduce((s, r) => s + Number(r.quantity || 0), 0));
    }
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) return prev.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) =>
    setCart((prev) => prev.map((i) => i.product.id === id ? { ...i, quantity: i.quantity + delta } : i).filter((i) => i.quantity > 0));

  const handleBarcodeEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const val = barcodeInput.trim();
    if (!val) return;
    const found = products.find((p) => p.barcode === val);
    if (found) {
      addToCart(found);
      setBarcodeMsg({ text: `✓ ${found.name} eklendi`, ok: true });
    } else {
      setBarcodeMsg({ text: `Barkod bulunamadı: ${val}`, ok: false });
    }
    setBarcodeInput("");
    setTimeout(() => { setBarcodeMsg(null); barcodeRef.current?.focus(); }, 2500);
  };

  const totalTutar = cart.reduce((acc, i) => acc + (i.product.selling_price || i.product.price) * i.quantity, 0);

  const handleOnay = async () => {
    if (cart.length === 0) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert("Giriş gerekli"); setSaving(false); return; }
    const { data: profile } = await supabase.from("profiles").select("tenant_id").eq("id", user.id).single();
    if (!profile?.tenant_id) { alert("Tenant bulunamadı"); setSaving(false); return; }

    const today = new Date().toISOString().split("T")[0];
    const odemeNot = odeme === "nakit" ? "Nakit" : "Kredi Kart";

    const inserts = cart.map((item) => ({
      product_id: item.product.id,
      quantity: item.quantity,
      price: item.product.selling_price > 0 ? item.product.selling_price : item.product.price,
      total: (item.product.selling_price > 0 ? item.product.selling_price : item.product.price) * item.quantity,
      cost: item.product.price * item.quantity,
      date: today,
      notes: `Ödeme: ${odemeNot}`,
      tenant_id: profile.tenant_id,
    }));

    const { error } = await supabase.from("sales").insert(inserts);
    if (error) { alert("Hata: " + error.message); setSaving(false); return; }

    setCart([]);
    setSuccess(true);
    setSaving(false);
    fetchProducts();
    fetchGunlukOzet();
    setTimeout(() => { setSuccess(false); barcodeRef.current?.focus(); }, 2500);
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(quickSearch.toLowerCase()) || (p.barcode ?? "").includes(quickSearch)
  );

  return (
    <DashboardLayout>
      <div>
        {/* Günlük özet banner */}
        <div style={{
          display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap",
        }}>
          <div style={{ background: "white", borderRadius: 12, padding: "14px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", borderLeft: `4px solid ${COLOR}`, flex: 1, minWidth: 160 }}>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 2 }}>Bugünkü Ciro</div>
            <div style={{ fontSize: 22, fontWeight: "bold", color: COLOR }}>₺{gunlukToplam.toFixed(2)}</div>
          </div>
          <div style={{ background: "white", borderRadius: 12, padding: "14px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", borderLeft: "4px solid #10b981", flex: 1, minWidth: 160 }}>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 2 }}>Satılan Adet</div>
            <div style={{ fontSize: 22, fontWeight: "bold", color: "#10b981" }}>{gunlukAdet}</div>
          </div>
          <div style={{ background: "white", borderRadius: 12, padding: "14px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", borderLeft: "4px solid #6366f1", flex: 1, minWidth: 160 }}>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 2 }}>Sepet Toplamı</div>
            <div style={{ fontSize: 22, fontWeight: "bold", color: "#6366f1" }}>₺{totalTutar.toFixed(2)}</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }}>
          {/* Sol: Barkod + ürün listesi */}
          <div>
            <div style={{ background: "white", padding: 20, borderRadius: 12, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
              <label style={{ fontSize: 13, color: "#555", display: "block", marginBottom: 8, fontWeight: 600 }}>🔖 Barkod Okut</label>
              <input
                ref={barcodeRef}
                type="text"
                placeholder="Barkod okutun veya girin, Enter'a basın..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={handleBarcodeEnter}
                autoComplete="off"
                style={{ padding: "10px 14px", border: `2px solid ${COLOR}`, borderRadius: 8, fontSize: 15, width: "100%", outline: "none", boxSizing: "border-box" }}
              />
              {barcodeMsg && (
                <p style={{ marginTop: 8, fontSize: 13, color: barcodeMsg.ok ? "#10b981" : "#ef4444", fontWeight: 500 }}>
                  {barcodeMsg.text}
                </p>
              )}
            </div>

            <div style={{ background: "white", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #f3f4f6" }}>
                <input
                  type="text"
                  placeholder="Ürün ara..."
                  value={quickSearch}
                  onChange={(e) => setQuickSearch(e.target.value)}
                  style={{ width: "100%", padding: "7px 12px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 13, outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f9fafb" }}>
                    <th style={{ padding: "9px 16px", textAlign: "left", fontSize: 12, color: "#555", fontWeight: 600 }}>Ürün</th>
                    <th style={{ padding: "9px 12px", textAlign: "right", fontSize: 12, color: "#555", fontWeight: 600 }}>Fiyat</th>
                    <th style={{ padding: "9px 12px", textAlign: "center", fontSize: 12, color: "#555", fontWeight: 600 }}>Stok</th>
                    <th style={{ padding: "9px 12px" }} />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const fiyat = p.selling_price > 0 ? p.selling_price : p.price;
                    return (
                      <tr key={p.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                        <td style={{ padding: "10px 16px", fontSize: 13, fontWeight: 500, color: "#1e1b4b" }}>{p.name}</td>
                        <td style={{ padding: "10px 12px", fontSize: 13, textAlign: "right", color: COLOR, fontWeight: 600 }}>{fiyat.toFixed(2)} ₺</td>
                        <td style={{ padding: "10px 12px", fontSize: 13, textAlign: "center", color: p.stock <= 5 ? "#f97316" : "#555" }}>{p.stock}</td>
                        <td style={{ padding: "10px 12px", textAlign: "center" }}>
                          <button
                            onClick={() => addToCart(p)}
                            style={{ padding: "5px 16px", background: COLOR, color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                          >
                            Ekle
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={4} style={{ padding: 32, textAlign: "center", color: "#aaa", fontSize: 13 }}>Ürün bulunamadı</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sağ: Sepet */}
          <div style={{ position: "sticky", top: 24 }}>
            <div style={{ background: "white", borderRadius: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.1)", overflow: "hidden" }}>
              <div style={{ background: "#1e1b4b", color: "white", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: "bold", fontSize: 16 }}>🛒 Sepet</span>
                <span style={{ background: COLOR, borderRadius: 20, padding: "2px 10px", fontSize: 13 }}>{cart.reduce((s, i) => s + i.quantity, 0)} adet</span>
              </div>

              <div style={{ maxHeight: 380, overflowY: "auto" }}>
                {cart.length === 0 ? (
                  <p style={{ padding: 28, textAlign: "center", color: "#aaa", fontSize: 13 }}>Sepet boş — barkod okutun veya ürün seçin</p>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <tbody>
                      {cart.map((item) => {
                        const fiyat = item.product.selling_price > 0 ? item.product.selling_price : item.product.price;
                        return (
                          <tr key={item.product.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                            <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 500 }}>{item.product.name}</td>
                            <td style={{ padding: "10px 8px", textAlign: "center" }}>
                              <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                                <button onClick={() => updateQty(item.product.id, -1)} style={{ width: 24, height: 24, borderRadius: 5, border: "1px solid #ddd", background: "#f9fafb", cursor: "pointer", fontSize: 14, lineHeight: 1 }}>−</button>
                                <span style={{ fontSize: 13, fontWeight: "bold", minWidth: 20, textAlign: "center" }}>{item.quantity}</span>
                                <button onClick={() => updateQty(item.product.id, 1)} style={{ width: 24, height: 24, borderRadius: 5, border: "1px solid #ddd", background: "#f9fafb", cursor: "pointer", fontSize: 14, lineHeight: 1 }}>+</button>
                              </div>
                            </td>
                            <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: "bold", textAlign: "right", color: COLOR }}>{(fiyat * item.quantity).toFixed(2)} ₺</td>
                            <td style={{ padding: "10px 8px", textAlign: "center" }}>
                              <button onClick={() => setCart((p) => p.filter((i) => i.product.id !== item.product.id))} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 15 }}>✕</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              <div style={{ padding: "16px 20px", borderTop: "2px solid #f3f4f6" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, fontWeight: "bold", marginBottom: 14 }}>
                  <span>Toplam</span>
                  <span style={{ color: COLOR }}>₺{totalTutar.toFixed(2)}</span>
                </div>

                <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                  {(["nakit", "kredi_kart"] as Odeme[]).map((y) => (
                    <button key={y} onClick={() => setOdeme(y)} style={{
                      flex: 1, padding: "9px 0", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600,
                      border: "2px solid " + (odeme === y ? COLOR : "#e5e7eb"),
                      background: odeme === y ? COLOR : "white",
                      color: odeme === y ? "white" : "#333",
                    }}>
                      {y === "nakit" ? "💵 Nakit" : "💳 Kredi Kart"}
                    </button>
                  ))}
                </div>

                {success && (
                  <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: 12, textAlign: "center", color: "#16a34a", fontWeight: 600, marginBottom: 12, fontSize: 14 }}>
                    ✓ Satış kaydedildi!
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
                  {saving ? "Kaydediliyor..." : `Satışı Tamamla (${cart.length} kalem)`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
