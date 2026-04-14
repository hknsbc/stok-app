"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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
    <div style={{ padding: 40 }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold" }}>Stok Listesi</h1>
      <a href="/stok/ekle" style={{ display: "inline-block", marginTop: 20, marginBottom: 20, padding: "10px 20px", background: "black", color: "white", borderRadius: 6, textDecoration: "none" }}>
        Yeni Urun Ekle
      </a>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #ccc", padding: 10 }}>Urun</th>
            <th style={{ borderBottom: "1px solid #ccc", padding: 10 }}>Stok</th>
            <th style={{ borderBottom: "1px solid #ccc", padding: 10 }}>Fiyat</th>
            <th style={{ borderBottom: "1px solid #ccc", padding: 10 }}>Islem</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td style={{ padding: 10 }}>{p.name}</td>
              <td style={{ padding: 10 }}>{p.stock}</td>
              <td style={{ padding: 10 }}>{p.price} TL</td>
              <td style={{ padding: 10 }}>
                <a href={`/stok/duzenle/${p.id}`} style={{ padding: "6px 12px", background: "blue", color: "white", borderRadius: 6, textDecoration: "none", marginRight: 10 }}>Duzenle</a>
                <button onClick={() => handleDelete(p.id)} style={{ padding: "6px 12px", background: "red", color: "white", borderRadius: 6, border: "none", cursor: "pointer" }}>Sil</button>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan={4} style={{ padding: 20, textAlign: "center", color: "#777" }}>Henuz urun eklenmemis.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}