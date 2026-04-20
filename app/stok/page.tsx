"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";

type Product = {
  id: string;
  name: string;
  stock: number;
  price: number;
};

export default function StokListesi() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) setProducts(data);
    };
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    setProducts(products.filter((p) => p.id !== id));
  };

  return (
    <DashboardLayout>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: "bold", marginBottom: 20 }}>Stok Listesi</h1>
        <a href="/stok/ekle" style={{ display: "inline-block", marginBottom: 20, padding: "10px 20px", background: "black", color: "white", borderRadius: 6, textDecoration: "none" }}>
          Yeni Urun Ekle
        </a>
        <table style={{ width: "100%", borderCollapse: "collapse", background: "white", borderRadius: 8 }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #eee", padding: 12, textAlign: "left" }}>Urun Adi</th>
              <th style={{ borderBottom: "1px solid #eee", padding: 12, textAlign: "left" }}>Stok Adedi</th>
              <th style={{ borderBottom: "1px solid #eee", padding: 12, textAlign: "left" }}>Islem</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td style={{ padding: 12 }}>{p.name}</td>
                <td style={{ padding: 12 }}>{p.stock}</td>
                <td style={{ padding: 12 }}>
                  <a href={`/stok/duzenle/${p.id}`} style={{ padding: "6px 12px", background: "blue", color: "white", borderRadius: 6, textDecoration: "none", marginRight: 10 }}>Duzenle</a>
                  <button onClick={() => handleDelete(p.id)} style={{ padding: "6px 12px", background: "red", color: "white", borderRadius: 6, border: "none", cursor: "pointer" }}>Sil</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={3} style={{ padding: 20, textAlign: "center", color: "#777" }}>Henuz urun eklenmemis.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}