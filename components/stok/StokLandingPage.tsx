"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import WarehouseScene from "./WarehouseScene";
import { Reveal, CountUp, Tilt, ParticleField, ScrollProgress, SpotCard } from "./motion";

const INDIGO  = "#6366F1";
const DARK    = "#1E1B4B";
const GREEN   = "#10B981";
const AMBER   = "#F59E0B";
const BG      = "#F5F3FF";
const WHITE   = "#FFFFFF";
const GRAY    = "#4B5563";

// ── SVG ASSETS ───────────────────────────────────────────────────────────────

function BoxIcon({ size = 28, color = INDIGO }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  );
}

function DotGridBg({ color = INDIGO, opacity = 0.06 }: { color?: string; opacity?: number }) {
  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} aria-hidden>
      <defs>
        <pattern id="stokDot" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.5" fill={color} opacity={opacity}/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#stokDot)" />
    </svg>
  );
}

function DashboardPreviewSVG() {
  return (
    <svg viewBox="0 0 360 220" fill="none" style={{ width: "100%", maxWidth: 360, borderRadius: 14, filter: "drop-shadow(0 20px 40px rgba(99,102,241,0.18))" }}>
      {/* Window */}
      <rect x="0" y="0" width="360" height="220" rx="12" fill="white" stroke="#E2E8F0" strokeWidth="1.5"/>
      {/* Title bar */}
      <rect x="0" y="0" width="360" height="34" rx="12" fill={DARK}/>
      <rect x="0" y="24" width="360" height="10" fill={DARK}/>
      <circle cx="16" cy="17" r="5" fill="#EF4444"/>
      <circle cx="30" cy="17" r="5" fill="#F59E0B"/>
      <circle cx="44" cy="17" r="5" fill={GREEN}/>
      <rect x="60" y="11" width="200" height="12" rx="6" fill="rgba(255,255,255,0.1)"/>
      {/* Sidebar */}
      <rect x="0" y="34" width="72" height="186" fill="#F8FAFC"/>
      <rect x="0" y="34" width="72" height="186" fill={DARK} opacity="0.97"/>
      {/* Sidebar items */}
      {[50, 72, 94, 116, 138].map((y, i) => (
        <rect key={i} x="8" y={y} width={i === 0 ? 56 : 48} height="14" rx="4" fill={i === 1 ? INDIGO : "rgba(255,255,255,0.12)"}/>
      ))}
      {/* Content */}
      {/* Stats row */}
      {[80, 154, 228].map((x, i) => (
        <g key={i}>
          <rect x={x} y="42" width="62" height="44" rx="8" fill={["#EEF2FF", "#F0FDF4", "#FFFBEB"][i]}/>
          <rect x={x+6} y="50" width="30" height="8" rx="3" fill={[INDIGO, GREEN, AMBER][i]} opacity="0.7"/>
          <rect x={x+6} y="63" width="20" height="14" rx="3" fill={[INDIGO, GREEN, AMBER][i]}/>
        </g>
      ))}
      {/* Chart area */}
      <rect x="80" y="96" width="135" height="80" rx="8" fill="#F8FAFC"/>
      {/* Chart bars */}
      {[
        [96, 150, 30], [110, 140, 40], [124, 130, 50], [138, 120, 60],
        [152, 135, 45], [166, 110, 70], [180, 100, 80],
      ].map(([x, y, h], i) => (
        <rect key={i} className="sp-bar" style={{ animationDelay: `${0.9 + i * 0.1}s` }} x={x} y={y} width="10" height={h} rx="3" fill={INDIGO} opacity={0.4 + i * 0.08}/>
      ))}
      {/* Table */}
      <rect x="224" y="96" width="128" height="80" rx="8" fill="#F8FAFC"/>
      <rect x="230" y="104" width="116" height="10" rx="3" fill="#E2E8F0"/>
      {[120, 135, 150, 165].map((y, i) => (
        <g key={i}>
          <rect x="230" y={y} width="50" height="7" rx="2" fill="#E2E8F0"/>
          <rect x="290" y={y} width="30" height="7" rx="2" fill={i % 2 === 0 ? "#DCFCE7" : "#EEF2FF"}/>
          <rect x="328" y={y} width="14" height="7" rx="2" fill="#E2E8F0"/>
        </g>
      ))}
      {/* Bottom bar */}
      <rect x="72" y="186" width="288" height="34" fill="#F8FAFC"/>
      <rect x="80" y="194" width="60" height="10" rx="4" fill="#E2E8F0"/>
      <rect x="152" y="194" width="40" height="10" rx="4" fill="#E2E8F0"/>
    </svg>
  );
}

// ── NAVBAR ────────────────────────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className="sp-nav" style={{
      position: "sticky", top: 0, zIndex: 100,
      background: scrolled ? "rgba(255,255,255,0.78)" : WHITE,
      backdropFilter: scrolled ? "saturate(180%) blur(16px)" : "none",
      WebkitBackdropFilter: scrolled ? "saturate(180%) blur(16px)" : "none",
      borderBottom: "1px solid #E0E7FF",
      boxShadow: scrolled ? "0 6px 28px rgba(99,102,241,0.12)" : "0 1px 8px rgba(99,102,241,0.08)",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: INDIGO, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BoxIcon size={18} color="white" />
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, color: DARK, letterSpacing: "-0.5px" }}>Stok<span style={{ color: INDIGO }}>Panel</span></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <a className="sp-link" href="#ozellikler" style={{ padding: "8px 14px", color: GRAY, textDecoration: "none", fontSize: 14, fontWeight: 500 }}>Özellikler</a>
          <a className="sp-link" href="#fiyat"      style={{ padding: "8px 14px", color: GRAY, textDecoration: "none", fontSize: 14, fontWeight: 500 }}>Fiyatlandırma</a>
          <a className="sp-link" href="#sss"        style={{ padding: "8px 14px", color: GRAY, textDecoration: "none", fontSize: 14, fontWeight: 500 }}>SSS</a>
          <Link href="/login" className="sp-link" style={{ padding: "8px 16px", color: DARK, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>Giriş Yap</Link>
          <Link href="/login" className="sp-btn" style={{ padding: "9px 20px", background: INDIGO, color: WHITE, borderRadius: 8, textDecoration: "none", fontSize: 14, fontWeight: 700, boxShadow: "0 4px 14px rgba(99,102,241,0.3)" }}>
            Ücretsiz Dene →
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ── HERO ──────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section style={{ background: `linear-gradient(135deg, ${BG} 0%, #EEF2FF 60%)`, position: "relative", overflow: "hidden", padding: "80px 24px 60px" }}>
      <DotGridBg color={INDIGO} opacity={0.07} />
      <ParticleField />
      {/* Aurora orbs */}
      <div className="sp-orb" aria-hidden style={{ position: "absolute", width: 480, height: 480, borderRadius: "50%", top: -160, left: -120, background: "radial-gradient(circle, rgba(99,102,241,0.28), transparent 68%)", filter: "blur(20px)", pointerEvents: "none" }} />
      <div className="sp-orb" aria-hidden style={{ position: "absolute", width: 420, height: 420, borderRadius: "50%", bottom: -180, right: -100, background: "radial-gradient(circle, rgba(16,185,129,0.20), transparent 68%)", filter: "blur(20px)", animationDelay: "-6s", pointerEvents: "none" }} />
      <div className="sp-orb" aria-hidden style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", top: 120, right: "28%", background: "radial-gradient(circle, rgba(139,92,246,0.18), transparent 68%)", filter: "blur(24px)", animationDelay: "-11s", pointerEvents: "none" }} />
      <div className="stok-hero-grid" style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center", position: "relative", zIndex: 1 }}>
        {/* Left */}
        <div>
          <div className="sp-enter" style={{ animationDelay: "0.1s", display: "inline-flex", alignItems: "center", gap: 6, background: `${INDIGO}18`, border: `1px solid ${INDIGO}40`, borderRadius: 20, padding: "5px 14px", marginBottom: 20 }}>
            <BoxIcon size={14} color={INDIGO} />
            <span style={{ fontSize: 12, fontWeight: 700, color: INDIGO, letterSpacing: "0.5px" }}>TÜRKİYE&apos;NİN STOK YÖNETİM YAZILIMI</span>
          </div>

          <h1 style={{ fontSize: 48, fontWeight: 900, color: DARK, lineHeight: 1.12, marginBottom: 20, letterSpacing: "-1px" }}>
            <span className="sp-word" style={{ animationDelay: "0.3s" }}>Stoğunuzu</span><br />
            <span className="sp-word" style={{ animationDelay: "0.55s" }}><span className="sp-gradient-text">Tam Kontrol</span></span><br />
            <span className="sp-word" style={{ animationDelay: "0.8s" }}>Altına Alın</span>
          </h1>

          <p className="sp-enter" style={{ animationDelay: "0.4s", fontSize: 18, color: GRAY, lineHeight: 1.65, marginBottom: 32, maxWidth: 460 }}>
            Ürün girişinden satışa, alışlardan raporlamaya kadar tüm stok süreçlerinizi tek panelden yönetin. Barkodla satış, SKT takibi ve cari hesap yönetimi dahil.
          </p>

          <div className="sp-enter" style={{ animationDelay: "0.55s", display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 32 }}>
            <Link href="/login" className="sp-btn sp-btn-glow" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 28px", background: INDIGO, color: WHITE,
              borderRadius: 10, textDecoration: "none", fontSize: 16, fontWeight: 700,
              boxShadow: "0 4px 16px rgba(99,102,241,0.35)",
            }}>
              Hemen Ücretsiz Dene
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <a href="#ozellikler" className="sp-btn" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 24px", background: WHITE, color: DARK,
              borderRadius: 10, textDecoration: "none", fontSize: 16, fontWeight: 600,
              border: `2px solid ${DARK}20`,
            }}>
              Özellikleri Keşfet
            </a>
          </div>

          <div className="sp-enter" style={{ animationDelay: "0.7s", display: "flex", gap: 20, flexWrap: "wrap" }}>
            {["Kredi kartı gerekmez", "14 gün ücretsiz", "Anında kurulum"].map((txt) => (
              <div key={txt} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <span style={{ fontSize: 13, color: GRAY, fontWeight: 500 }}>{txt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Illustrations stacked */}
        <div className="sp-enter" style={{ animationDelay: "0.35s", position: "relative", display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
          <div className="sp-float" style={{ position: "relative", zIndex: 2, width: "100%", display: "flex", justifyContent: "center" }}>
            <Tilt style={{ width: "100%", display: "flex", justifyContent: "center" }}>
              <DashboardPreviewSVG />
            </Tilt>
          </div>
          <div style={{ position: "relative", zIndex: 1, marginTop: -8, width: "100%", display: "flex", justifyContent: "center" }}>
            <WarehouseScene maxWidth={500} />
          </div>

          {/* Floating badge 1 */}
          <div className="sp-float-b" style={{ position: "absolute", top: 10, left: -24, background: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)", borderRadius: 12, padding: "10px 16px", boxShadow: "0 8px 28px rgba(99,102,241,0.2)", display: "flex", alignItems: "center", gap: 8, zIndex: 3 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: DARK }}>Satışlar ↑%34</div>
              <div style={{ fontSize: 11, color: "#6B7280" }}>bu ay</div>
            </div>
          </div>

          {/* Floating badge 2 */}
          <div className="sp-float" style={{ animationDelay: "-2.5s", position: "absolute", bottom: 80, right: -16, background: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)", borderRadius: 12, padding: "10px 16px", boxShadow: "0 8px 28px rgba(99,102,241,0.2)", display: "flex", alignItems: "center", gap: 8, zIndex: 3 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={INDIGO} strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: DARK }}>1.240 Ürün</div>
              <div style={{ fontSize: 11, color: "#6B7280" }}>stokta mevcut</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── MARQUEE ───────────────────────────────────────────────────────────────────

function Marquee() {
  const items = ["Barkodlu Satış", "SKT Takibi", "Cari Hesap", "Çoklu Depo", "Kritik Stok Uyarısı", "Alış Faturası", "Kâr-Zarar Raporu", "Excel İçe Aktarma", "Canlı Stok Güncelleme", "Mobil Uyumlu"];
  const row = [...items, ...items];
  return (
    <div style={{ background: WHITE, borderTop: "1px solid #E0E7FF", borderBottom: "1px solid #E0E7FF", overflow: "hidden", padding: "16px 0", maskImage: "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)", WebkitMaskImage: "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)" }}>
      <div className="sp-marquee">
        {row.map((t, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 14, padding: "0 22px", fontSize: 15, fontWeight: 700, color: DARK, whiteSpace: "nowrap" }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: i % 3 === 0 ? INDIGO : i % 3 === 1 ? GREEN : AMBER, transform: "rotate(45deg)" }} />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── STATS BAR ─────────────────────────────────────────────────────────────────

function StatsBar() {
  const stats = [
    { value: <CountUp to={1000} thousands suffix="+" />,                   label: "Aktif İşletme" },
    { value: <CountUp to={5} suffix="M+" duration={1200} />,               label: "Kayıtlı Ürün" },
    { value: <CountUp to={99.9} decimals={1} prefix="%" duration={1800} />, label: "Uptime" },
    { value: "7/24",                                                       label: "Teknik Destek" },
  ];
  return (
    <section style={{ background: DARK, padding: "28px 24px", position: "relative", overflow: "hidden" }}>
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(100deg, transparent 20%, rgba(99,102,241,0.18) 50%, transparent 80%)", backgroundSize: "200% 100%", animation: "sp-shimmer 9s linear infinite", pointerEvents: "none" }} />
      <div className="stok-4col" style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, textAlign: "center", position: "relative" }}>
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 110}>
            <div style={{ fontSize: 30, fontWeight: 900, color: WHITE, letterSpacing: "-0.5px", fontVariantNumeric: "tabular-nums" }}>{s.value}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{s.label}</div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ── FEATURES ──────────────────────────────────────────────────────────────────

function Features() {
  const features = [
    {
      icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={INDIGO} strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
      title: "Akıllı Stok Yönetimi",
      desc: "Ürün girişi, satışı ve transferini takip edin. Kritik stok seviyesine düşünce anında uyarı alın. Çoklu depo desteğiyle stoğu tam kontrol altına alın.",
      bg: "#EEF2FF", border: "#A5B4FC",
    },
    {
      icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2"><rect x="1" y="1" width="22" height="22" rx="2"/><path d="M5 6h.01M5 10h.01M5 14h.01M8 6h10M8 10h10M8 14h10"/></svg>,
      title: "Hızlı Barkod Satışı",
      desc: "Kasada barkod okutun, ürün otomatik sepete eklensin. Tek tıkla satışı tamamlayın, stok anında güncellensin.",
      bg: "#F0FDF4", border: "#86EFAC",
    },
    {
      icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
      title: "Cari Hesap Yönetimi",
      desc: "Müşteri ve tedarikçi hesaplarını takip edin. Açık fatura, borç/alacak durumlarını tek ekranda görün.",
      bg: "#FFFBEB", border: "#FCD34D",
    },
    {
      icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
      title: "Gelişmiş Raporlar",
      desc: "Satış, alış, kâr-zarar ve stok değer raporlarını anında alın. Dönemsel karşılaştırmalarla işletmenizin nabzını tutun.",
      bg: "#F5F3FF", border: "#C4B5FD",
    },
  ];

  return (
    <section id="ozellikler" style={{ background: WHITE, padding: "80px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Reveal style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${INDIGO}12`, borderRadius: 20, padding: "5px 16px", marginBottom: 16 }}>
            <BoxIcon size={14} color={INDIGO} />
            <span style={{ fontSize: 12, fontWeight: 700, color: INDIGO, letterSpacing: "0.5px" }}>ÖZELLİKLER</span>
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: DARK, marginBottom: 12 }}>İşletmenizin Tüm İhtiyaçları Tek Yerde</h2>
          <p style={{ fontSize: 16, color: GRAY, maxWidth: 520, margin: "0 auto" }}>
            Stok takibinden satışa, alışlardan raporlamaya kadar tam entegre bir sistem.
          </p>
        </Reveal>
        <div className="stok-2col" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24 }}>
          {features.map((f, i) => (
            <Reveal key={f.title} delay={(i % 2) * 120 + Math.floor(i / 2) * 120}>
              <SpotCard className="sp-card" style={{ background: f.bg, borderRadius: 16, padding: 28, border: `1px solid ${f.border}`, display: "flex", gap: 20, alignItems: "flex-start", height: "100%" }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: WHITE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 2px 8px ${f.border}60` }}>
                  {f.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: DARK, marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ fontSize: 14, color: GRAY, lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
                </div>
              </SpotCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── HOW IT WORKS ──────────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    { n: "1", title: "Kaydolun", desc: "E-posta ve şifrenizle 30 saniyede hesap oluşturun. Kurulum, sunucu veya teknik bilgi gerekmez." },
    { n: "2", title: "Ürün & Cari Ekleyin", desc: "Ürün listelerinizi ve müşteri/tedarikçi bilgilerinizi Excel'den toplu yükleyin veya tek tek girin." },
    { n: "3", title: "Satışa Başlayın", desc: "Barkodla satış, alış faturası ve raporlarla işletmenizi tam dijital yönetin." },
  ];
  return (
    <section style={{ background: BG, padding: "80px 24px", position: "relative", overflow: "hidden" }}>
      <DotGridBg color={INDIGO} opacity={0.05} />
      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <Reveal style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: DARK, marginBottom: 12 }}>3 Adımda Başlayın</h2>
          <p style={{ fontSize: 16, color: GRAY }}>Teknik bilgi gerekmez. Kurulum yok.</p>
        </Reveal>
        <div className="stok-3col" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 180} style={{ textAlign: "center", position: "relative" }}>
              {i < 2 && <div className="sp-conn" style={{ position: "absolute", top: 30, left: "calc(50% + 40px)", width: "calc(100% - 80px)", height: 2, background: `repeating-linear-gradient(90deg, ${INDIGO}55 0 6px, transparent 6px 12px)`, zIndex: 0 }} />}
              <div style={{ position: "relative", zIndex: 1 }}>
                <div className={i === 0 ? "sp-btn-glow" : undefined} style={{ width: 60, height: 60, borderRadius: "50%", background: `linear-gradient(135deg, ${INDIGO}, #8B5CF6)`, color: WHITE, fontSize: 22, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 8px 20px rgba(99,102,241,0.35)" }}>{s.n}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: DARK, marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: GRAY, lineHeight: 1.65, maxWidth: 260, margin: "0 auto" }}>{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── PRICING ───────────────────────────────────────────────────────────────────

function Pricing() {
  const plans = [
    {
      name: "Pro",
      price: "2.990 TL + KDV",
      note: "aylık",
      color: INDIGO,
      popular: true,
      cta: "Başla",
      ctaHref: "/login",
      features: ["500 adet ürüne kadar stok takibi", "Barkod okuyucu desteği", "Alış & satış yönetimi", "Cari hesap takibi", "Temel raporlar", "Mobil uyumlu panel", "1 kullanıcı", "Aylık servis pakete dahil"],
    },
    {
      name: "Enterprise",
      price: null,
      note: "Şirketinize özel",
      color: AMBER,
      popular: false,
      cta: "Fiyat Alın",
      ctaHref: "mailto:pazarlama@marssoft.com.tr?subject=StokPanel Enterprise Fiyat Talebi",
      features: ["Pro plan dahil", "Sınırsız kullanıcı & şube", "Özel modüller & entegrasyonlar", "ERP / muhasebe entegrasyonu", "Eğitim + onboarding", "SLA garantisi"],
    },
  ];

  return (
    <section id="fiyat" style={{ background: WHITE, padding: "80px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Reveal style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${INDIGO}12`, borderRadius: 20, padding: "5px 16px", marginBottom: 16 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={INDIGO} strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            <span style={{ fontSize: 12, fontWeight: 700, color: INDIGO, letterSpacing: "0.5px" }}>FİYATLANDIRMA</span>
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: DARK, marginBottom: 12 }}>İşletmenize Uygun Plan</h2>
          <p style={{ fontSize: 16, color: GRAY }}>14 gün ücretsiz dene, beğenirsen devam et.</p>
        </Reveal>

        <div className="stok-3col" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24, maxWidth: 620, margin: "0 auto" }}>
          {plans.map((plan, pi) => (
            <Reveal key={plan.name} className={plan.popular ? "sp-borderglow" : ""} delay={pi * 150} style={{ position: "relative", borderRadius: 20, isolation: "isolate" }}>
              {plan.popular && (
                <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: plan.color, color: WHITE, fontSize: 11, fontWeight: 800, padding: "4px 18px", borderRadius: 20, whiteSpace: "nowrap", zIndex: 1 }}>
                  ✦ EN POPÜLER
                </div>
              )}
              <div className="sp-card" style={{
                background: WHITE, borderRadius: 20, padding: "32px 24px",
                border: `2px solid ${plan.popular ? plan.color : "#E2E8F0"}`,
                boxShadow: plan.popular ? `0 8px 32px ${plan.color}25` : "0 2px 12px rgba(0,0,0,0.06)",
                height: "100%", display: "flex", flexDirection: "column",
              }}>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: DARK, marginBottom: 8 }}>{plan.name}</h3>
                {plan.price ? (
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 26, fontWeight: 800, color: plan.color, letterSpacing: "-0.5px" }}>{plan.price}</div>
                    <div style={{ fontSize: 13, color: GRAY, marginTop: 2 }}>{plan.note}</div>
                  </div>
                ) : (
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 30, fontWeight: 900, color: plan.color }}>Fiyat Alınız</div>
                    <div style={{ fontSize: 13, color: GRAY, marginTop: 4 }}>{plan.note}</div>
                  </div>
                )}

                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", flex: 1 }}>
                  {plan.features.map((f) => {
                    const isHighlight = f.toLowerCase().includes("aylık servis");
                    return (
                      <li key={f} style={{
                        display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 0", fontSize: 14,
                        color: isHighlight ? plan.color : "#374151", fontWeight: isHighlight ? 700 : 400,
                      }}>
                        {isHighlight ? (
                          <span style={{ flexShrink: 0, fontSize: 15, lineHeight: "16px" }}>⭐</span>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                            <circle cx="8" cy="8" r="8" fill={`${plan.color}20`}/>
                            <path d="M4.5 8l2.5 2.5 4.5-4.5" stroke={plan.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                        {f}
                      </li>
                    );
                  })}
                </ul>

                {plan.ctaHref.startsWith("mailto:") ? (
                  <a href={plan.ctaHref} className="sp-btn" style={{ display: "block", textAlign: "center", padding: "13px 0", background: plan.color, color: WHITE, borderRadius: 10, textDecoration: "none", fontSize: 15, fontWeight: 700 }}>
                    {plan.cta} →
                  </a>
                ) : (
                  <Link href={plan.ctaHref} className="sp-btn" style={{ display: "block", textAlign: "center", padding: "13px 0", background: plan.color, color: WHITE, borderRadius: 10, textDecoration: "none", fontSize: 15, fontWeight: 700 }}>
                    {plan.cta} →
                  </Link>
                )}
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={300} style={{ marginTop: 32, display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
          {["SSL güvenlik", "Günlük yedekleme", "7/24 teknik destek", "İptal garantisi"].map((f) => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: GRAY }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5L12 3" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {f}
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

// ── TESTIMONIALS ──────────────────────────────────────────────────────────────

function Testimonials() {
  const reviews = [
    {
      name: "Kemal S.",
      co: "KS Elektronik, Bursa",
      text: "3.000 çeşit ürünü eskiden Excel'le yönetiyorduk. StokPanel'e geçince hem stok kayıpları sıfırlandı hem de muhasebecimizin işi kolaylaştı.",
      stars: 5,
    },
    {
      name: "Fatma Ö.",
      co: "Öztürk Gıda, İstanbul",
      text: "Barkod satış özelliği kasada ciddi hız kazandırdı. Günlük kapanış raporu otomatik geliyor, her şey kayıt altında.",
      stars: 5,
    },
    {
      name: "Hasan A.",
      co: "AlphaStok Depo, Ankara",
      text: "Enterprise planıyla 4 depomuzun stoğunu tek panelden görüyoruz. Çoklu kullanıcı desteği olmasa bu işi yapamazdık.",
      stars: 5,
    },
  ];

  return (
    <section style={{ background: BG, padding: "80px 24px", position: "relative", overflow: "hidden" }}>
      <DotGridBg color={INDIGO} opacity={0.05} />
      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <Reveal style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: DARK, marginBottom: 12 }}>İşletme Sahipleri Anlatıyor</h2>
          <p style={{ fontSize: 16, color: GRAY }}>1.000+ işletmenin güvendiği sistem.</p>
        </Reveal>
        <div className="stok-3col" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {reviews.map((r, ri) => (
            <Reveal key={r.name} delay={ri * 140}>
            <div className="sp-card" style={{ background: WHITE, borderRadius: 16, padding: 28, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", height: "100%" }}>
              <div style={{ display: "flex", gap: 2, marginBottom: 16 }}>
                {Array.from({ length: r.stars }).map((_, i) => (
                  <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#FBBF24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                ))}
              </div>
              <p style={{ fontSize: 15, color: GRAY, lineHeight: 1.7, marginBottom: 20, fontStyle: "italic" }}>&ldquo;{r.text}&rdquo;</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${INDIGO}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <BoxIcon size={18} color={INDIGO} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: DARK }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: "#9CA3AF" }}>{r.co}</div>
                </div>
              </div>
            </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── FAQ ────────────────────────────────────────────────────────────────────────

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const items = [
    { q: "StokPanel nedir?", a: "StokPanel, her ölçekteki işletme için geliştirilmiş bulut tabanlı stok ve satış yönetim yazılımıdır. Ürün takibinden barkodlu satışa, alış faturasından cari hesap yönetimine kadar tüm operasyonlarınızı tek panelden yürütebilirsiniz." },
    { q: "14 günlük deneme nasıl çalışır?", a: "Kayıt olduğunuzda 14 günlük deneme hemen başlar. Kredi kartı girmenize gerek yoktur. Deneme süresince seçtiğiniz plana göre tüm özelliklere erişirsiniz." },
    { q: "Mevcut ürün ve müşteri verilerimi nasıl aktarabilirim?", a: "Excel veya CSV formatındaki ürün, müşteri ve tedarikçi listelerinizi sisteme toplu olarak yükleyebilirsiniz. Teknik destek ekibimiz aktarım sürecinde ücretsiz yardımcı olur." },
    { q: "Birden fazla kullanıcı ve şube kullanılabilir mi?", a: "Pro plan tek kullanıcı içerir. Çoklu kullanıcı ve çoklu şube desteği için Enterprise plana geçebilirsiniz; kullanıcı ve şube sayısı sınırsızdır." },
    { q: "Muhasebe veya ERP programıyla entegrasyon var mı?", a: "Enterprise planda özel entegrasyon geliştirme seçeneği sunulmaktadır. Mevcut desteklenen entegrasyonlar için destek ekibimizle iletişime geçebilirsiniz." },
    { q: "Aboneliğimi istediğim zaman iptal edebilir miyim?", a: "Evet. Aylık planlarda bir sonraki fatura dönemi başlamadan iptal etmeniz yeterlidir. Kalan süre için ücret iadesi yapılmaz; ancak iptal tarihine kadar sistemi kullanmaya devam edersiniz." },
  ];

  return (
    <section id="sss" style={{ background: WHITE, padding: "80px 24px" }}>
      <div style={{ maxWidth: 780, margin: "0 auto" }}>
        <Reveal style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: DARK, marginBottom: 12 }}>Sık Sorulan Sorular</h2>
          <p style={{ fontSize: 16, color: GRAY }}>Aklınızdaki soruların cevabı burada.</p>
        </Reveal>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((item, i) => (
            <Reveal key={i} delay={i * 70}>
              <div style={{ border: `1px solid ${open === i ? INDIGO + "40" : "#E2E8F0"}`, borderRadius: 12, overflow: "hidden", background: open === i ? BG : WHITE, boxShadow: open === i ? "0 8px 24px rgba(99,102,241,0.1)" : "none", transition: "background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease" }}>
                <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} style={{ width: "100%", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: DARK }}>{item.q}</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={open === i ? INDIGO : DARK} strokeWidth="2" style={{ flexShrink: 0, transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1), stroke 0.2s", transform: open === i ? "rotate(180deg)" : "rotate(0deg)" }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                <div className={`sp-faq-body${open === i ? " sp-open" : ""}`}>
                  <div>
                    <p style={{ fontSize: 14, color: GRAY, lineHeight: 1.7, margin: 0, padding: "0 24px 20px" }}>{item.a}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA BANNER ────────────────────────────────────────────────────────────────

function CTABanner() {
  return (
    <section style={{ background: `linear-gradient(135deg, ${DARK} 0%, #312E81 100%)`, padding: "72px 24px", position: "relative", overflow: "hidden" }}>
      <DotGridBg color={WHITE} opacity={0.06} />
      <div className="sp-orb" aria-hidden style={{ position: "absolute", width: 420, height: 420, borderRadius: "50%", top: -180, right: "10%", background: "radial-gradient(circle, rgba(99,102,241,0.4), transparent 68%)", filter: "blur(24px)", pointerEvents: "none" }} />
      <Reveal className="stok-cta-grid" style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 48 }}>
        <div>
          <h2 style={{ fontSize: 36, fontWeight: 900, color: WHITE, marginBottom: 12, lineHeight: 1.2 }}>
            Stoğunuzu Bugün Dijitalleştirin
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.72)", marginBottom: 28, maxWidth: 480 }}>
            14 gün ücretsiz, kurulum yok, kredi kartı gerekmez. Dakikalar içinde ilk ürününüzü girin.
          </p>
          <Link href="/login" className="sp-btn sp-btn-glow" style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "14px 32px", background: INDIGO, color: WHITE,
            borderRadius: 10, textDecoration: "none", fontSize: 16, fontWeight: 700,
            boxShadow: "0 4px 20px rgba(99,102,241,0.45)",
          }}>
            Ücretsiz Başla
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>
        <div style={{ width: 420, maxWidth: "100%" }}>
          <WarehouseScene maxWidth={420} />
        </div>
      </Reveal>
    </section>
  );
}

// ── FOOTER ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{ background: "#0D0B1E", padding: "48px 24px 28px", position: "relative", overflow: "hidden" }}>
      <DotGridBg color={WHITE} opacity={0.04} />
      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 48, marginBottom: 40 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: INDIGO, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BoxIcon size={16} color="white" />
              </div>
              <span style={{ fontSize: 18, fontWeight: 800, color: WHITE }}>Stok<span style={{ color: INDIGO }}>Panel</span></span>
            </div>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, maxWidth: 280 }}>
              Türkiye&apos;nin işletmeleri için geliştirilen akıllı stok ve satış yönetim platformu.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: "0.5px", marginBottom: 16 }}>ÜRÜN</h4>
            {[["Özellikler", "ozellikler"], ["Fiyatlandırma", "fiyat"], ["SSS", "sss"]].map(([l, h]) => (
              <a key={l} href={`#${h}`} style={{ display: "block", fontSize: 14, color: "rgba(255,255,255,0.55)", textDecoration: "none", marginBottom: 8 }}>{l}</a>
            ))}
          </div>
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: "0.5px", marginBottom: 16 }}>İLETİŞİM</h4>
            <a href="mailto:pazarlama@marssoft.com.tr" style={{ display: "block", fontSize: 14, color: "rgba(255,255,255,0.55)", textDecoration: "none", marginBottom: 8 }}>
              pazarlama@marssoft.com.tr
            </a>
            <Link href="/login" className="sp-btn" style={{ display: "inline-block", marginTop: 12, padding: "8px 18px", background: INDIGO, color: WHITE, borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              Giriş Yap
            </Link>
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", margin: 0 }}>© {new Date().getFullYear()} MarsSOFT. Tüm hakları saklıdır.</p>
          <div style={{ display: "flex", gap: 16 }}>
            {["Gizlilik", "Kullanım Koşulları"].map((l) => (
              <a key={l} href="#" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────

export default function StokLandingPage() {
  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        @media (max-width: 768px) {
          .stok-hero-grid { grid-template-columns: 1fr !important; }
          .stok-hero-grid > div:last-child { display: none !important; }
          .stok-4col { grid-template-columns: repeat(2,1fr) !important; }
          .stok-3col { grid-template-columns: 1fr !important; }
          .sp-conn { display: none !important; }
          .stok-2col { grid-template-columns: 1fr !important; }
          .stok-cta-grid { grid-template-columns: 1fr !important; }
          .stok-cta-grid > div:last-child { display: none !important; }
        }
      `}</style>
      <div style={{ minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <Navbar />
        <ScrollProgress />
        <Hero />
        <Marquee />
        <StatsBar />
        <Features />
        <HowItWorks />
        <Pricing />
        <Testimonials />
        <FAQ />
        <CTABanner />
        <Footer />
      </div>
    </>
  );
}
