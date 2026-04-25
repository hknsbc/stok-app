"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import { useMode } from "@/lib/ModeContext";
import Link from "next/link";
import SKTWarningCard from "@/components/pet/SKTWarningCard";

type Product = { id: string; name: string; stock: number; selling_price: number; barcode: string | null; category: string | null };

export default function MarineDashboard() {
  const { theme } = useMode();
  const barcodeRef = useRef<HTMLInputElement>(null);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [barcodeMsg, setBarcodeMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [todaySales, setTodaySales] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    barcodeRef.current?.focus();
    const fetchAll = async () => {
      const today = new Date().toISOString().split("T")[0];
      const [prodRes, salesRes] = await Promise.all([
        supabase.from("products").select("id, name, stock, selling_price, barcode, category"),
        supabase.from("sales").select("total").gte("created_at", today + "T00:00:00"),
      ]);
      if (prodRes.data) {
        setProducts(prodRes.data);
        setLowStockCount(prodRes.data.filter((p) => p.stock <= 5).length);
      }
      if (salesRes.data) {
        setTodaySales(salesRes.data.reduce((s, r) => s + (r.total ?? 0), 0));
      }
    };
    fetchAll();
  }, []);

  const handleBarcodeEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const val = barcodeInput.trim();
    if (!val) return;
    const found = products.find((p) => p.barcode === val);
    if (found) {
      setBarcodeMsg({ text: `${found.name} — ₺${Number(found.selling_price).toFixed(2)} — Stok: ${found.stock}`, ok: true });
    } else {
      setBarcodeMsg({ text: `Barkod bulunamadı: ${val}`, ok: false });
    }
    setBarcodeInput("");
    setTimeout(() => { setBarcodeMsg(null); barcodeRef.current?.focus(); }, 3000);
  };

  const statsData = [
    { label: "Bugünkü Satış", value: `₺${todaySales.toFixed(2)}`, color: theme.primary, icon: "⚓" },
    { label: "Toplam Ürün", value: String(products.length), color: "#22c55e", icon: "📦" },
    { label: "Kritik Stok", value: String(lowStockCount), color: lowStockCount > 0 ? "#ef4444" : "#16a34a", icon: "⚠️" },
  ];

  const card: React.CSSProperties = { background: "white", borderRadius: 14, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" };

  return (
    <DashboardLayout>
      <div style={{ paddingBottom: 32 }}>
        <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 32 }}>⚓</span>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: "bold", color: "#0c2340", margin: 0 }}>{theme.panelTitle}</h1>
            <p style={{ color: "#888", margin: 0, fontSize: 13 }}>Marine bakım ve stok yönetimi</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
          {statsData.map((s) => (
            <div key={s.label} style={{ ...card, borderLeft: `4px solid ${s.color}`, padding: "16px 18px" }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 20, fontWeight: "bold", color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#888" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={card}>
              <h2 style={{ fontSize: 15, fontWeight: "bold", marginBottom: 14 }}>🔖 Barkod ile Ürün Ara</h2>
              <input
                ref={barcodeRef}
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={handleBarcodeEnter}
                placeholder="Barkod okutun..."
                autoComplete="off"
                style={{
                  width: "100%", padding: "9px 12px", border: `2px solid ${theme.primary}`,
                  borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box",
                }}
              />
              {barcodeMsg && (
                <p style={{ marginTop: 8, fontSize: 13, fontWeight: 500, color: barcodeMsg.ok ? "#16a34a" : "#ef4444" }}>
                  {barcodeMsg.ok ? "✓" : "✗"} {barcodeMsg.text}
                </p>
              )}
            </div>
            <div style={card}>
              <h2 style={{ fontSize: 15, fontWeight: "bold", marginBottom: 12 }}>🚀 Hızlı Bağlantılar</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { href: "/yeni-satis", label: "🧾 Yeni Satış Yap" },
                  { href: "/stok/ekle", label: "📦 Ürün Ekle" },
                  { href: "/stok", label: "📋 Stok Listesi" },
                ].map((item) => (
                  <Link key={item.href} href={item.href} style={{
                    display: "block", padding: "9px 14px", background: theme.primary,
                    color: "white", borderRadius: 8, textDecoration: "none",
                    fontSize: 13, fontWeight: 600, textAlign: "center",
                  }}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <SKTWarningCard />
            <div style={card}>
              <h2 style={{ fontSize: 15, fontWeight: "bold", marginBottom: 12 }}>📦 Kritik Stok</h2>
              {lowStockCount === 0 ? (
                <p style={{ fontSize: 13, color: "#16a34a", margin: 0, fontWeight: 500 }}>✓ Kritik stok yok</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {products.filter((p) => p.stock <= 5).slice(0, 6).map((p) => (
                    <div key={p.id} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "8px 12px", borderRadius: 8,
                      background: p.stock <= 0 ? "#fef2f2" : "#ecfeff",
                      border: `1px solid ${p.stock <= 0 ? "#fecaca" : "#a5f3fc"}`,
                    }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</span>
                      <span style={{ fontSize: 12, fontWeight: "bold", color: p.stock <= 0 ? "#ef4444" : theme.primary }}>
                        {p.stock} adet
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
