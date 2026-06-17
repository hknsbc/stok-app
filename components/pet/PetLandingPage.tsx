"use client";
import { useState } from "react";
import Link from "next/link";

const NAVY = "#1E3A8A";
const RED = "#EF4444";
const ORANGE = "#F97316";
const BG = "#F8FAFC";
const WHITE = "#FFFFFF";
const GRAY = "#4B5563";
const LIGHT = "#EEF2FF";

// ── SVG ASSETS ──────────────────────────────────────────────────────────────

function PawPrint({ size = 32, color = NAVY, opacity = 1 }: { size?: number; color?: string; opacity?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill={color} style={{ opacity }}>
      <ellipse cx="50" cy="67" rx="27" ry="24" />
      <ellipse cx="25" cy="38" rx="11" ry="14" />
      <ellipse cx="44" cy="27" rx="10" ry="13" />
      <ellipse cx="63" cy="27" rx="10" ry="13" />
      <ellipse cx="79" cy="38" rx="11" ry="14" />
    </svg>
  );
}

function PawPatternBg({ color = NAVY, opacity = 0.06 }: { color?: string; opacity?: number }) {
  return (
    <svg
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern id="pawBg" x="0" y="0" width="110" height="110" patternUnits="userSpaceOnUse">
          <g opacity={opacity} fill={color} transform="translate(5,8) rotate(-15, 50, 55)">
            <ellipse cx="50" cy="67" rx="27" ry="24" />
            <ellipse cx="25" cy="38" rx="11" ry="14" />
            <ellipse cx="44" cy="27" rx="10" ry="13" />
            <ellipse cx="63" cy="27" rx="10" ry="13" />
            <ellipse cx="79" cy="38" rx="11" ry="14" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#pawBg)" />
    </svg>
  );
}

function CatSVG() {
  return (
    <svg viewBox="0 0 180 220" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", maxWidth: 170 }}>
      <path d="M125 178 Q162 158 156 120 Q152 106 143 116 Q138 130 126 152" stroke="#FB923C" strokeWidth="13" strokeLinecap="round" fill="none"/>
      <ellipse cx="82" cy="160" rx="54" ry="52" fill={ORANGE}/>
      <circle cx="82" cy="88" r="47" fill={ORANGE}/>
      <polygon points="43,57 29,8 65,50" fill={ORANGE}/>
      <polygon points="45,54 35,22 63,47" fill="#FCA5A5"/>
      <polygon points="121,57 135,8 99,50" fill={ORANGE}/>
      <polygon points="119,54 129,22 101,47" fill="#FCA5A5"/>
      <ellipse cx="65" cy="84" rx="13" ry="15" fill="white"/>
      <ellipse cx="99" cy="84" rx="13" ry="15" fill="white"/>
      <ellipse cx="65" cy="86" rx="9" ry="11" fill="#16A34A"/>
      <ellipse cx="99" cy="86" rx="9" ry="11" fill="#16A34A"/>
      <ellipse cx="66" cy="87" rx="5" ry="8" fill="#111827"/>
      <ellipse cx="100" cy="87" rx="5" ry="8" fill="#111827"/>
      <circle cx="61" cy="81" r="2.5" fill="white"/>
      <circle cx="95" cy="81" r="2.5" fill="white"/>
      <path d="M78,103 L82,109 L86,103 Z" fill="#EC4899"/>
      <path d="M75,111 Q82,118 89,111" stroke="#EC4899" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <line x1="30" y1="101" x2="68" y2="106" stroke="#9CA3AF" strokeWidth="1.5"/>
      <line x1="28" y1="107" x2="68" y2="108" stroke="#9CA3AF" strokeWidth="1.5"/>
      <line x1="30" y1="113" x2="68" y2="110" stroke="#9CA3AF" strokeWidth="1.5"/>
      <line x1="96" y1="106" x2="134" y2="101" stroke="#9CA3AF" strokeWidth="1.5"/>
      <line x1="96" y1="108" x2="136" y2="107" stroke="#9CA3AF" strokeWidth="1.5"/>
      <line x1="96" y1="110" x2="134" y2="113" stroke="#9CA3AF" strokeWidth="1.5"/>
      <path d="M47,130 Q82,144 117,130" stroke={NAVY} strokeWidth="9" strokeLinecap="round" fill="none"/>
      <circle cx="82" cy="139" r="7" fill={RED}/>
      <ellipse cx="62" cy="207" rx="18" ry="12" fill="#FB923C"/>
      <ellipse cx="102" cy="207" rx="18" ry="12" fill="#FB923C"/>
    </svg>
  );
}

function DogSVG() {
  return (
    <svg viewBox="0 0 180 220" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", maxWidth: 170 }}>
      <path d="M130 162 Q168 144 162 110 Q159 98 148 107 Q143 121 131 146" stroke="#D97706" strokeWidth="14" strokeLinecap="round" fill="none"/>
      <ellipse cx="82" cy="160" rx="52" ry="50" fill="#FBBF24"/>
      <ellipse cx="43" cy="75" rx="20" ry="34" fill="#D97706" transform="rotate(12,43,75)"/>
      <ellipse cx="121" cy="75" rx="20" ry="34" fill="#D97706" transform="rotate(-12,121,75)"/>
      <circle cx="82" cy="78" r="44" fill="#FBBF24"/>
      <ellipse cx="82" cy="97" rx="24" ry="18" fill="#D97706"/>
      <ellipse cx="82" cy="91" rx="10" ry="8" fill="#1F2937"/>
      <ellipse cx="78" cy="89" rx="3" ry="2" fill="#374151" opacity="0.5"/>
      <path d="M70,106 Q82,115 94,106" stroke="#92400E" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <ellipse cx="82" cy="115" rx="9" ry="7" fill="#F87171"/>
      <ellipse cx="63" cy="71" rx="13" ry="14" fill="white"/>
      <ellipse cx="101" cy="71" rx="13" ry="14" fill="white"/>
      <circle cx="64" cy="73" r="8" fill="#78350F"/>
      <circle cx="102" cy="73" r="8" fill="#78350F"/>
      <circle cx="64" cy="73" r="4.5" fill="#111827"/>
      <circle cx="102" cy="73" r="4.5" fill="#111827"/>
      <circle cx="60" cy="68" r="2.5" fill="white"/>
      <circle cx="98" cy="68" r="2.5" fill="white"/>
      <path d="M46,115 Q82,129 118,115" stroke={NAVY} strokeWidth="9" strokeLinecap="round" fill="none"/>
      <circle cx="82" cy="124" r="7" fill={RED}/>
      <ellipse cx="60" cy="206" rx="20" ry="13" fill="#D97706"/>
      <ellipse cx="104" cy="206" rx="20" ry="13" fill="#D97706"/>
    </svg>
  );
}

function SmallCatSVG() {
  return (
    <svg viewBox="0 0 80 80" fill="none" style={{ width: 64, height: 64 }}>
      <circle cx="40" cy="38" r="24" fill={ORANGE}/>
      <polygon points="20,25 14,4 32,22" fill={ORANGE}/>
      <polygon points="21,24 16,10 30,21" fill="#FCA5A5"/>
      <polygon points="60,25 66,4 48,22" fill={ORANGE}/>
      <polygon points="59,24 64,10 50,21" fill="#FCA5A5"/>
      <ellipse cx="32" cy="36" rx="7" ry="8" fill="white"/>
      <ellipse cx="48" cy="36" rx="7" ry="8" fill="white"/>
      <circle cx="33" cy="37" r="4" fill="#16A34A"/>
      <circle cx="49" cy="37" r="4" fill="#16A34A"/>
      <circle cx="33" cy="37" r="2" fill="#111"/>
      <circle cx="49" cy="37" r="2" fill="#111"/>
      <path d="M37,47 L40,51 L43,47 Z" fill="#EC4899"/>
    </svg>
  );
}

function SmallDogSVG() {
  return (
    <svg viewBox="0 0 80 80" fill="none" style={{ width: 64, height: 64 }}>
      <ellipse cx="19" cy="34" rx="10" ry="16" fill="#D97706" transform="rotate(8,19,34)"/>
      <ellipse cx="61" cy="34" rx="10" ry="16" fill="#D97706" transform="rotate(-8,61,34)"/>
      <circle cx="40" cy="36" r="24" fill="#FBBF24"/>
      <ellipse cx="40" cy="46" rx="12" ry="9" fill="#D97706"/>
      <ellipse cx="40" cy="42" rx="5" ry="4" fill="#1F2937"/>
      <ellipse cx="32" cy="32" rx="7" ry="7" fill="white"/>
      <ellipse cx="48" cy="32" rx="7" ry="7" fill="white"/>
      <circle cx="33" cy="33" r="4" fill="#78350F"/>
      <circle cx="49" cy="33" r="4" fill="#78350F"/>
      <circle cx="33" cy="33" r="2" fill="#111"/>
      <circle cx="49" cy="33" r="2" fill="#111"/>
    </svg>
  );
}

// ── NAVBAR ──────────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: WHITE,
      borderBottom: "1px solid #E2E8F0",
      boxShadow: "0 1px 8px rgba(30,58,138,0.08)",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <PawPrint size={28} color={ORANGE} />
          <span style={{ fontSize: 20, fontWeight: 800, color: NAVY, letterSpacing: "-0.5px" }}>Pet<span style={{ color: ORANGE }}>Panel</span></span>
        </div>
        <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <a href="#ozellikler" style={{ padding: "8px 14px", color: GRAY, textDecoration: "none", fontSize: 14, fontWeight: 500 }}>Özellikler</a>
          <a href="#fiyat" style={{ padding: "8px 14px", color: GRAY, textDecoration: "none", fontSize: 14, fontWeight: 500 }}>Fiyatlandırma</a>
          <a href="#sss" style={{ padding: "8px 14px", color: GRAY, textDecoration: "none", fontSize: 14, fontWeight: 500 }}>SSS</a>
          <Link href="/login" style={{ padding: "8px 16px", color: NAVY, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>Giriş Yap</Link>
          <Link href="/login" style={{
            padding: "9px 20px", background: RED, color: WHITE, borderRadius: 8,
            textDecoration: "none", fontSize: 14, fontWeight: 700,
          }}>
            Ücretsiz Dene →
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ── HERO ────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section style={{ background: `linear-gradient(135deg, ${LIGHT} 0%, ${BG} 60%)`, position: "relative", overflow: "hidden", padding: "80px 24px 60px" }}>
      <PawPatternBg color={NAVY} opacity={0.05} />
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center", position: "relative", zIndex: 1 }}>

        {/* Left: Copy */}
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${ORANGE}18`, border: `1px solid ${ORANGE}40`, borderRadius: 20, padding: "5px 14px", marginBottom: 20 }}>
            <PawPrint size={14} color={ORANGE} />
            <span style={{ fontSize: 12, fontWeight: 700, color: ORANGE, letterSpacing: "0.5px" }}>TÜRKİYE'NİN #1 PETSHOP YAZILIMI</span>
          </div>

          <h1 style={{ fontSize: 48, fontWeight: 900, color: NAVY, lineHeight: 1.12, marginBottom: 20, letterSpacing: "-1px" }}>
            Petshop&apos;unu<br />
            <span style={{ color: ORANGE }}>Akıllı Sistemle</span><br />
            Yönet
          </h1>

          <p style={{ fontSize: 18, color: GRAY, lineHeight: 1.65, marginBottom: 32, maxWidth: 460 }}>
            Stok, SKT takibi, müşteri ve pet kartı yönetimini tek panelden kontrol et. Satışlarını artır, kayıplarını sıfırla.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 32 }}>
            <Link href="/login" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 28px", background: RED, color: WHITE,
              borderRadius: 10, textDecoration: "none", fontSize: 16, fontWeight: 700,
              boxShadow: "0 4px 16px rgba(239,68,68,0.35)",
            }}>
              Hemen Ücretsiz Dene
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <a href="#ozellikler" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 24px", background: WHITE, color: NAVY,
              borderRadius: 10, textDecoration: "none", fontSize: 16, fontWeight: 600,
              border: `2px solid ${NAVY}20`,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" fill="currentColor" stroke="none"/></svg>
              Özellikleri Gör
            </a>
          </div>

          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {["Kredi kartı gerekmez", "7 gün ücretsiz", "Anında kurulum"].map((t) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <span style={{ fontSize: 13, color: GRAY, fontWeight: 500 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Illustration */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
          <div style={{ display: "flex", gap: 0, alignItems: "flex-end", justifyContent: "center" }}>
            <div style={{ transform: "translateX(16px) translateY(8px)", filter: "drop-shadow(0 20px 40px rgba(30,58,138,0.15))" }}>
              <CatSVG />
            </div>
            <div style={{ transform: "translateX(-16px)", filter: "drop-shadow(0 20px 40px rgba(251,191,36,0.2))" }}>
              <DogSVG />
            </div>
          </div>

          {/* Floating badges */}
          <div style={{
            position: "absolute", top: 10, left: -10,
            background: WHITE, borderRadius: 12, padding: "10px 16px",
            boxShadow: "0 4px 20px rgba(30,58,138,0.12)",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>500+ Petshop</div>
              <div style={{ fontSize: 11, color: "#6B7280" }}>aktif kullanıcı</div>
            </div>
          </div>

          <div style={{
            position: "absolute", bottom: 40, right: -10,
            background: WHITE, borderRadius: 12, padding: "10px 16px",
            boxShadow: "0 4px 20px rgba(30,58,138,0.12)",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>SKT Uyarısı</div>
              <div style={{ fontSize: 11, color: "#6B7280" }}>3 ürün süresi dolmak üzere</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── STATS BAR ───────────────────────────────────────────────────────────────

function StatsBar() {
  const stats = [
    { value: "500+", label: "Aktif Petshop" },
    { value: "50.000+", label: "Pet Kaydı" },
    { value: "%99.9", label: "Uptime" },
    { value: "7/24", label: "Teknik Destek" },
  ];

  return (
    <section style={{ background: NAVY, padding: "28px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, textAlign: "center" }}>
        {stats.map((s) => (
          <div key={s.label}>
            <div style={{ fontSize: 30, fontWeight: 900, color: WHITE, letterSpacing: "-0.5px" }}>{s.value}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── FEATURES ────────────────────────────────────────────────────────────────

function Features() {
  const features = [
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          <circle cx="12" cy="8" r="1" fill={ORANGE}/>
        </svg>
      ),
      title: "Otomatik SKT Uyarıları",
      desc: "Son kullanma tarihi yaklaşan ürünleri otomatik algıla. Kayıpları sıfırla, zamanında sil veya indirime al.",
      color: "#FFF7ED",
      border: "#FDBA74",
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
          <rect x="7" y="6" width="4" height="3" rx="0.5" fill={NAVY} stroke="none" opacity="0.3"/>
        </svg>
      ),
      title: "Akıllı Stok Yönetimi",
      desc: "Ürün girişi, satışı ve transferini takip et. Stok seviyesi düşünce anında bildirim al.",
      color: "#EEF2FF",
      border: "#A5B4FC",
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2">
          <rect x="3" y="4" width="18" height="16" rx="2"/>
          <path d="M7 4V2M17 4V2M3 10h18"/>
          <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" stroke={RED} strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      ),
      title: "Hızlı Barkod Satış",
      desc: "Kasada barkod okut, sepete otomatik ekle. Nakit veya kredi kartı seçeneğiyle saniyeler içinde satışı tamamla.",
      color: "#FFF1F2",
      border: "#FCA5A5",
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" strokeWidth="2">
          <ellipse cx="12" cy="18" rx="8" ry="5" stroke="#16A34A"/>
          <circle cx="6.5" cy="8.5" r="3" stroke="#16A34A"/>
          <circle cx="11" cy="5.5" r="2.5" stroke="#16A34A"/>
          <circle cx="16.5" cy="5.5" r="2.5" stroke="#16A34A"/>
          <circle cx="19.5" cy="9" r="2.5" stroke="#16A34A"/>
        </svg>
      ),
      title: "Pet Kartı Yönetimi",
      desc: "Her hayvana özel kart oluştur. Cins, yaş, sağlık geçmişi ve sahip bilgilerini tek yerde tut.",
      color: "#F0FDF4",
      border: "#86EFAC",
    },
  ];

  return (
    <section id="ozellikler" style={{ background: WHITE, padding: "80px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${NAVY}0F`, borderRadius: 20, padding: "5px 16px", marginBottom: 16 }}>
            <PawPrint size={14} color={NAVY} />
            <span style={{ fontSize: 12, fontWeight: 700, color: NAVY, letterSpacing: "0.5px" }}>ÖZELLİKLER</span>
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: NAVY, marginBottom: 12 }}>Her Petshop&apos;un İhtiyacı Olan Araçlar</h2>
          <p style={{ fontSize: 16, color: GRAY, maxWidth: 520, margin: "0 auto" }}>
            Tek platform, tüm ihtiyaçlar. Stoğunuzu yönetin, SKT&apos;leri takip edin, satışlarınızı analiz edin.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24 }}>
          {features.map((f) => (
            <div key={f.title} style={{
              background: f.color, borderRadius: 16, padding: 28,
              border: `1px solid ${f.border}`,
              display: "flex", gap: 20, alignItems: "flex-start",
            }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: WHITE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 2px 8px ${f.border}60` }}>
                {f.icon}
              </div>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: NAVY, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: GRAY, lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── HOW IT WORKS ─────────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    { n: "1", title: "Kaydolun", desc: "E-posta ve şifrenizle 30 saniyede hesap oluşturun. Kredi kartı gerekmez." },
    { n: "2", title: "Stok & Pet Kartı Ekleyin", desc: "Ürünlerinizi, barkodlarını ve hayvan kartlarını sisteme yükleyin." },
    { n: "3", title: "Satışa Başlayın", desc: "Kasa, raporlar ve uyarılarla işletmenizi tam kontrol altında tutun." },
  ];

  return (
    <section style={{ background: BG, padding: "80px 24px", position: "relative", overflow: "hidden" }}>
      <PawPatternBg color={NAVY} opacity={0.04} />
      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: NAVY, marginBottom: 12 }}>3 Adımda Başlayın</h2>
          <p style={{ fontSize: 16, color: GRAY }}>Kurulum yok, teknik bilgi gerekmez.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
          {steps.map((s, i) => (
            <div key={s.n} style={{ textAlign: "center", position: "relative" }}>
              {i < 2 && (
                <div style={{ position: "absolute", top: 30, left: "calc(50% + 40px)", width: "calc(100% - 80px)", height: 2, background: `${NAVY}20`, zIndex: 0 }} />
              )}
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ width: 60, height: 60, borderRadius: "50%", background: NAVY, color: WHITE, fontSize: 22, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                  {s.n}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: NAVY, marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: GRAY, lineHeight: 1.65, maxWidth: 260, margin: "0 auto" }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── PRICING ──────────────────────────────────────────────────────────────────

function Pricing() {
  const [annual, setAnnual] = useState(true);

  const plans = [
    {
      name: "Profesyonel",
      monthlyPrice: "1.599",
      annualPrice: "15.588",
      annualPerMonth: "1.299",
      color: ORANGE,
      popular: false,
      cta: "Hemen Başla",
      ctaLink: "/login",
      features: [
        "Cari yönetimi",
        "Ürün & stok yönetimi",
        "Alışlar & satışlar",
        "Pet Kartları",
        "SKT takibi",
        "Barkod okutma",
        "Kasa / Gün sonu raporu",
        "1 kullanıcı",
        "Temel raporlar",
      ],
    },
    {
      name: "İş Planı",
      monthlyPrice: null,
      annualPrice: null,
      color: "#10B981",
      popular: true,
      cta: "Fiyat Al",
      ctaLink: "mailto:pazarlama@marssoft.com.tr?subject=İş Planı Fiyat Talebi",
      features: [
        "Profesyonel plan dahil",
        "Çoklu şube yönetimi",
        "Şubeler arası stok transferi",
        "Merkezi raporlama",
        "Kullanıcı yetkilendirme",
        "Hedef / performans takibi",
        "WhatsApp bildirimi",
        "Öncelikli destek",
      ],
    },
  ];

  return (
    <section id="fiyat" style={{ background: WHITE, padding: "80px 24px", position: "relative" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${ORANGE}18`, borderRadius: 20, padding: "5px 16px", marginBottom: 16 }}>
            <PawPrint size={14} color={ORANGE} />
            <span style={{ fontSize: 12, fontWeight: 700, color: ORANGE, letterSpacing: "0.5px" }}>FİYATLANDIRMA</span>
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: NAVY, marginBottom: 12 }}>Şeffaf Fiyatlar</h2>
          <p style={{ fontSize: 16, color: GRAY, marginBottom: 28 }}>7 gün ücretsiz dene, beğenirsen devam et.</p>

          {/* Toggle */}
          <div style={{ display: "inline-flex", background: BG, borderRadius: 10, padding: 4, gap: 4 }}>
            <button
              onClick={() => setAnnual(false)}
              style={{
                padding: "8px 24px", borderRadius: 8, border: "none", cursor: "pointer",
                background: !annual ? NAVY : "transparent",
                color: !annual ? WHITE : GRAY,
                fontSize: 14, fontWeight: 600, transition: "all 0.2s",
              }}
            >
              Aylık
            </button>
            <button
              onClick={() => setAnnual(true)}
              style={{
                padding: "8px 24px", borderRadius: 8, border: "none", cursor: "pointer",
                background: annual ? NAVY : "transparent",
                color: annual ? WHITE : GRAY,
                fontSize: 14, fontWeight: 600, transition: "all 0.2s",
                display: "flex", alignItems: "center", gap: 8,
              }}
            >
              Yıllık
              <span style={{ background: "#DCFCE7", color: "#16A34A", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>2 ay ücretsiz</span>
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {plans.map((plan) => (
            <div key={plan.name} style={{ position: "relative" }}>
              {plan.popular && (
                <div style={{
                  position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)",
                  background: plan.color, color: WHITE, fontSize: 11, fontWeight: 800,
                  padding: "4px 18px", borderRadius: 20, whiteSpace: "nowrap", zIndex: 1,
                }}>
                  ✦ EN POPÜLER
                </div>
              )}
              <div style={{
                background: WHITE, borderRadius: 20, padding: "32px 28px",
                border: `2px solid ${plan.popular ? plan.color : "#E2E8F0"}`,
                boxShadow: plan.popular ? `0 8px 32px ${plan.color}25` : "0 2px 12px rgba(0,0,0,0.06)",
                height: "100%", display: "flex", flexDirection: "column",
              }}>
                {/* Mascot */}
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: -8 }}>
                  {plan.name === "Profesyonel" ? <SmallCatSVG /> : <SmallDogSVG />}
                </div>

                <h3 style={{ fontSize: 22, fontWeight: 800, color: NAVY, marginBottom: 8 }}>{plan.name}</h3>

                {/* Price display */}
                {plan.monthlyPrice ? (
                  <div style={{ marginBottom: 24 }}>
                    {annual ? (
                      <>
                        <div style={{ fontSize: 13, color: GRAY, textDecoration: "line-through" }}>
                          {plan.monthlyPrice} TL/ay
                        </div>
                        <div style={{ fontSize: 38, fontWeight: 900, color: plan.color, lineHeight: 1.1 }}>
                          {plan.annualPerMonth} <span style={{ fontSize: 16, fontWeight: 500, color: GRAY }}>TL/ay</span>
                        </div>
                        <div style={{ fontSize: 13, color: GRAY, marginTop: 4 }}>
                          Yıllık {plan.annualPrice} TL + KDV · 2 ay ücretsiz
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: 38, fontWeight: 900, color: plan.color, lineHeight: 1.1 }}>
                          {plan.monthlyPrice} <span style={{ fontSize: 16, fontWeight: 500, color: GRAY }}>TL/ay</span>
                        </div>
                        <div style={{ fontSize: 13, color: GRAY, marginTop: 4 }}>Aylık ödeme</div>
                      </>
                    )}
                  </div>
                ) : (
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 30, fontWeight: 900, color: plan.color, lineHeight: 1.2 }}>Fiyat Alınız</div>
                    <div style={{ fontSize: 13, color: GRAY, marginTop: 4 }}>Şube sayısına göre özel fiyat</div>
                  </div>
                )}

                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", flex: 1 }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 0", fontSize: 14, color: "#374151" }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                        <circle cx="8" cy="8" r="8" fill={`${plan.color}20`}/>
                        <path d="M4.5 8l2.5 2.5 4.5-4.5" stroke={plan.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                {plan.ctaLink.startsWith("mailto:") ? (
                  <a href={plan.ctaLink} style={{
                    display: "block", textAlign: "center", padding: "13px 0",
                    background: plan.color, color: WHITE, borderRadius: 10,
                    textDecoration: "none", fontSize: 15, fontWeight: 700,
                  }}>
                    {plan.cta} →
                  </a>
                ) : (
                  <Link href={plan.ctaLink} style={{
                    display: "block", textAlign: "center", padding: "13px 0",
                    background: plan.color, color: WHITE, borderRadius: 10,
                    textDecoration: "none", fontSize: 15, fontWeight: 700,
                  }}>
                    {plan.cta} →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
          {["SSL güvenlik", "Günlük yedekleme", "7/24 teknik destek", "İptal garantisi"].map((f) => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: GRAY }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5L12 3" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {f}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── TESTIMONIALS ─────────────────────────────────────────────────────────────

function Testimonials() {
  const reviews = [
    {
      name: "Ayşe K.",
      shop: "Patici Petshop, İstanbul",
      text: "SKT takibi sayesinde artık hiçbir ürünümüzün tarihi geçmiyor. Geçen yıl binlerce liralık ürün çöpe gidiyordu, şimdi sıfır kayıp.",
      stars: 5,
    },
    {
      name: "Mehmet Y.",
      shop: "Happy Paws, Ankara",
      text: "Kasa ve stok entegrasyonu mükemmel. Günlük kapanış raporunu tek tıkla alıyorum. Muhasebecim de çok memnun.",
      stars: 5,
    },
    {
      name: "Zeynep A.",
      shop: "PawLove, İzmir",
      text: "7 gün deneme sonrası hemen yıllık plana geçtik. Pet kartları özelliği müşterilerimizi çok memnun ediyor.",
      stars: 5,
    },
  ];

  return (
    <section style={{ background: BG, padding: "80px 24px", position: "relative", overflow: "hidden" }}>
      <PawPatternBg color={ORANGE} opacity={0.05} />
      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: NAVY, marginBottom: 12 }}>Petshop Sahipleri Anlatıyor</h2>
          <p style={{ fontSize: 16, color: GRAY }}>500+ işletmenin tercihi.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {reviews.map((r) => (
            <div key={r.name} style={{ background: WHITE, borderRadius: 16, padding: 28, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", gap: 2, marginBottom: 16 }}>
                {Array.from({ length: r.stars }).map((_, i) => (
                  <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#FBBF24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                ))}
              </div>
              <p style={{ fontSize: 15, color: GRAY, lineHeight: 1.7, marginBottom: 20, fontStyle: "italic" }}>
                &ldquo;{r.text}&rdquo;
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${NAVY}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <PawPrint size={18} color={NAVY} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: "#9CA3AF" }}>{r.shop}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────────

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  const items = [
    {
      q: "PetPanel nedir?",
      a: "PetPanel, petshop ve hayvan bakım mağazaları için geliştirilmiş bulut tabanlı yönetim yazılımıdır. Stok, SKT takibi, müşteri (cari) yönetimi, pet kartları, kasa ve raporlama gibi tüm operasyonları tek panelden yönetmenizi sağlar.",
    },
    {
      q: "7 günlük deneme nasıl çalışır?",
      a: "Kayıt olduğunuz anda 7 günlük deneme hemen başlar. Kredi kartı girmenize gerek yoktur. Deneme süresince tüm Profesyonel plan özelliklerine sınırsız erişirsiniz. Süre bitiminde abonelik seçebilir veya sistemi bırakabilirsiniz.",
    },
    {
      q: "Hangi ödeme yöntemlerini kabul ediyorsunuz?",
      a: "Kredi kartı, banka havalesi ve EFT ile ödeme yapabilirsiniz. Yıllık planlarda fatura kesilir. Ödeme ve faturalama için pazarlama@marssoft.com.tr adresinden bize ulaşabilirsiniz.",
    },
    {
      q: "Mevcut stok verilerimi sisteme nasıl aktarabilirim?",
      a: "Excel veya CSV formatındaki ürün ve müşteri listelerinizi sisteme toplu olarak yükleyebilirsiniz. Teknik destek ekibimiz aktarım sürecinde size yardımcı olur.",
    },
    {
      q: "Aboneliğimi istediğim zaman iptal edebilir miyim?",
      a: "Evet, aboneliğinizi istediğiniz zaman iptal edebilirsiniz. Yıllık planda kalan süreye ait ücret iade edilmez; ancak iptal tarihine kadar sistemi kullanmaya devam edersiniz.",
    },
    {
      q: "Teknik destek nasıl çalışır?",
      a: "7/24 e-posta desteği, iş saatlerinde WhatsApp ve telefon desteği sunuyoruz. İş Planı müşterilerimiz öncelikli destek hattından yararlanır. Ortalama yanıt süremiz 2 saattir.",
    },
  ];

  return (
    <section id="sss" style={{ background: WHITE, padding: "80px 24px" }}>
      <div style={{ maxWidth: 780, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: NAVY, marginBottom: 12 }}>Sık Sorulan Sorular</h2>
          <p style={{ fontSize: 16, color: GRAY }}>Aklınızdaki soruların cevabı burada.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((item, i) => (
            <div
              key={i}
              style={{
                border: `1px solid ${open === i ? NAVY + "30" : "#E2E8F0"}`,
                borderRadius: 12,
                overflow: "hidden",
                background: open === i ? LIGHT : WHITE,
              }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: "100%", padding: "18px 24px",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: "none", border: "none", cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: 15, fontWeight: 600, color: NAVY }}>{item.q}</span>
                <svg
                  width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="2"
                  style={{ flexShrink: 0, transition: "transform 0.2s", transform: open === i ? "rotate(180deg)" : "rotate(0deg)" }}
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              {open === i && (
                <div style={{ padding: "0 24px 20px" }}>
                  <p style={{ fontSize: 14, color: GRAY, lineHeight: 1.7, margin: 0 }}>{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA BANNER ───────────────────────────────────────────────────────────────

function CTABanner() {
  return (
    <section style={{ background: NAVY, padding: "72px 24px", position: "relative", overflow: "hidden" }}>
      <PawPatternBg color={WHITE} opacity={0.06} />
      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 48 }}>
        <div>
          <h2 style={{ fontSize: 36, fontWeight: 900, color: WHITE, marginBottom: 12, lineHeight: 1.2 }}>
            Petshop&apos;unuzu Bugün Dijitalleştirin
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.75)", marginBottom: 28, maxWidth: 480 }}>
            7 gün ücretsiz, kurulum yok, kredi kartı gerekmez. İlk satışınızı dakikalar içinde yapın.
          </p>
          <Link href="/login" style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "14px 32px", background: RED, color: WHITE,
            borderRadius: 10, textDecoration: "none", fontSize: 16, fontWeight: 700,
            boxShadow: "0 4px 20px rgba(239,68,68,0.4)",
          }}>
            Ücretsiz Başla
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>
        <div style={{ display: "flex", gap: -20, opacity: 0.9 }}>
          <div style={{ transform: "translateX(20px) scale(0.9)" }}>
            <CatSVG />
          </div>
          <div style={{ transform: "scale(0.9)" }}>
            <DogSVG />
          </div>
        </div>
      </div>
    </section>
  );
}

// ── FOOTER ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{ background: "#0F1E4A", padding: "48px 24px 28px", position: "relative", overflow: "hidden" }}>
      <PawPatternBg color={WHITE} opacity={0.04} />
      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 48, marginBottom: 40 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <PawPrint size={24} color={ORANGE} />
              <span style={{ fontSize: 18, fontWeight: 800, color: WHITE }}>Pet<span style={{ color: ORANGE }}>Panel</span></span>
            </div>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.65, maxWidth: 280 }}>
              Türkiye&apos;nin petshopları için geliştirilen akıllı yönetim platformu.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.5px", marginBottom: 16 }}>ÜRÜN</h4>
            {["Özellikler", "Fiyatlandırma", "SSS"].map((l) => (
              <a key={l} href={`#${l === "Özellikler" ? "ozellikler" : l === "Fiyatlandırma" ? "fiyat" : "sss"}`} style={{ display: "block", fontSize: 14, color: "rgba(255,255,255,0.6)", textDecoration: "none", marginBottom: 8 }}>
                {l}
              </a>
            ))}
          </div>
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.5px", marginBottom: 16 }}>İLETİŞİM</h4>
            <a href="mailto:pazarlama@marssoft.com.tr" style={{ display: "block", fontSize: 14, color: "rgba(255,255,255,0.6)", textDecoration: "none", marginBottom: 8 }}>
              pazarlama@marssoft.com.tr
            </a>
            <Link href="/login" style={{ display: "inline-block", marginTop: 12, padding: "8px 18px", background: ORANGE, color: WHITE, borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              Giriş Yap
            </Link>
          </div>
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", margin: 0 }}>
            © {new Date().getFullYear()} MarsSOFT. Tüm hakları saklıdır.
          </p>
          <div style={{ display: "flex", gap: 16 }}>
            {["Gizlilik", "Kullanım Koşulları"].map((l) => (
              <a key={l} href="#" style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function PetLandingPage() {
  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-grid > div:last-child { display: none !important; }
          .hero-title { font-size: 36px !important; }
          .stats-grid-4 { grid-template-columns: repeat(2, 1fr) !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
          .pricing-grid { grid-template-columns: 1fr !important; }
          .reviews-grid { grid-template-columns: 1fr !important; }
          .footer-grid { grid-template-columns: 1fr !important; }
          .cta-grid { grid-template-columns: 1fr !important; }
          .cta-grid > div:last-child { display: none !important; }
          .nav-links { display: none !important; }
        }
      `}</style>
      <div style={{ minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <Navbar />
        <Hero />
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
