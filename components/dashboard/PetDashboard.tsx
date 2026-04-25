"use client";
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useMode } from "@/lib/ModeContext";

const CATEGORIES = [
  { icon: "🦴", label: "Mama" },
  { icon: "🪣", label: "Kum" },
  { icon: "🎾", label: "Aksesuar" },
  { icon: "💊", label: "İlaç / Vitamin" },
  { icon: "🛁", label: "Bakım" },
];

const EXPIRY_ALERTS = [
  { name: "Premium Kedi Maması 2kg", sku: "PKM-001", daysLeft: 5, stock: 12 },
  { name: "Köpek Vitamini Damla", sku: "KVD-042", daysLeft: 9, stock: 3 },
  { name: "Tavşan Granül Yem", sku: "TGY-017", daysLeft: 14, stock: 7 },
];

const LOYALTY_CUSTOMERS = [
  { name: "Ayşe Kaya", pet: "Tekir (Kedi)", points: 340, card: "PC-00123" },
  { name: "Murat Demir", pet: "Karabaş (Köpek)", points: 185, card: "PC-00087" },
  { name: "Fatma Yıldız", pet: "Pamuk (Tavşan)", points: 510, card: "PC-00201" },
];

const STATS = [
  { label: "Bugünkü Satış", value: "₺4.280", color: "#f97316", icon: "🛒" },
  { label: "Toplam Ürün", value: "863", color: "#22c55e", icon: "📦" },
  { label: "Aktif Pet Kartı", value: "47", color: "#0ea5e9", icon: "🐾" },
  { label: "SKT Uyarısı", value: "3", color: "#ef4444", icon: "⚠️" },
];

export default function PetDashboard() {
  const { theme } = useMode();
  const [barcode, setBarcode] = useState("");
  const [scanned, setScanned] = useState<string | null>(null);

  const handleBarcodeScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim()) return;
    setScanned(`Ürün: "Premium Kedi Maması 2kg" — ₺189,90 — Stok: 12`);
    setBarcode("");
  };

  return (
    <DashboardLayout>
      <div style={{ padding: "0 0 32px" }}>
        {/* Header */}
        <div style={{ marginBottom: 28, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 32 }}>🐾</span>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: "bold", color: "#1e1b4b", margin: 0 }}>
              PetShop Paneli
            </h1>
            <p style={{ color: "#888", margin: 0, fontSize: 14 }}>
              Petshop yönetim merkezi
            </p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
          {STATS.map((s) => (
            <div key={s.label} style={{
              background: "white", borderRadius: 12, padding: "18px 20px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              borderLeft: `4px solid ${s.color}`,
            }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: "bold", color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 13, color: "#888" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          {/* Barkodlu Satış */}
          <div style={{ background: "white", borderRadius: 14, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <h2 style={{ fontSize: 16, fontWeight: "bold", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <span>🔖</span> Barkodlu Satış
            </h2>
            <form onSubmit={handleBarcodeScan} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Barkod okutun veya yazın..."
                style={{
                  flex: 1, padding: "9px 12px", border: "1px solid #e5e7eb",
                  borderRadius: 8, fontSize: 14, outline: "none",
                }}
                autoFocus
              />
              <button
                type="submit"
                style={{
                  padding: "9px 18px", background: theme.primary,
                  color: "white", border: "none", borderRadius: 8,
                  cursor: "pointer", fontWeight: "bold", fontSize: 14,
                }}
              >
                Ara
              </button>
            </form>
            {scanned && (
              <div style={{
                background: "#f0fdf4", border: "1px solid #86efac",
                borderRadius: 8, padding: "10px 14px", fontSize: 14, color: "#166534",
              }}>
                ✓ {scanned}
              </div>
            )}

            {/* Category pills */}
            <div style={{ marginTop: 16 }}>
              <p style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>Kategoriler</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {CATEGORIES.map((c) => (
                  <button
                    key={c.label}
                    style={{
                      padding: "5px 12px", background: "#fff7ed",
                      border: "1px solid #fed7aa", borderRadius: 20,
                      fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                    }}
                  >
                    {c.icon} {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SKT Uyarıları */}
          <div style={{ background: "white", borderRadius: 14, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <h2 style={{ fontSize: 16, fontWeight: "bold", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <span>⚠️</span> SKT Yaklaşan Ürünler
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {EXPIRY_ALERTS.map((item) => (
                <div key={item.sku} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 14px", borderRadius: 8,
                  background: item.daysLeft <= 7 ? "#fef2f2" : "#fffbeb",
                  border: `1px solid ${item.daysLeft <= 7 ? "#fecaca" : "#fde68a"}`,
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: "#888" }}>{item.sku} · Stok: {item.stock}</div>
                  </div>
                  <span style={{
                    fontSize: 12, fontWeight: "bold", padding: "3px 10px", borderRadius: 20,
                    background: item.daysLeft <= 7 ? "#ef4444" : "#f59e0b",
                    color: "white",
                  }}>
                    {item.daysLeft} gün
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pet / Sadakat Kartları */}
        <div style={{ background: "white", borderRadius: 14, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
          <h2 style={{ fontSize: 16, fontWeight: "bold", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <span>🐾</span> Pet Kart / Sadakat Kart
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            {LOYALTY_CUSTOMERS.map((c) => (
              <div key={c.card} style={{
                padding: "14px 16px", borderRadius: 10,
                background: "linear-gradient(135deg, #fff7ed, #fef3c7)",
                border: "1px solid #fed7aa",
              }}>
                <div style={{ fontSize: 15, fontWeight: "bold", marginBottom: 2 }}>{c.name}</div>
                <div style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>🐾 {c.pet}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "#888" }}>{c.card}</span>
                  <span style={{
                    fontSize: 13, fontWeight: "bold",
                    color: theme.primary,
                  }}>
                    {c.points} puan
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
