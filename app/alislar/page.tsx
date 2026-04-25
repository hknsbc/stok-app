"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import { useLang } from "@/lib/LangContext";

type Purchase = {
  id: string;
  customer_id: string;
  product_id: string;
  quantity: number;
  price: number;
  total: number;
  date: string;
  notes: string;
};

type Customer = { id: string; name: string };
type Product = { id: string; name: string; price: number; barcode?: string };

export default function Alislar() {
  const { t } = useLang();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Purchase | null>(null);
  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState("0");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  // Barkod satırı state
  const [barcodeInput, setBarcodeInput] = useState("");
  const [barcodeMsg, setBarcodeMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const barcodeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAll();
    barcodeRef.current?.focus();
  }, []);

  const fetchAll = async () => {
    const [p, c, pr] = await Promise.all([
      supabase.from("purchases").select("*").order("created_at", { ascending: false }),
      supabase.from("customers").select("id, name"),
      supabase.from("products").select("id, name, price, barcode"),
    ]);
    if (p.data) setPurchases(p.data);
    if (c.data) setCustomers(c.data);
    if (pr.data) setProducts(pr.data);
  };

  const resetForm = () => {
    setEditing(null); setShowForm(false);
    setCustomerId(""); setProductId(""); setQuantity("1"); setPrice("0"); setNotes("");
    setDate(new Date().toISOString().split("T")[0]);
  };

  const handleProductChange = (pid: string) => {
    setProductId(pid);
    const product = products.find((p) => p.id === pid);
    if (product) setPrice(String(product.price));
  };

  // Barkod satırı — Enter'a basınca ürünü bul, formu aç ve doldur
  const handleBarcodeEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const val = barcodeInput.trim();
    if (!val) return;

    const found = products.find((p) => p.barcode === val);
    if (found) {
      handleProductChange(found.id);
      setShowForm(true);
      setEditing(null);
      setBarcodeMsg({ text: `${found.name} seçildi`, ok: true });
    } else {
      setBarcodeMsg({ text: `${t.barcodeNotFound} ${val}`, ok: false });
    }
    setBarcodeInput("");
    setTimeout(() => {
      setBarcodeMsg(null);
      barcodeRef.current?.focus();
    }, 2500);
  };

  const handleEdit = (p: Purchase) => {
    setEditing(p);
    setCustomerId(p.customer_id || "");
    setProductId(p.product_id || "");
    setQuantity(String(p.quantity));
    setPrice(String(p.price));
    setDate(p.date);
    setNotes(p.notes || "");
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase
      .from("profiles").select("tenant_id").eq("id", user.id).single();
    if (!profile?.tenant_id) return;

    const total = Number(quantity) * Number(price);

    if (editing) {
      await supabase.from("purchases").update({
        customer_id: customerId || null,
        product_id: productId || null,
        quantity: Number(quantity),
        price: Number(price),
        total, date, notes,
      }).eq("id", editing.id);
    } else {
      await supabase.from("purchases").insert({
        customer_id: customerId || null,
        product_id: productId || null,
        quantity: Number(quantity),
        price: Number(price),
        total, date, notes,
        tenant_id: profile.tenant_id,
      });
    }
    fetchAll();
    resetForm();
    barcodeRef.current?.focus();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("purchases").delete().eq("id", id);
    setPurchases(purchases.filter((p) => p.id !== id));
  };

  const th: React.CSSProperties = { borderBottom: "1px solid #eee", padding: 12, textAlign: "left", fontSize: 13, color: "#555", fontWeight: 600 };
  const td: React.CSSProperties = { padding: 12, fontSize: 13, borderBottom: "1px solid #f3f4f6" };

  return (
    <DashboardLayout>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h1 style={{ fontSize: 26, fontWeight: "bold" }}>{t.alislarTitle}</h1>
          <button
            onClick={() => { resetForm(); setShowForm(true); setTimeout(() => barcodeRef.current?.focus(), 50); }}
            style={{ padding: "10px 20px", background: "#6366f1", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}
          >
            {t.newPurchase}
          </button>
        </div>

        {/* ── Barkod Satırı ── */}
        <div style={{
          background: "white", padding: "16px 20px", borderRadius: 12, marginBottom: 20,
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          border: "2px solid #6366f1",
        }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 8 }}>
            🔖 {t.barcodeReader}
          </label>
          <input
            ref={barcodeRef}
            type="text"
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            onKeyDown={handleBarcodeEnter}
            placeholder={t.barcodeScanPlaceholder}
            autoComplete="off"
            style={{
              width: "100%", padding: "10px 14px",
              border: "2px solid #6366f1", borderRadius: 8,
              fontSize: 15, outline: "none", boxSizing: "border-box",
            }}
          />
          {barcodeMsg && (
            <p style={{ marginTop: 8, fontSize: 13, fontWeight: 500, color: barcodeMsg.ok ? "#10b981" : "#ef4444" }}>
              {barcodeMsg.ok ? "✓" : "✗"} {barcodeMsg.text}
            </p>
          )}
        </div>

        {/* ── Alış Formu ── */}
        {showForm && (
          <form onSubmit={handleSave} style={{
            background: "white", padding: 24, borderRadius: 12, marginBottom: 24,
            display: "flex", flexDirection: "column", gap: 12, maxWidth: 500,
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          }}>
            <h2 style={{ fontSize: 18, fontWeight: "bold", margin: 0 }}>
              {editing ? t.editPurchase : t.newPurchaseForm}
            </h2>
            <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}
              style={{ padding: 10, border: "1px solid #ccc", borderRadius: 6, fontSize: 14 }}>
              <option value="">{t.selectCustomer}</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={productId} onChange={(e) => handleProductChange(e.target.value)}
              style={{ padding: 10, border: "1px solid #ccc", borderRadius: 6, fontSize: 14 }}>
              <option value="">{t.selectProduct}</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input type="number" placeholder={t.quantity} value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              style={{ padding: 10, border: "1px solid #ccc", borderRadius: 6, fontSize: 14 }} />
            <input type="number" placeholder={t.unitPrice} value={price}
              onChange={(e) => setPrice(e.target.value)}
              style={{ padding: 10, border: "1px solid #ccc", borderRadius: 6, fontSize: 14 }} />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              style={{ padding: 10, border: "1px solid #ccc", borderRadius: 6, fontSize: 14 }} />
            <input placeholder={t.notes} value={notes} onChange={(e) => setNotes(e.target.value)}
              style={{ padding: 10, border: "1px solid #ccc", borderRadius: 6, fontSize: 14 }} />
            <div style={{ background: "#f5f5f5", padding: 10, borderRadius: 6, fontWeight: "bold", fontSize: 14 }}>
              {t.total}: {(Number(quantity) * Number(price)).toFixed(2)} TL
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" style={{ padding: "10px 20px", background: "#6366f1", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>
                {editing ? t.update : t.save}
              </button>
              <button type="button" onClick={() => { resetForm(); barcodeRef.current?.focus(); }}
                style={{ padding: "10px 20px", background: "#eee", border: "none", borderRadius: 6, cursor: "pointer" }}>
                {t.cancel}
              </button>
            </div>
          </form>
        )}

        {/* ── Alışlar Tablosu ── */}
        <div style={{ background: "white", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                <th style={th}>{t.date}</th>
                <th style={th}>{t.customer}</th>
                <th style={th}>{t.product}</th>
                <th style={th}>{t.quantity}</th>
                <th style={th}>{t.unitPrice}</th>
                <th style={th}>{t.total}</th>
                <th style={th}>{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((p) => (
                <tr key={p.id}>
                  <td style={td}>{p.date}</td>
                  <td style={td}>{customers.find((c) => c.id === p.customer_id)?.name || "-"}</td>
                  <td style={td}>{products.find((pr) => pr.id === p.product_id)?.name || "-"}</td>
                  <td style={td}>{p.quantity}</td>
                  <td style={td}>{p.price} TL</td>
                  <td style={td}>{p.total} TL</td>
                  <td style={td}>
                    <button onClick={() => handleEdit(p)} style={{ padding: "5px 12px", background: "#6366f1", color: "white", borderRadius: 6, border: "none", cursor: "pointer", marginRight: 6, fontSize: 12 }}>
                      {t.edit}
                    </button>
                    <button onClick={() => handleDelete(p.id)} style={{ padding: "5px 12px", background: "#fee2e2", color: "#dc2626", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12 }}>
                      {t.delete}
                    </button>
                  </td>
                </tr>
              ))}
              {purchases.length === 0 && (
                <tr><td colSpan={7} style={{ padding: 24, textAlign: "center", color: "#aaa", fontSize: 13 }}>{t.noPurchases}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
