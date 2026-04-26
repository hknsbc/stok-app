"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import { useMode } from "@/lib/ModeContext";
import Link from "next/link";
import { maintenanceReminderLink } from "@/lib/whatsapp";

type Product = { id: string; name: string; stock: number; selling_price: number; barcode: string | null; category: string | null };
type Boat = { id: string; name: string; owner_name: string; owner_phone: string | null; marina: string | null; engine_type: string | null };
type Maintenance = { id: string; boat_id: string | null; description: string; status: string; date: string; labor_cost: number; parts_cost: number };

const MARINE_CATS = ["Motor Parçaları", "Elektrik / Elektronik", "Fiberglass / Epoksi / Boya", "Sarf Malzemeleri", "Güverte Donanımı", "Emniyet Ekipmanları", "Hidrolik", "Yakıt Sistemi"];

const STATUS_COLORS: Record<string, string> = {
  open: "#2563eb", pending_parts: "#d97706", completed: "#16a34a",
};
const STATUS_BG: Record<string, string> = {
  open: "#eff6ff", pending_parts: "#fffbeb", completed: "#f0fdf4",
};
const STATUS_LABELS: Record<string, string> = {
  open: "Açık", pending_parts: "Parça Bekliyor", completed: "Tamamlandı",
};

const card: React.CSSProperties = {
  background: "white", borderRadius: 14, padding: 20,
  boxShadow: "0 2px 12px rgba(6,182,212,0.08)",
  border: "1px solid #e0f7fa",
};
const sectionTitle: React.CSSProperties = {
  fontSize: 14, fontWeight: 700, color: "#0c2340", marginBottom: 12,
  display: "flex", alignItems: "center", gap: 8,
};

export default function MarineDashboard() {
  const { theme } = useMode();
  const barcodeRef = useRef<HTMLInputElement>(null);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [barcodeMsg, setBarcodeMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const [parts, setParts] = useState<Product[]>([]);
  const [boats, setBoats] = useState<Boat[]>([]);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [todaySales, setTodaySales] = useState(0);

  useEffect(() => {
    barcodeRef.current?.focus();
    const fetchAll = async () => {
      const today = new Date().toISOString().split("T")[0];
      const [partsRes, boatsRes, mainRes, salesRes] = await Promise.all([
        supabase.from("products").select("id, name, stock, selling_price, barcode, category").in("category", MARINE_CATS),
        supabase.from("boat_cards").select("id, name, owner_name, owner_phone, marina, engine_type").order("created_at", { ascending: false }),
        supabase.from("maintenance_records").select("id, boat_id, description, status, date, labor_cost, parts_cost").order("date", { ascending: false }).limit(20),
        supabase.from("sales").select("total").gte("created_at", today + "T00:00:00"),
      ]);
      if (partsRes.data) setParts(partsRes.data);
      if (boatsRes.data) setBoats(boatsRes.data);
      if (mainRes.data) setMaintenances(mainRes.data);
      if (salesRes.data) setTodaySales(salesRes.data.reduce((s, r) => s + (r.total ?? 0), 0));
    };
    fetchAll();
  }, []);

  const handleBarcodeEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const val = barcodeInput.trim();
    if (!val) return;
    const found = parts.find((p) => p.barcode === val);
    if (found) {
      setBarcodeMsg({ text: `${found.name} — ₺${Number(found.selling_price).toFixed(2)} — Stok: ${found.stock}`, ok: true });
    } else {
      setBarcodeMsg({ text: `Barkod bulunamadı: ${val}`, ok: false });
    }
    setBarcodeInput("");
    setTimeout(() => { setBarcodeMsg(null); barcodeRef.current?.focus(); }, 3500);
  };

  const criticalParts = parts.filter((p) => p.stock <= 3);
  const openJobs = maintenances.filter((m) => m.status === "open");
  const pendingJobs = maintenances.filter((m) => m.status === "pending_parts");
  const completedJobs = maintenances.filter((m) => m.status === "completed");
  const boatMap = Object.fromEntries(boats.map((b) => [b.id, b]));

  const catGroups = MARINE_CATS.map((cat) => ({
    cat,
    count: parts.filter((p) => p.category === cat).length,
    critical: parts.filter((p) => p.category === cat && p.stock <= 3).length,
  })).filter((g) => g.count > 0);

  const statsData = [
    { label: "Bugünkü Satış", value: `₺${todaySales.toFixed(2)}`, color: theme.primary, icon: "⚓" },
    { label: "Tekne Kartı", value: String(boats.length), color: "#0891b2", icon: "🚢" },
    { label: "Açık Bakım", value: String(openJobs.length), color: openJobs.length > 0 ? "#d97706" : "#16a34a", icon: "🔧" },
    { label: "Kritik Stok", value: String(criticalParts.length), color: criticalParts.length > 0 ? "#ef4444" : "#16a34a", icon: "⚠️" },
  ];

  return (
    <DashboardLayout>
      <style>{`
        @media (max-width: 1024px) { .marine-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 640px)  { .marine-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      <div style={{ paddingBottom: 32 }}>
        {/* Header */}
        <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: "linear-gradient(135deg, #0c2340, #06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>⚓</div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: "bold", color: "#0c2340", margin: 0 }}>{theme.panelTitle}</h1>
            <p style={{ color: "#94a3b8", margin: 0, fontSize: 13 }}>Marine bakım ve stok yönetimi</p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
          {statsData.map((s) => (
            <div key={s.label} style={{ ...card, borderLeft: `4px solid ${s.color}`, padding: "16px 18px" }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 20, fontWeight: "bold", color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* 3-column grid */}
        <div className="marine-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18, alignItems: "start" }}>

          {/* COL 1 — Parça Stokları */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Barkod */}
            <div style={card}>
              <p style={sectionTitle}>🔖 Seri No / Barkod Ara</p>
              <input
                ref={barcodeRef}
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={handleBarcodeEnter}
                placeholder="Okutun veya yazın..."
                autoComplete="off"
                style={{ width: "100%", padding: "9px 12px", border: `2px solid ${theme.primary}`, borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }}
              />
              {barcodeMsg && (
                <p style={{ marginTop: 8, fontSize: 13, fontWeight: 500, color: barcodeMsg.ok ? "#16a34a" : "#ef4444" }}>
                  {barcodeMsg.ok ? "✓" : "✗"} {barcodeMsg.text}
                </p>
              )}
            </div>

            {/* Kategoriler */}
            <div style={card}>
              <p style={sectionTitle}>📦 Kategori Özeti</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {catGroups.length === 0 ? (
                  <p style={{ fontSize: 13, color: "#94a3b8" }}>Henüz marine parçası yok.</p>
                ) : catGroups.map((g) => (
                  <div key={g.cat} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 10px", borderRadius: 8, background: g.critical > 0 ? "#fef2f2" : "#f8fafc", border: `1px solid ${g.critical > 0 ? "#fecaca" : "#e2e8f0"}` }}>
                    <span style={{ fontSize: 12, color: "#475569", fontWeight: 500 }}>{g.cat}</span>
                    <div style={{ display: "flex", gap: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#0c2340" }}>{g.count} kalem</span>
                      {g.critical > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: "#ef4444" }}>⚠️{g.critical}</span>}
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/marine/parca" style={{ display: "block", marginTop: 12, textAlign: "center", fontSize: 12, color: theme.primary, textDecoration: "none", fontWeight: 600 }}>
                Tüm Parçaları Gör →
              </Link>
            </div>

            {/* Kritik stok */}
            {criticalParts.length > 0 && (
              <div style={{ ...card, borderLeft: "4px solid #ef4444" }}>
                <p style={{ ...sectionTitle, color: "#dc2626" }}>⚠️ Kritik Stok</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {criticalParts.slice(0, 5).map((p) => (
                    <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 10px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca" }}>
                      <span style={{ fontSize: 12, fontWeight: 500 }}>{p.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: p.stock === 0 ? "#ef4444" : "#d97706" }}>{p.stock} adet</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* COL 2 — Bakım İşleri */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <p style={{ ...sectionTitle, margin: 0 }}>🔧 Bakım İşleri</p>
                <Link href="/marine/bakim/ekle" style={{ fontSize: 11, color: "white", background: theme.primary, padding: "4px 10px", borderRadius: 6, textDecoration: "none", fontWeight: 700 }}>+ Yeni</Link>
              </div>
              {/* Status pills */}
              <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                {[
                  { key: "open", label: "Açık", count: openJobs.length },
                  { key: "pending_parts", label: "Parça ↗", count: pendingJobs.length },
                  { key: "completed", label: "Tamam", count: completedJobs.length },
                ].map((s) => (
                  <div key={s.key} style={{ flex: 1, textAlign: "center", padding: "7px 4px", borderRadius: 8, background: STATUS_BG[s.key], border: `1px solid ${STATUS_COLORS[s.key]}30` }}>
                    <div style={{ fontSize: 18, fontWeight: "bold", color: STATUS_COLORS[s.key] }}>{s.count}</div>
                    <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              {/* Active jobs */}
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {[...openJobs, ...pendingJobs].slice(0, 6).map((m) => {
                  const b = m.boat_id ? boatMap[m.boat_id] : null;
                  const total = (m.labor_cost ?? 0) + (m.parts_cost ?? 0);
                  return (
                    <Link key={m.id} href={`/marine/bakim/${m.id}`} style={{ textDecoration: "none" }}>
                      <div style={{ padding: "10px 12px", borderRadius: 8, background: STATUS_BG[m.status], border: `1px solid ${STATUS_COLORS[m.status]}30`, cursor: "pointer" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#0c2340" }}>{m.description}</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#0c2340" }}>₺{total.toFixed(2)}</span>
                        </div>
                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2, display: "flex", justifyContent: "space-between" }}>
                          <span>🚢 {b?.name ?? "—"}</span>
                          <span style={{ padding: "1px 6px", borderRadius: 10, background: STATUS_COLORS[m.status], color: "white", fontWeight: 700 }}>{STATUS_LABELS[m.status]}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
                {openJobs.length === 0 && pendingJobs.length === 0 && (
                  <p style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", padding: 12 }}>Aktif bakım yok ✓</p>
                )}
              </div>
              <Link href="/marine/bakim" style={{ display: "block", marginTop: 10, textAlign: "center", fontSize: 12, color: theme.primary, textDecoration: "none", fontWeight: 600 }}>
                Tüm Kayıtlar →
              </Link>
            </div>

            {/* İşçilik + maliyet özeti */}
            {completedJobs.length > 0 && (
              <div style={card}>
                <p style={sectionTitle}>💰 Tamamlanan Maliyet Özeti</p>
                {completedJobs.slice(0, 4).map((m) => {
                  const b = m.boat_id ? boatMap[m.boat_id] : null;
                  const total = (m.labor_cost ?? 0) + (m.parts_cost ?? 0);
                  return (
                    <div key={m.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{m.description}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>🚢 {b?.name ?? "—"} · {m.date}</div>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#16a34a" }}>₺{total.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* COL 3 — Tekne Kartları */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <p style={{ ...sectionTitle, margin: 0 }}>🚢 Tekne Kartları</p>
                <Link href="/marine/tekne/ekle" style={{ fontSize: 11, color: "white", background: theme.primary, padding: "4px 10px", borderRadius: 6, textDecoration: "none", fontWeight: 700 }}>+ Yeni</Link>
              </div>
              {boats.length === 0 ? (
                <p style={{ fontSize: 13, color: "#94a3b8" }}>Henüz tekne kartı yok.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {boats.slice(0, 5).map((b) => {
                    const boatMaintenance = maintenances.filter((m) => m.boat_id === b.id);
                    const openCount = boatMaintenance.filter((m) => m.status === "open").length;
                    const reminderLink = b.owner_phone
                      ? maintenanceReminderLink({ ownerName: b.owner_name, ownerPhone: b.owner_phone, boatName: b.name, maintenanceType: "Periyodik Bakım", dueDate: new Date().toLocaleDateString("tr-TR") })
                      : null;
                    return (
                      <div key={b.id} style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid #e0f7fa", background: openCount > 0 ? "#fffbeb" : "#f8fafc" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <Link href={`/marine/tekne/${b.id}`} style={{ textDecoration: "none" }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#0c2340" }}>⚓ {b.name}</div>
                            <div style={{ fontSize: 12, color: "#94a3b8" }}>{b.engine_type ?? "—"}{b.marina ? ` · ${b.marina}` : ""}</div>
                            <div style={{ fontSize: 12, color: "#475569", marginTop: 3 }}>👤 {b.owner_name}</div>
                          </Link>
                          {openCount > 0 && (
                            <span style={{ padding: "3px 8px", borderRadius: 12, background: "#fffbeb", border: "1px solid #fde68a", fontSize: 11, fontWeight: 700, color: "#d97706" }}>
                              {openCount} açık iş
                            </span>
                          )}
                        </div>
                        {reminderLink && (
                          <a href={reminderLink} target="_blank" rel="noopener noreferrer"
                            style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 8, fontSize: 11, color: "#25d366", textDecoration: "none", fontWeight: 700 }}>
                            📲 WhatsApp Hatırlatma
                          </a>
                        )}
                      </div>
                    );
                  })}
                  {boats.length > 5 && (
                    <Link href="/marine/tekne" style={{ textAlign: "center", fontSize: 12, color: theme.primary, textDecoration: "none", fontWeight: 600 }}>
                      +{boats.length - 5} tekne daha →
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Hızlı bağlantılar */}
            <div style={card}>
              <p style={sectionTitle}>🚀 Hızlı Bağlantılar</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { href: "/marine/tekne", label: "⚓ Tekne Kartları" },
                  { href: "/marine/bakim", label: "🔧 Bakım Kayıtları" },
                  { href: "/marine/parca", label: "🔩 Parça Stokları" },
                  { href: "/yeni-satis", label: "🧾 Yeni Satış" },
                ].map((item) => (
                  <Link key={item.href} href={item.href} style={{
                    display: "block", padding: "9px 14px", background: "#f8fafc", border: "1px solid #e2e8f0",
                    color: "#0c2340", borderRadius: 8, textDecoration: "none",
                    fontSize: 13, fontWeight: 600,
                    transition: "background 0.15s",
                  }}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
