"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import { useLang } from "@/lib/LangContext";

type Sale = {
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
type Product = { id: string; name: string; price: number; selling_price: number };

export default function Satislar() {
  const { t } = useLang();
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Sale | null>(null);
  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState("0");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const [s, c, pr] = await Promise.all([
      supabase.from("sales").select("*").order("created_at", { ascending: false }),
      supabase.from("customers").select("id, name"),
      supabase.from("products").select("id, name, price, selling_price"),
    ]);
    if (s.data) setSales(s.data);
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
    if (product) setPrice(String(product.selling_price || product.price));
  };

  const handleEdit = (s: Sale) => {
    setEditing(s);
    setCustomerId(s.customer_id || "");
    setProductId(s.product_id || "");
    setQuantity(String(s.quantity));
    setPrice(String(s.price));
    setDate(s.date);
    setNotes(s.notes || "");
    setShowForm(true);
  };

  const handleSave = async (e: any) => {
    e.preventDefault();
    const qty = Number(quantity);
    const unitPrice = Number(price);
    const total = qty * unitPrice;

    const product = products.find((p) => p.id === productId);
    const cost = (product ? Number(product.price) : 0) * qty;

    if (editing) {
      await supabase.from("sales").update({
        customer_id: customerId || null,
        product_id: productId || null,
        quantity: qty,
        price: unitPrice,
        total, cost, date, notes,
      }).eq("id", editing.id);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles").select("tenant_id").eq("id", user.id).single();
      if (!profile?.tenant_id) return;
      await supabase.from("sales").insert({
        customer_id: customerId || null,
        product_id: productId || null,
        quantity: qty,
        price: unitPrice,
        total, cost, date, notes,
        tenant_id: profile.tenant_id,
      });
    }
    fetchAll();
    resetForm();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("sales").delete().eq("id", id);
    setSales(sales.filter((s) => s.id !== id));
  };

  return (
    <DashboardLayout>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: "bold" }}>{t.satislarTitle}</h1>
          <button onClick={() => { resetForm(); setShowForm(true); }}
            style={{ padding: "10px 20px", background: "#6366f1", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}>
            {t.newSale}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSave} style={{ background: "white", padding: 24, borderRadius: 12, marginBottom: 24, display: "flex", flexDirection: "column", gap: 12, maxWidth: 500 }}>
            <h2 style={{ fontSize: 18, fontWeight: "bold" }}>{editing ? t.editSale : t.newSaleForm}</h2>
            <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}
              style={{ padding: 10, border: "1px solid #ccc", borderRadius: 6 }}>
              <option value="">{t.selectCustomer}</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={productId} onChange={(e) => handleProductChange(e.target.value)}
              style={{ padding: 10, border: "1px solid #ccc", borderRadius: 6 }}>
              <option value="">{t.selectProduct}</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input type="number" placeholder={t.quantity} value={quantity} onChange={(e) => setQuantity(e.target.value)}
              style={{ padding: 10, border: "1px solid #ccc", borderRadius: 6 }} />
            <input type="number" placeholder={t.unitPrice} value={price} onChange={(e) => setPrice(e.target.value)}
              style={{ padding: 10, border: "1px solid #ccc", borderRadius: 6 }} />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              style={{ padding: 10, border: "1px solid #ccc", borderRadius: 6 }} />
            <input placeholder={t.notes} value={notes} onChange={(e) => setNotes(e.target.value)}
              style={{ padding: 10, border: "1px solid #ccc", borderRadius: 6 }} />
            <div style={{ background: "#f5f5f5", padding: 10, borderRadius: 6 }}>
              <strong>{t.total}: {(Number(quantity) * Number(price)).toFixed(2)} TL</strong>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" style={{ padding: "10px 20px", background: "black", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}>
                {editing ? t.update : t.save}
              </button>
              <button type="button" onClick={resetForm} style={{ padding: "10px 20px", background: "#eee", border: "none", borderRadius: 6, cursor: "pointer" }}>
                {t.cancel}
              </button>
            </div>
          </form>
        )}

        <table style={{ width: "100%", borderCollapse: "collapse", background: "white", borderRadius: 12 }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #eee", padding: 12, textAlign: "left" }}>{t.date}</th>
              <th style={{ borderBottom: "1px solid #eee", padding: 12, textAlign: "left" }}>{t.customer}</th>
              <th style={{ borderBottom: "1px solid #eee", padding: 12, textAlign: "left" }}>{t.product}</th>
              <th style={{ borderBottom: "1px solid #eee", padding: 12, textAlign: "left" }}>{t.quantity}</th>
              <th style={{ borderBottom: "1px solid #eee", padding: 12, textAlign: "left" }}>{t.unitPrice}</th>
              <th style={{ borderBottom: "1px solid #eee", padding: 12, textAlign: "left" }}>{t.total}</th>
              <th style={{ borderBottom: "1px solid #eee", padding: 12, textAlign: "left" }}>{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((s) => (
              <tr key={s.id}>
                <td style={{ padding: 12 }}>{s.date}</td>
                <td style={{ padding: 12 }}>{customers.find((c) => c.id === s.customer_id)?.name || "-"}</td>
                <td style={{ padding: 12 }}>{products.find((p) => p.id === s.product_id)?.name || "-"}</td>
                <td style={{ padding: 12 }}>{s.quantity}</td>
                <td style={{ padding: 12 }}>{s.price} TL</td>
                <td style={{ padding: 12 }}>{s.total} TL</td>
                <td style={{ padding: 12 }}>
                  <button onClick={() => handleEdit(s)} style={{ padding: "6px 12px", background: "blue", color: "white", borderRadius: 6, border: "none", cursor: "pointer", marginRight: 8 }}>{t.edit}</button>
                  <button onClick={() => handleDelete(s.id)} style={{ padding: "6px 12px", background: "red", color: "white", borderRadius: 6, border: "none", cursor: "pointer" }}>{t.delete}</button>
                </td>
              </tr>
            ))}
            {sales.length === 0 && (
              <tr>
                <td colSpan={7}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "52px 24px" }}>
                    <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>📊</div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: "#374151", margin: 0 }}>Henüz kayıt bulunmuyor.</p>
                    <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>Kullanıma hazır.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
