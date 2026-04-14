"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface PageProps {
  params: {
    id: string;
  };
}

export default function UrunDuzenle({ params }: PageProps) {
  const { id } = params;
  const router = useRouter();

  const [name, setName] = useState("");
  const [stock, setStock] = useState("");

  useEffect(() => {
    console.log("Düzenlenen ürün ID:", id);
  }, [id]);

  const handleSave = async () => {
    console.log("Kaydedilen ürün:", { id, name, stock });
    router.push("/stok");
  };

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold" }}>
        Ürün Düzenle: {id}
      </h1>

      <div style={{ marginTop: 20 }}>
        <label>Ürün Adı</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            display: "block",
            marginTop: 5,
            padding: 10,
            width: 300,
            border: "1px solid #ccc",
            borderRadius: 6,
          }}
        />
      </div>

      <div style={{ marginTop: 20 }}>
        <label>Stok</label>
        <input
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          style={{
            display: "block",
            marginTop: 5,
            padding: 10,
            width: 300,
            border: "1px solid #ccc",
            borderRadius: 6,
          }}
        />
      </div>

      <button
        onClick={handleSave}
        style={{
          marginTop: 30,
          padding: "12px 20px",
          background: "black",
          color: "white",
          borderRadius: 6,
        }}
      >
        Kaydet
      </button>
    </div>
  );
}