"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import { useLang } from "@/lib/LangContext";

type Product = {
  id: string;
  name: string;
  stock: number;
  price: number;
  selling_price: number;
  barcode: string | null;
};

export default function StokListesi() {
  const { t } = useLang();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [barcodeMsg, setBarcodeMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const barcodeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProducts();
    barcodeRef.current?.focus();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, stock, price, selling_price, barcode")
      .order("created_at", { ascending: false });
    if (!error && data) setProducts(data);
  };

  // Barkod okutunca ürünü bul ve düzenleme sayfasına yönlendir
  const handleBarcodeEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const val = barcodeInput.trim();
    if (!val) return;

    const found = products.find((p) => p.barcode === val);
    if (found) {
      setBarcodeMsg({ text: `${found.name} bulundu`, ok: true });
      setTimeout(() => {
        window.location.href = `/stok/duzenle/${found.id}`;
      }, 800);
    } else {
      setBarcodeMsg({ text: `${t.barcodeNotFound} ${val}`, ok: false });
      setTimeout(() => {
        setBarcodeMsg(null);
        barcodeRef.current?.focus();
      }, 2500);
    }
    setBarcodeInput("");
  };

  const handleDelete = async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    setProducts(products.filter((p) => p.id !== id));
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.barcode ?? "").includes(search)
  );

  const th: React.CSSProperties = {
    padding: "10px 14px", textAlign: "left", fontSize: 12,
    color: "#555", fontWeight: 600, borderBottom: "2px solid #eee",
    background: "#f9fafb",
  };
  const td: React.CSSProperties = {
    padding: "10px 14px", fontSize: 13, borderBottom: "1px solid #f3f4f6",
  };

  return (
    <DashboardLayout>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h1 style={{ fontSize: 26, fontWeight: "bold" }}>{t.stokTitle}</h1>
          <a href="/stok/ekle" style={{
            padding: "10px 20px", background: "#6366f1", color: "white",
            borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 14,
          }}>
            + {t.addProduct}
          </a>
        </div>

        {/* Barkod satırı — okutunca ürün düzenleme sayfasına gider */}
        <div style={{
          background: "white", padding: "16px 20px", borderRadius: 12, marginBottom: 16,
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)", border: "2px solid #6366f1",
        }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 8 }}>
            🔖 Barkod ile Ürün Ara / Düzenle
          </label>
          <input
            ref={barcodeRef}
            type="text"
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            onKeyDown={handleBarcodeEnter}
            placeholder="Barkod okutun — ürün düzenleme sayfasına yönlendirir"
            autoComplete="off"
            style={{
              width: "100%", padding: "10px 14px", border: "2px solid #6366f1",
              borderRadius: 8, fontSize: 15, outline: "none", boxSizing: "border-box",
            }}
          />
          {barcodeMsg && (
            <p style={{ marginTop: 8, fontSize: 13, fontWeight: 500, color: barcodeMsg.ok ? "#10b981" : "#ef4444" }}>
              {barcodeMsg.ok ? "✓" : "✗"} {barcodeMsg.text}
            </p>
          )}
        </div>

        {/* Metin arama */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`${t.productName} veya barkod ara...`}
          style={{
            width: "100%", padding: "10px 14px", border: "1px solid #e5e7eb",
            borderRadius: 8, fontSize: 14, marginBottom: 16,
            outline: "none", boxSizing: "border-box",
          }}
        />

        <div className="table-scroll" style={{ background: "white", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
            <thead>
              <tr>
                <th style={th}>{t.productName}</th>
                <th style={th}>🔖 Barkod</th>
                <th style={th}>{t.stockCount}</th>
                <th style={th}>{t.buyPrice}</th>
                <th style={th}>{t.sellPrice}</th>
                <th style={th}>{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td style={td}>
                    <span style={{ fontWeight: 500 }}>{p.name}</span>
                  </td>
                  <td style={td}>
                    {p.barcode ? (
                      <span style={{
                        background: "#ede9fe", color: "#6366f1",
                        padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                        fontFamily: "monospace",
                      }}>
                        {p.barcode}
                      </span>
                    ) : (
                      <span style={{ color: "#ccc", fontSize: 12 }}>—</span>
                    )}
                  </td>
                  <td style={{ ...td, color: p.stock <= 0 ? "#ef4444" : p.stock <= 5 ? "#f59e0b" : undefined }}>
                    {p.stock}
                  </td>
                  <td style={td}>{Number(p.price).toFixed(2)} TL</td>
                  <td style={{ ...td, color: "#10b981", fontWeight: 600 }}>
                    {Number(p.selling_price).toFixed(2)} TL
                  </td>
                  <td style={td}>
                    <a href={`/stok/duzenle/${p.id}`} style={{
                      padding: "5px 12px", background: "#6366f1", color: "white",
                      borderRadius: 6, textDecoration: "none", marginRight: 6, fontSize: 12, fontWeight: 600,
                    }}>
                      {t.edit}
                    </a>
                    <button onClick={() => handleDelete(p.id)} style={{
                      padding: "5px 12px", background: "#fee2e2", color: "#dc2626",
                      borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                    }}>
                      {t.delete}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "52px 24px" }}>
                      <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>📦</div>
                      <p style={{ fontSize: 15, fontWeight: 600, color: "#374151", margin: 0 }}>Henüz kayıt bulunmuyor.</p>
                      <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>Kullanıma hazır.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
