"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";

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

  useEffect(() => { fetchAll(); }, []);

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

  const handleBarcodeSearch = (barcodeVal: string) => {
    if (!barcodeVal.trim()) return;
    const found = products.find((p) => p.barcode === barcodeVal.trim());
    if (found) {
      handleProductChange(found.id);
    } else {
      alert("Barkod ile eslesen urun bulunamadi: " + barcodeVal);
    }
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

  const handleSave = async (e: any) => {
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
  };

  const handleDelete = async (id: string) => {
    await supabase.from("purchases").delete().eq("id", id);
    setPurchases(purchases.filter((p) => p.id !== id));
  };

  return (
    <DashboardLayout>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: "bold" }}>Alislar</h1>
          <button onClick={() => { resetForm(); setShowForm(true); }}
            style={{ padding: "10px 20px", background: "#6366f1", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}>
            Yeni Alis Ekle
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSave} style={{ background: "white", padding: 24, borderRadius: 12, marginBottom: 24, display: "flex", flexDirection: "column", gap: 12, maxWidth: 500 }}>
            <h2 style={{ fontSize: 18, fontWeight: "bold" }}>{editing ? "Alis Duzenle" : "Yeni Alis"}</h2>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                placeholder="Barkod okutun veya girin, Enter'a basin"
                style={{ flex: 1, padding: 10, border: "1px solid #6366f1", borderRadius: 6, fontSize: 14 }}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleBarcodeSearch((e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = ""; } }}
              />
            </div>
            <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}
              style={{ padding: 10, border: "1px solid #ccc", borderRadius: 6 }}>
              <option value="">Cari Sec</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={productId} onChange={(e) => handleProductChange(e.target.value)}
              style={{ padding: 10, border: "1px solid #ccc", borderRadius: 6 }}>
              <option value="">Urun Sec</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input type="number" placeholder="Miktar" value={quantity} onChange={(e) => setQuantity(e.target.value)}
              style={{ padding: 10, border: "1px solid #ccc", borderRadius: 6 }} />
            <input type="number" placeholder="Birim Fiyat" value={price} onChange={(e) => setPrice(e.target.value)}
              style={{ padding: 10, border: "1px solid #ccc", borderRadius: 6 }} />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              style={{ padding: 10, border: "1px solid #ccc", borderRadius: 6 }} />
            <input placeholder="Not" value={notes} onChange={(e) => setNotes(e.target.value)}
              style={{ padding: 10, border: "1px solid #ccc", borderRadius: 6 }} />
            <div style={{ background: "#f5f5f5", padding: 10, borderRadius: 6 }}>
              <strong>Toplam: {(Number(quantity) * Number(price)).toFixed(2)} TL</strong>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" style={{ padding: "10px 20px", background: "black", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}>
                {editing ? "Guncelle" : "Kaydet"}
              </button>
              <button type="button" onClick={resetForm} style={{ padding: "10px 20px", background: "#eee", border: "none", borderRadius: 6, cursor: "pointer" }}>
                Iptal
              </button>
            </div>
          </form>
        )}

        <table style={{ width: "100%", borderCollapse: "collapse", background: "white", borderRadius: 12 }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #eee", padding: 12, textAlign: "left" }}>Tarih</th>
              <th style={{ borderBottom: "1px solid #eee", padding: 12, textAlign: "left" }}>Cari</th>
              <th style={{ borderBottom: "1px solid #eee", padding: 12, textAlign: "left" }}>Urun</th>
              <th style={{ borderBottom: "1px solid #eee", padding: 12, textAlign: "left" }}>Miktar</th>
              <th style={{ borderBottom: "1px solid #eee", padding: 12, textAlign: "left" }}>Birim Fiyat</th>
              <th style={{ borderBottom: "1px solid #eee", padding: 12, textAlign: "left" }}>Toplam</th>
              <th style={{ borderBottom: "1px solid #eee", padding: 12, textAlign: "left" }}>Islem</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((p) => (
              <tr key={p.id}>
                <td style={{ padding: 12 }}>{p.date}</td>
                <td style={{ padding: 12 }}>{customers.find((c) => c.id === p.customer_id)?.name || "-"}</td>
                <td style={{ padding: 12 }}>{products.find((pr) => pr.id === p.product_id)?.name || "-"}</td>
                <td style={{ padding: 12 }}>{p.quantity}</td>
                <td style={{ padding: 12 }}>{p.price} TL</td>
                <td style={{ padding: 12 }}>{p.total} TL</td>
                <td style={{ padding: 12 }}>
                  <button onClick={() => handleEdit(p)} style={{ padding: "6px 12px", background: "blue", color: "white", borderRadius: 6, border: "none", cursor: "pointer", marginRight: 8 }}>Duzenle</button>
                  <button onClick={() => handleDelete(p.id)} style={{ padding: "6px 12px", background: "red", color: "white", borderRadius: 6, border: "none", cursor: "pointer" }}>Sil</button>
                </td>
              </tr>
            ))}
            {purchases.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 20, textAlign: "center", color: "#777" }}>Henuz alis eklenmemis.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}