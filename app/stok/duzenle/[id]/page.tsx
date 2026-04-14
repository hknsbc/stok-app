"use client";
import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function UrunDuzenle({ params }: any) {
  const { id } = use(params);
  const router = useRouter();
  const [name, setName] = useState("");
  const [stock, setStock] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();
      if (!error && data) {
        setName(data.name);
        setStock(String(data.stock));
        setPrice(String(data.price));
      }
    };
    if (id) fetchProduct();
  }, [id]);

  const handleSave = async (e: any) => {
    e.preventDefault();
    const { error } = await supabase
      .from("products")
      .update({ name, stock: Number(stock), price: Number(price) })
      .eq("id", id);
    if (error) { alert("Hata: " + error.message); return; }
    alert("Ürün güncellendi!");
    router.push("/stok");
  };

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold" }}>Ürünü Düzenle</h1>
      <form
        onSubmit={handleSave}
        style={{ marginTop: 20, display: "flex", flexDirection: "column", width: 300, gap: 10 }}
      >
        <input
          type="text"
          placeholder="Ürün adı"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: 10, border: "1px solid #ccc", borderRadius: 6 }}
        />
        <input
          type="number"
          placeholder="Stok adedi"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          style={{ padding: 10, border: "1px solid #ccc", borderRadius: 6 }}
        />
        <input
          type="number"
          placeholder="Fiyat (TL)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={{ padding: 10, border: "1px solid #ccc", borderRadius: 6 }}
        />
        <button style={{ padding: 10, background: "black", color: "white", borderRadius: 6, border: "none", cursor: "pointer" }}>
          Kaydet
        </button>
      </form>
    </div>
  );
}