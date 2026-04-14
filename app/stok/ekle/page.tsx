"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function UrunEkle() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [stock, setStock] = useState("");
  const [price, setPrice] = useState("");

  const handleSave = async (e: any) => {
    e.preventDefault();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert("Giriş yapmanız gerekiyor!"); return; }

    const { data: profile } = await supabase
      .from("profiles")
      .select("tenant_id")
      .eq("id", user.id)
      .single();

    if (!profile?.tenant_id) { alert("Tenant bulunamadı!"); return; }

    const { error } = await supabase.from("products").insert({
      name,
      stock: Number(stock),
      price: Number(price),
      tenant_id: profile.tenant_id,
    });

    if (error) { alert("Hata: " + error.message); return; }

    alert("Ürün eklendi!");
    router.push("/stok");
  };

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold" }}>Yeni Ürün Ekle</h1>
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