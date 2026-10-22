"use client";
import Link from "next/link";
import { Users, Package, TrendingUp, BadgeCheck, ArrowRight, ShoppingCart, AlertTriangle } from "lucide-react";
import WarehouseScene from "./WarehouseScene";
import { Reveal, CountUp, SpotCard, ParticleField, SplitWords } from "./motion";
import { greeting } from "./greeting";

type Kritik = { id: string; name: string; stock: number; min_stock: number };

export type StokHomeProps = {
  lang: string;
  firmaAdi: string | null;
  toplamCari: number | null;
  stokDegeri: number | null;
  buAySatis: number | null;
  lisansDurumu: string;
  lisansAktif: boolean;
  kritikUrunler: Kritik[];
  labels: {
    totalCustomers: string; stockValue: string; monthlySales: string; licenseLabel: string;
    menuCari: string; customerDesc: string; menuStok: string; stockDesc: string;
    menuSatislar: string; salesDesc: string; open: string; newSale: string;
  };
};

const GREEN = "#10B981";

function Value({ v, suffix = "", locale }: { v: number | null; suffix?: string; locale: string }) {
  if (v === null) return <span style={{ opacity: 0.35 }}>···</span>;
  return <CountUp to={v} thousands suffix={suffix} locale={locale} duration={1400} />;
}

export default function StokHome(p: StokHomeProps) {
  const locale = p.lang === "tr" ? "tr-TR" : "en-US";
  const L = p.labels;
  const name = p.firmaAdi ?? "";
  const today = new Date().toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const stats = [
    { label: L.totalCustomers, icon: Users, grad: "linear-gradient(135deg,#6366F1,#8B5CF6)", accent: "#6366F1", node: <Value v={p.toplamCari} locale={locale} /> },
    { label: L.stockValue, icon: Package, grad: "linear-gradient(135deg,#0EA5E9,#6366F1)", accent: "#0EA5E9", node: <Value v={p.stokDegeri} suffix=" TL" locale={locale} /> },
    { label: L.monthlySales, icon: TrendingUp, grad: "linear-gradient(135deg,#10B981,#06B6D4)", accent: GREEN, node: <Value v={p.buAySatis} suffix=" TL" locale={locale} /> },
    { label: L.licenseLabel, icon: BadgeCheck, grad: p.lisansAktif ? "linear-gradient(135deg,#10B981,#34D399)" : "linear-gradient(135deg,#F59E0B,#FBBF24)", accent: p.lisansAktif ? GREEN : "#F59E0B", node: <span style={{ fontSize: 20 }}>{p.lisansDurumu}</span> },
  ];

  const shortcuts = [
    { href: "/cari", title: L.menuCari, desc: L.customerDesc, icon: Users, color: "#6366F1" },
    { href: "/stok", title: L.menuStok, desc: L.stockDesc, icon: Package, color: "#0EA5E9" },
    { href: "/satislar", title: L.menuSatislar, desc: L.salesDesc, icon: TrendingUp, color: GREEN },
  ];

  return (
    <div>
      {/* Karşılama bandı */}
      <div style={{
        position: "relative", overflow: "hidden", borderRadius: 22, padding: "32px 36px", marginBottom: 24,
        background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 55%, #1E1B4B 100%)",
        boxShadow: "0 24px 60px rgba(30,27,75,0.35)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24,
      }}>
        <ParticleField color="165,180,252" density={14000} />
        <div className="sp-orb" aria-hidden style={{ position: "absolute", width: 380, height: 380, borderRadius: "50%", top: -150, left: -90, background: "radial-gradient(circle, rgba(99,102,241,0.5), transparent 68%)", filter: "blur(22px)", pointerEvents: "none" }} />
        <div className="sp-orb" aria-hidden style={{ position: "absolute", width: 320, height: 320, borderRadius: "50%", bottom: -150, right: "30%", background: "radial-gradient(circle, rgba(16,185,129,0.28), transparent 68%)", filter: "blur(22px)", animationDelay: "-8s", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1, minWidth: 0, flex: 1 }}>
          <div className="sp-enter" style={{ animationDelay: "0.1s", display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 20, padding: "5px 14px", color: "#C7D2FE", fontSize: 12, fontWeight: 600, marginBottom: 14, textTransform: "capitalize" }}>
            <span className="sp-live" style={{ width: 7, height: 7, borderRadius: "50%", background: GREEN, boxShadow: `0 0 8px ${GREEN}` }} />
            {today}
          </div>
          <div className="sp-enter" style={{ animationDelay: "0.2s", fontSize: 15, color: "#A5B4FC", fontWeight: 600, marginBottom: 4 }}>
            {greeting(p.lang)} 👋
          </div>
          <h1 style={{ fontSize: 34, fontWeight: 900, color: "white", letterSpacing: "-0.5px", lineHeight: 1.15, margin: "0 0 10px", wordBreak: "break-word" }}>
            {name ? <SplitWords text={name} delay={350} step={110} /> : null}
          </h1>
          <p className="sp-enter" style={{ animationDelay: "0.7s", fontSize: 14, color: "rgba(255,255,255,0.65)", margin: "0 0 20px", maxWidth: 420, lineHeight: 1.6 }}>
            {p.lang === "tr" ? "Deponuz hazır. Bugün de stoğunuz tam kontrolünüz altında." : "Your warehouse is ready. Your stock is under full control today."}
          </p>
          <Link href="/yeni-satis" className="sp-btn sp-enter" style={{
            animationDelay: "0.85s", display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px",
            background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "white", borderRadius: 12, textDecoration: "none",
            fontSize: 14, fontWeight: 700, boxShadow: "0 8px 24px rgba(99,102,241,0.5)",
          }}>
            <ShoppingCart size={16} /> {L.newSale} <ArrowRight size={16} className="sp-arrow" />
          </Link>
        </div>

        <div className="sp-hide-sm sp-enter" style={{ animationDelay: "0.4s", position: "relative", zIndex: 1, width: 340, flexShrink: 0 }}>
          <WarehouseScene maxWidth={340} style={{ boxShadow: "0 20px 50px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.12)" }} />
        </div>
      </div>

      {/* Kritik stok uyarısı */}
      {p.kritikUrunler.length > 0 && (
        <Reveal>
          <Link href="/stok" className="sp-alert" style={{
            display: "block", textDecoration: "none", color: "inherit", background: "linear-gradient(135deg,#FEF2F2,#FFF7ED)",
            border: "1px solid #FECACA", borderRadius: 16, padding: "16px 20px", marginBottom: 24,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ width: 32, height: 32, borderRadius: 10, background: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AlertTriangle size={17} color="#DC2626" />
              </span>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#DC2626" }}>
                {p.kritikUrunler.length} {p.lang === "tr" ? "ürün kritik stok seviyesinde" : "products at critical stock level"}
              </span>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {p.kritikUrunler.slice(0, 6).map((k) => (
                <span key={k.id} style={{ background: "white", border: "1px solid #FECACA", borderRadius: 20, padding: "3px 12px", fontSize: 12, color: "#991b1b", fontWeight: 500 }}>
                  {k.name} ({k.stock} / min {k.min_stock})
                </span>
              ))}
              {p.kritikUrunler.length > 6 && (
                <span style={{ fontSize: 12, color: "#991b1b", alignSelf: "center" }}>+{p.kritikUrunler.length - 6} {p.lang === "tr" ? "daha" : "more"}</span>
              )}
            </div>
          </Link>
        </Reveal>
      )}

      {/* İstatistik kartları */}
      <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <Reveal key={s.label} delay={i * 90}>
              <SpotCard className="sp-card sp-statcard" style={{ background: "white", padding: 22, borderRadius: 18, boxShadow: "0 2px 14px rgba(30,27,75,0.07)", height: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <p style={{ color: "#6B7280", fontSize: 13, fontWeight: 500, margin: 0 }}>{s.label}</p>
                  <span style={{ width: 38, height: 38, borderRadius: 12, background: s.grad, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 16px ${s.accent}55` }}>
                    <Icon size={18} color="white" />
                  </span>
                </div>
                <p style={{ fontSize: 28, fontWeight: 800, color: "#1E1B4B", margin: 0, letterSpacing: "-0.5px", fontVariantNumeric: "tabular-nums" }}>{s.node}</p>
                <span className="sp-accent" style={{ background: s.grad }} />
              </SpotCard>
            </Reveal>
          );
        })}
      </div>

      {/* Kısayollar */}
      <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {shortcuts.map((s, i) => {
          const Icon = s.icon;
          return (
            <Reveal key={s.href} delay={i * 110}>
              <Link href={s.href} style={{ textDecoration: "none", color: "inherit", display: "block", height: "100%" }}>
                <SpotCard className="sp-card" style={{ background: "white", padding: 24, borderRadius: 18, boxShadow: "0 2px 14px rgba(30,27,75,0.07)", height: "100%", borderTop: `3px solid ${s.color}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                    <span style={{ width: 40, height: 40, borderRadius: 12, background: `${s.color}16`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={20} color={s.color} />
                    </span>
                    <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "#1E1B4B" }}>{s.title}</h2>
                  </div>
                  <p style={{ color: "#6B7280", fontSize: 13, margin: "0 0 16px", lineHeight: 1.55 }}>{s.desc}</p>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: s.color, fontSize: 14, fontWeight: 700 }}>
                    {L.open} <ArrowRight size={15} className="sp-arrow" />
                  </span>
                </SpotCard>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
