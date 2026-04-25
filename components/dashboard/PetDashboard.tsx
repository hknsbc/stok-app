"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import { useMode } from "@/lib/ModeContext";
import Link from "next/link";
import SKTWarningCard from "@/components/pet/SKTWarningCard";

type Product = { id: string; name: string; price: number; selling_price: number; stock: number; barcode: string | null };
type PetCard = { id: string; pet_name: string; owner_name: string; species: string | null; loyalty_points: number };
type SaleItem = { id: string; product_id: string; quantity: number; total: number; created_at: string };

function daysUntil(dateStr: string): number {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const expiry = new Date(dateStr);
  return Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

const SPECIES_EMOJI: Record<string, string> = {
  Kedi: "🐱", Köpek: "🐶", Kuş: "🐦", Balık: "🐠", Tavşan: "🐰", Hamster: "🐹",
};

export default function PetDashboard() {
  const { theme } = useMode();
  const barcodeRef = useRef<HTMLInputElement>(null);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [barcodeMsg, setBarcodeMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [petCards, setPetCards] = useState<PetCard[]>([]);
  const [todaySales, setTodaySales] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [sktCount, setSktCount] = useState(0);
  const [recentCards, setRecentCards] = useState<PetCard[]>([]);

  useEffect(() => {
    barcodeRef.current?.focus();
    const fetchAll = async () => {
      const today = new Date().toISOString().split("T")[0];

      const [prodRes, petRes, salesRes, expiryRes] = await Promise.all([
        supabase.from("products").select("id, name, price, selling_price, stock, barcode"),
        supabase.from("pet_cards").select("id, pet_name, owner_name, species, loyalty_points").order("created_at", { ascending: false }),
        supabase.from("sales").select("id, product_id, quantity, total, created_at").gte("created_at", today + "T00:00:00"),
        supabase.from("products").select("expiry_date").not("expiry_date", "is", null),
      ]);

      if (prodRes.data) {
        setProducts(prodRes.data);
        setLowStockCount(prodRes.data.filter((p) => p.stock <= 5).length);
      }
      if (petRes.data) {
        setPetCards(petRes.data);
        setRecentCards(petRes.data.slice(0, 5));
      }
      if (salesRes.data) {
        const total = salesRes.data.reduce((sum, s) => sum + (s.total ?? 0), 0);
        setTodaySales(total);
      }
      if (expiryRes.data) {
        const urgent = expiryRes.data.filter((p) => {
          const d = daysUntil(p.expiry_date!);
          return d <= 30;
        }).length;
        setSktCount(urgent);
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
    setTimeout(() => {
      setBarcodeMsg(null);
      barcodeRef.current?.focus();
    }, 3000);
  };

  const statsData = [
    { label: "Bugünkü Satış", value: `₺${todaySales.toFixed(2)}`, color: theme.primary, icon: "🛒" },
    { label: "Toplam Ürün", value: String(products.length), color: "#22c55e", icon: "📦" },
    { label: "Pet Kartı", value: String(petCards.length), color: "#0ea5e9", icon: "🐾" },
    { label: "SKT Uyarısı", value: String(sktCount), color: sktCount > 0 ? "#ef4444" : "#16a34a", icon: "⚠️" },
  ];

  const card: React.CSSProperties = {
    background: "white", borderRadius: 14, padding: 20,
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  };

  return (
    <DashboardLayout>
      <div style={{ paddingBottom: 32 }}>
        {/* Header */}
        <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 32 }}>🐾</span>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: "bold", color: "#1e1b4b", margin: 0 }}>PetShop Paneli</h1>
            <p style={{ color: "#888", margin: 0, fontSize: 13 }}>Petshop yönetim merkezi</p>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
          {statsData.map((s) => (
            <div key={s.label} style={{ ...card, borderLeft: `4px solid ${s.color}`, padding: "16px 18px" }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 20, fontWeight: "bold", color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#888" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* 3-column layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>

          {/* COL 1 — Satış & Barkod */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={card}>
              <h2 style={{ fontSize: 15, fontWeight: "bold", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                🔖 Barkod ile Ürün Ara
              </h2>
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
                <p style={{
                  marginTop: 8, fontSize: 13, fontWeight: 500,
                  color: barcodeMsg.ok ? "#16a34a" : "#ef4444",
                }}>
                  {barcodeMsg.ok ? "✓" : "✗"} {barcodeMsg.text}
                </p>
              )}
            </div>

            <div style={card}>
              <h2 style={{ fontSize: 15, fontWeight: "bold", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                🛒 Hızlı Bağlantılar
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { href: "/yeni-satis", label: "🧾 Yeni Satış Yap", color: theme.primary },
                  { href: "/stok/ekle", label: "📦 Ürün Ekle", color: "#6366f1" },
                  { href: "/pet/kart/ekle", label: "🐾 Yeni Pet Kartı", color: "#0ea5e9" },
                ].map((item) => (
                  <Link key={item.href} href={item.href} style={{
                    display: "block", padding: "9px 14px", background: item.color,
                    color: "white", borderRadius: 8, textDecoration: "none",
                    fontSize: 13, fontWeight: 600, textAlign: "center",
                  }}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* COL 2 — Stok & SKT */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <SKTWarningCard />

            <div style={card}>
              <h2 style={{ fontSize: 15, fontWeight: "bold", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                📦 Kritik Stok
              </h2>
              {lowStockCount === 0 ? (
                <p style={{ fontSize: 13, color: "#16a34a", margin: 0, fontWeight: 500 }}>✓ Kritik stok yok</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {products
                    .filter((p) => p.stock <= 5)
                    .slice(0, 6)
                    .map((p) => (
                      <div key={p.id} style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "8px 12px", borderRadius: 8,
                        background: p.stock <= 0 ? "#fef2f2" : "#fff7ed",
                        border: `1px solid ${p.stock <= 0 ? "#fecaca" : "#fed7aa"}`,
                      }}>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</span>
                        <span style={{
                          fontSize: 12, fontWeight: "bold",
                          color: p.stock <= 0 ? "#ef4444" : "#f97316",
                        }}>
                          {p.stock} adet
                        </span>
                      </div>
                    ))}
                  {lowStockCount > 6 && (
                    <Link href="/stok" style={{ fontSize: 12, color: "#6366f1", textDecoration: "none", textAlign: "center" }}>
                      +{lowStockCount - 6} ürün daha →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* COL 3 — Müşteri & Pet Kart */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h2 style={{ fontSize: 15, fontWeight: "bold", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                  🐾 Son Pet Kartları
                </h2>
                <Link href="/pet/kart" style={{ fontSize: 11, color: "#6366f1", textDecoration: "none", fontWeight: 500 }}>
                  Tümünü gör →
                </Link>
              </div>
              {recentCards.length === 0 ? (
                <p style={{ fontSize: 13, color: "#aaa", margin: 0 }}>Henüz pet kartı yok.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {recentCards.map((c) => (
                    <Link key={c.id} href={`/pet/kart/${c.id}`} style={{ textDecoration: "none" }}>
                      <div style={{
                        padding: "10px 12px", borderRadius: 10,
                        background: "linear-gradient(135deg, #fff7ed, #fef3c7)",
                        border: "1px solid #fed7aa",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                      }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: "bold", color: "#1f2937" }}>
                            {SPECIES_EMOJI[c.species ?? ""] ?? "🐾"} {c.pet_name}
                          </div>
                          <div style={{ fontSize: 12, color: "#888" }}>{c.owner_name}</div>
                        </div>
                        <span style={{
                          fontSize: 12, fontWeight: "bold", color: theme.primary,
                          background: "white", border: "1px solid #fed7aa",
                          padding: "3px 10px", borderRadius: 20,
                        }}>
                          {c.loyalty_points} puan
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div style={card}>
              <h2 style={{ fontSize: 15, fontWeight: "bold", marginBottom: 10 }}>📊 Özet</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { label: "Toplam Pet Kartı", value: petCards.length, color: "#0ea5e9" },
                  { label: "Kritik Stok", value: lowStockCount, color: lowStockCount > 0 ? "#f97316" : "#16a34a" },
                  { label: "SKT Uyarısı (≤30g)", value: sktCount, color: sktCount > 0 ? "#ef4444" : "#16a34a" },
                ].map((row) => (
                  <div key={row.label} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "8px 0", borderBottom: "1px solid #f3f4f6",
                  }}>
                    <span style={{ fontSize: 13, color: "#555" }}>{row.label}</span>
                    <span style={{ fontSize: 14, fontWeight: "bold", color: row.color }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
