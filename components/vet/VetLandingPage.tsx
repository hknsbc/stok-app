"use client";
import { useState } from "react";
import Link from "next/link";

const DEEP   = "#0C4A6E";
const BLUE   = "#0EA5E9";
const GREEN  = "#10B981";
const PURPLE = "#8B5CF6";
const BG     = "#F0F9FF";
const WHITE  = "#FFFFFF";
const GRAY   = "#4B5563";

// ── SVG ASSETS ───────────────────────────────────────────────────────────────

function StethoscopeIcon({ size = 28, color = DEEP }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/>
      <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/>
      <circle cx="20" cy="10" r="2"/>
    </svg>
  );
}

function MedicalPatternBg({ color = DEEP, opacity = 0.05 }: { color?: string; opacity?: number }) {
  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} aria-hidden>
      <defs>
        <pattern id="vetBg" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <g opacity={opacity} fill={color}>
            {/* Medical cross */}
            <rect x="34" y="26" width="12" height="28" rx="3"/>
            <rect x="26" y="34" width="28" height="12" rx="3"/>
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#vetBg)" />
    </svg>
  );
}

function VetCatSVG() {
  return (
    <svg viewBox="0 0 180 230" fill="none" style={{ width: "100%", maxWidth: 165 }}>
      {/* Tail */}
      <path d="M122 178 Q158 158 152 122 Q148 108 139 118 Q134 132 122 154" stroke="#FB923C" strokeWidth="12" strokeLinecap="round" fill="none"/>
      {/* Body */}
      <ellipse cx="80" cy="162" rx="52" ry="50" fill="#F97316"/>
      {/* Head */}
      <circle cx="80" cy="88" r="46" fill="#F97316"/>
      {/* Ears */}
      <polygon points="42,56 28,8 62,48" fill="#F97316"/>
      <polygon points="44,53 34,20 60,45" fill="#FCA5A5"/>
      <polygon points="118,56 132,8 98,48" fill="#F97316"/>
      <polygon points="116,53 126,20 100,45" fill="#FCA5A5"/>
      {/* Eyes */}
      <ellipse cx="64" cy="84" rx="12" ry="14" fill="white"/>
      <ellipse cx="96" cy="84" rx="12" ry="14" fill="white"/>
      <ellipse cx="64" cy="86" rx="8" ry="10" fill={BLUE}/>
      <ellipse cx="96" cy="86" rx="8" ry="10" fill={BLUE}/>
      <ellipse cx="65" cy="87" rx="4" ry="7" fill="#111827"/>
      <ellipse cx="97" cy="87" rx="4" ry="7" fill="#111827"/>
      <circle cx="60" cy="81" r="2.5" fill="white"/>
      <circle cx="92" cy="81" r="2.5" fill="white"/>
      {/* Nose */}
      <path d="M76,103 L80,109 L84,103 Z" fill="#EC4899"/>
      {/* Mouth */}
      <path d="M73,111 Q80,118 87,111" stroke="#EC4899" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Whiskers */}
      <line x1="28" y1="101" x2="66" y2="106" stroke="rgba(150,150,150,0.6)" strokeWidth="1.5"/>
      <line x1="26" y1="107" x2="66" y2="108" stroke="rgba(150,150,150,0.6)" strokeWidth="1.5"/>
      <line x1="94" y1="106" x2="132" y2="101" stroke="rgba(150,150,150,0.6)" strokeWidth="1.5"/>
      <line x1="94" y1="108" x2="134" y2="107" stroke="rgba(150,150,150,0.6)" strokeWidth="1.5"/>
      {/* Stethoscope collar */}
      <path d="M46,128 Q80,142 114,128" stroke={DEEP} strokeWidth="9" strokeLinecap="round" fill="none"/>
      {/* Bandage on paw */}
      <ellipse cx="60" cy="207" rx="18" ry="12" fill="#FB923C"/>
      <ellipse cx="100" cy="207" rx="18" ry="12" fill="#FB923C"/>
      <rect x="52" y="201" width="16" height="8" rx="3" fill="white"/>
      <line x1="60" y1="201" x2="60" y2="209" stroke={GREEN} strokeWidth="2"/>
      <line x1="52" y1="205" x2="68" y2="205" stroke={GREEN} strokeWidth="2"/>
      {/* Doctor hat */}
      <rect x="56" y="43" width="48" height="8" rx="4" fill="white"/>
      <rect x="68" y="35" width="24" height="12" rx="4" fill="white"/>
      <path d="M76,35 L80,28 L84,35" fill={BLUE}/>
    </svg>
  );
}

function VetDogSVG() {
  return (
    <svg viewBox="0 0 180 230" fill="none" style={{ width: "100%", maxWidth: 165 }}>
      {/* Tail */}
      <path d="M128 164 Q164 146 158 114 Q155 100 145 110 Q140 124 128 148" stroke="#D97706" strokeWidth="14" strokeLinecap="round" fill="none"/>
      {/* Body */}
      <ellipse cx="80" cy="160" rx="52" ry="50" fill="#FBBF24"/>
      {/* Ears */}
      <ellipse cx="42" cy="75" rx="20" ry="34" fill="#D97706" transform="rotate(12,42,75)"/>
      <ellipse cx="118" cy="75" rx="20" ry="34" fill="#D97706" transform="rotate(-12,118,75)"/>
      {/* Head */}
      <circle cx="80" cy="78" r="44" fill="#FBBF24"/>
      {/* Snout */}
      <ellipse cx="80" cy="97" rx="24" ry="18" fill="#D97706"/>
      <ellipse cx="80" cy="91" rx="10" ry="8" fill="#1F2937"/>
      <ellipse cx="76" cy="89" rx="3" ry="2" fill="#374151" opacity="0.5"/>
      {/* Mouth */}
      <path d="M68,106 Q80,115 92,106" stroke="#92400E" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <ellipse cx="80" cy="115" rx="9" ry="7" fill="#F87171"/>
      {/* Eyes */}
      <ellipse cx="62" cy="70" rx="12" ry="13" fill="white"/>
      <ellipse cx="98" cy="70" rx="12" ry="13" fill="white"/>
      <circle cx="63" cy="72" r="8" fill="#78350F"/>
      <circle cx="99" cy="72" r="8" fill="#78350F"/>
      <circle cx="63" cy="72" r="4.5" fill="#111827"/>
      <circle cx="99" cy="72" r="4.5" fill="#111827"/>
      <circle cx="59" cy="67" r="2.5" fill="white"/>
      <circle cx="95" cy="67" r="2.5" fill="white"/>
      {/* Vet collar / cone ring */}
      <path d="M44,114 Q80,128 116,114" stroke={DEEP} strokeWidth="9" strokeLinecap="round" fill="none"/>
      <circle cx="80" cy="123" r="7" fill={GREEN}/>
      {/* Front paws */}
      <ellipse cx="58" cy="206" rx="20" ry="13" fill="#D97706"/>
      <ellipse cx="102" cy="206" rx="20" ry="13" fill="#D97706"/>
      {/* Syringe accessory */}
      <rect x="104" y="55" width="6" height="24" rx="3" fill="white" stroke={BLUE} strokeWidth="1.5"/>
      <rect x="103" y="53" width="8" height="6" rx="2" fill={BLUE}/>
      <line x1="107" y1="79" x2="107" y2="85" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round"/>
      <rect x="100" y="62" width="14" height="8" rx="1" fill="#E0F2FE"/>
      <line x1="107" y1="62" x2="107" y2="70" stroke={BLUE} strokeWidth="1" strokeDasharray="2 2"/>
    </svg>
  );
}

function SmallVetCat() {
  return (
    <svg viewBox="0 0 80 80" fill="none" style={{ width: 64, height: 64 }}>
      <circle cx="40" cy="38" r="24" fill="#F97316"/>
      <polygon points="20,25 14,4 32,22" fill="#F97316"/>
      <polygon points="21,24 16,10 30,21" fill="#FCA5A5"/>
      <polygon points="60,25 66,4 48,22" fill="#F97316"/>
      <polygon points="59,24 64,10 50,21" fill="#FCA5A5"/>
      <ellipse cx="32" cy="36" rx="7" ry="8" fill="white"/>
      <ellipse cx="48" cy="36" rx="7" ry="8" fill="white"/>
      <circle cx="33" cy="37" r="4" fill={BLUE}/>
      <circle cx="49" cy="37" r="4" fill={BLUE}/>
      <circle cx="33" cy="37" r="2" fill="#111"/>
      <circle cx="49" cy="37" r="2" fill="#111"/>
      <path d="M37,47 L40,51 L43,47 Z" fill="#EC4899"/>
      <rect x="32" y="18" width="16" height="5" rx="2.5" fill="white"/>
      <rect x="36" y="15" width="8" height="7" rx="2" fill="white"/>
    </svg>
  );
}

function SmallVetDog() {
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
      <rect x="26" y="54" width="28" height="5" rx="2.5" fill={DEEP}/>
      <circle cx="40" cy="56.5" r="3" fill={GREEN}/>
    </svg>
  );
}

// ── NAVBAR ────────────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: WHITE, borderBottom: "1px solid #E0F2FE",
      boxShadow: "0 1px 8px rgba(12,74,110,0.08)",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: DEEP, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <StethoscopeIcon size={18} color="white" />
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, color: DEEP, letterSpacing: "-0.5px" }}>Vet<span style={{ color: BLUE }}>Panel</span></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <a href="#ozellikler" style={{ padding: "8px 14px", color: GRAY, textDecoration: "none", fontSize: 14, fontWeight: 500 }}>Özellikler</a>
          <a href="#fiyat" style={{ padding: "8px 14px", color: GRAY, textDecoration: "none", fontSize: 14, fontWeight: 500 }}>Fiyatlandırma</a>
          <a href="#sss" style={{ padding: "8px 14px", color: GRAY, textDecoration: "none", fontSize: 14, fontWeight: 500 }}>SSS</a>
          <Link href="/login" style={{ padding: "8px 16px", color: DEEP, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>Giriş Yap</Link>
          <Link href="/login" style={{ padding: "9px 20px", background: GREEN, color: WHITE, borderRadius: 8, textDecoration: "none", fontSize: 14, fontWeight: 700 }}>
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
    <section style={{ background: `linear-gradient(135deg, #E0F2FE 0%, ${BG} 60%)`, position: "relative", overflow: "hidden", padding: "80px 24px 60px" }}>
      <MedicalPatternBg color={DEEP} opacity={0.04} />
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center", position: "relative", zIndex: 1 }}>

        {/* Left */}
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${BLUE}18`, border: `1px solid ${BLUE}40`, borderRadius: 20, padding: "5px 14px", marginBottom: 20 }}>
            <StethoscopeIcon size={14} color={BLUE} />
            <span style={{ fontSize: 12, fontWeight: 700, color: BLUE, letterSpacing: "0.5px" }}>TÜRKİYE&apos;NİN VETERİNER KLİNİK YAZILIMI</span>
          </div>

          <h1 style={{ fontSize: 48, fontWeight: 900, color: DEEP, lineHeight: 1.12, marginBottom: 20, letterSpacing: "-1px" }}>
            Veteriner<br />
            Kliniğinizi<br />
            <span style={{ color: BLUE }}>Akıllı Sistemle</span><br />
            Yönetin
          </h1>

          <p style={{ fontSize: 18, color: GRAY, lineHeight: 1.65, marginBottom: 32, maxWidth: 460 }}>
            Hasta kayıtları, aşı takvimi, ilaç stoku ve faturalamanızı tek panelden kontrol edin. Müşterilerinize WhatsApp ile otomatik hatırlatma gönderin.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 32 }}>
            <Link href="/login" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 28px", background: GREEN, color: WHITE,
              borderRadius: 10, textDecoration: "none", fontSize: 16, fontWeight: 700,
              boxShadow: "0 4px 16px rgba(16,185,129,0.35)",
            }}>
              Hemen Ücretsiz Dene
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <a href="#ozellikler" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 24px", background: WHITE, color: DEEP,
              borderRadius: 10, textDecoration: "none", fontSize: 16, fontWeight: 600,
              border: `2px solid ${DEEP}20`,
            }}>
              Özellikleri Keşfet
            </a>
          </div>

          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {["Kredi kartı gerekmez", "7 gün ücretsiz", "Anında kurulum"].map((txt) => (
              <div key={txt} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <span style={{ fontSize: 13, color: GRAY, fontWeight: 500 }}>{txt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Illustrations */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
          <div style={{ display: "flex", gap: 0, alignItems: "flex-end", justifyContent: "center" }}>
            <div style={{ transform: "translateX(14px) translateY(6px)", filter: "drop-shadow(0 20px 40px rgba(12,74,110,0.18))" }}>
              <VetCatSVG />
            </div>
            <div style={{ transform: "translateX(-14px)", filter: "drop-shadow(0 20px 40px rgba(14,165,233,0.15))" }}>
              <VetDogSVG />
            </div>
          </div>

          {/* Floating badge 1 */}
          <div style={{
            position: "absolute", top: 10, left: -10,
            background: WHITE, borderRadius: 12, padding: "10px 16px",
            boxShadow: "0 4px 20px rgba(12,74,110,0.12)",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: DEEP }}>200+ Klinik</div>
              <div style={{ fontSize: 11, color: "#6B7280" }}>aktif kullanıcı</div>
            </div>
          </div>

          {/* Floating badge 2 */}
          <div style={{
            position: "absolute", bottom: 40, right: -10,
            background: WHITE, borderRadius: 12, padding: "10px 16px",
            boxShadow: "0 4px 20px rgba(12,74,110,0.12)",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={PURPLE} strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: DEEP }}>Aşı Hatırlatma</div>
              <div style={{ fontSize: 11, color: "#6B7280" }}>3 hasta bu hafta</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── STATS BAR ─────────────────────────────────────────────────────────────────

function StatsBar() {
  const stats = [
    { value: "200+", label: "Aktif Klinik" },
    { value: "10.000+", label: "Hasta Kaydı" },
    { value: "50.000+", label: "Muayene" },
    { value: "7/24", label: "Teknik Destek" },
  ];
  return (
    <section style={{ background: DEEP, padding: "28px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, textAlign: "center" }}>
        {stats.map((s) => (
          <div key={s.label}>
            <div style={{ fontSize: 30, fontWeight: 900, color: WHITE, letterSpacing: "-0.5px" }}>{s.value}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── FEATURES ──────────────────────────────────────────────────────────────────

function Features() {
  const features = [
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
          <circle cx="18" cy="9" r="2" fill={BLUE} stroke="none" opacity="0.3"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke={BLUE} strokeWidth="1.5"/>
        </svg>
      ),
      title: "Hasta Kartı Yönetimi",
      desc: "Her hayvan için cins, yaş, sahip bilgisi ve sağlık geçmişini tek yerde saklayın. Hızla arayın, hızla bulun.",
      bg: "#E0F2FE", border: "#7DD3FC",
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={PURPLE} strokeWidth="2">
          <rect x="3" y="4" width="18" height="16" rx="2"/>
          <path d="M3 10h18M8 2v4M16 2v4"/>
          <path d="M8 14h.01M12 14h.01M16 14h.01" stroke={PURPLE} strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      ),
      title: "Aşı Takvimi",
      desc: "Tüm hastaların aşı programını takip edin. Yaklaşan aşılar için WhatsApp ile otomatik hatırlatma gönderin.",
      bg: "#EDE9FE", border: "#C4B5FD",
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2">
          <path d="M10.5 20H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v3"/>
          <circle cx="18" cy="18" r="3"/>
          <path d="M18 15v3l1.5 1.5"/>
        </svg>
      ),
      title: "İlaç Stoku & SKT Takibi",
      desc: "İlaç ve sarf malzemelerini takip edin. Son kullanma tarihi yaklaşanlar için anında uyarı alın.",
      bg: "#F0FDF4", border: "#86EFAC",
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      ),
      title: "Reçete & Faturalama",
      desc: "Muayene sonunda dijital reçete oluşturun, anında fatura kesin. Tüm kayıtlar bulutta güvenle saklanır.",
      bg: "#FFFBEB", border: "#FCD34D",
    },
  ];

  return (
    <section id="ozellikler" style={{ background: WHITE, padding: "80px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${BLUE}12`, borderRadius: 20, padding: "5px 16px", marginBottom: 16 }}>
            <StethoscopeIcon size={14} color={BLUE} />
            <span style={{ fontSize: 12, fontWeight: 700, color: BLUE, letterSpacing: "0.5px" }}>ÖZELLİKLER</span>
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: DEEP, marginBottom: 12 }}>Veteriner Kliniğinizin İhtiyacı Olan Her Şey</h2>
          <p style={{ fontSize: 16, color: GRAY, maxWidth: 520, margin: "0 auto" }}>
            Hasta yönetiminden faturaya, aşı takibinden ilaç stokuna kadar tam entegre bir sistem.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24 }}>
          {features.map((f) => (
            <div key={f.title} style={{ background: f.bg, borderRadius: 16, padding: 28, border: `1px solid ${f.border}`, display: "flex", gap: 20, alignItems: "flex-start" }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: WHITE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 2px 8px ${f.border}60` }}>
                {f.icon}
              </div>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: DEEP, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: GRAY, lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── HOW IT WORKS ──────────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    { n: "1", title: "Kaydolun", desc: "E-posta ve şifrenizle 30 saniyede hesap oluşturun. Kurulum gerektirmez." },
    { n: "2", title: "Hasta & Stok Ekleyin", desc: "Hayvan kartlarını, ilaçları ve aşı takvimlerini sisteme yükleyin." },
    { n: "3", title: "Kliniğinizi Yönetin", desc: "Muayene, reçete, fatura ve hatırlatmalarla kliniğinizi dijitalleştirin." },
  ];
  return (
    <section style={{ background: BG, padding: "80px 24px", position: "relative", overflow: "hidden" }}>
      <MedicalPatternBg color={BLUE} opacity={0.04} />
      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: DEEP, marginBottom: 12 }}>3 Adımda Başlayın</h2>
          <p style={{ fontSize: 16, color: GRAY }}>Teknik bilgi gerekmez. Dakikalar içinde hazır.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
          {steps.map((s, i) => (
            <div key={s.n} style={{ textAlign: "center", position: "relative" }}>
              {i < 2 && <div style={{ position: "absolute", top: 30, left: "calc(50% + 40px)", width: "calc(100% - 80px)", height: 2, background: `${DEEP}20`, zIndex: 0 }} />}
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ width: 60, height: 60, borderRadius: "50%", background: DEEP, color: WHITE, fontSize: 22, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>{s.n}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: DEEP, marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: GRAY, lineHeight: 1.65, maxWidth: 260, margin: "0 auto" }}>{s.desc}</p>
              </div>
            </div>
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
      price: "750",
      annualTotal: "9.000",
      color: BLUE,
      popular: false,
      cta: "Hemen Başla",
      ctaLink: "/login",
      features: ["Sınırsız hasta kartı", "Muayene & tedavi kayıtları", "Aşı takvimi yönetimi", "İlaç stok & SKT takibi", "WhatsApp otomatik hatırlatma", "Reçete oluşturma", "Faturalama", "1 veteriner hesabı"],
    },
    {
      name: "Business",
      price: null,
      color: PURPLE,
      popular: true,
      cta: "Fiyat Al",
      ctaLink: "mailto:pazarlama@marssoft.com.tr?subject=VetPanel Business Fiyat Talebi",
      features: ["Pro plan dahil", "Çoklu veteriner & personel", "Çoklu şube / klinik", "Laboratuvar entegrasyonu", "Batch & seri no takibi", "Gelişmiş raporlar", "Öncelikli destek"],
    },
    {
      name: "Enterprise",
      price: null,
      color: "#F59E0B",
      popular: false,
      cta: "İletişime Geç",
      ctaLink: "mailto:pazarlama@marssoft.com.tr?subject=VetPanel Enterprise Teklif",
      features: ["Business plan dahil", "Hastane / zincir klinik modülleri", "Özel entegrasyonlar & API", "Eğitim + onboarding", "%99.9 uptime SLA"],
    },
  ];

  return (
    <section id="fiyat" style={{ background: WHITE, padding: "80px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${GREEN}15`, borderRadius: 20, padding: "5px 16px", marginBottom: 16 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            <span style={{ fontSize: 12, fontWeight: 700, color: GREEN, letterSpacing: "0.5px" }}>FİYATLANDIRMA</span>
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: DEEP, marginBottom: 12 }}>Kliniğinize Uygun Plan</h2>
          <p style={{ fontSize: 16, color: GRAY }}>7 gün ücretsiz dene, sonra seç.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {plans.map((plan) => (
            <div key={plan.name} style={{ position: "relative" }}>
              {plan.popular && (
                <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: plan.color, color: WHITE, fontSize: 11, fontWeight: 800, padding: "4px 18px", borderRadius: 20, whiteSpace: "nowrap", zIndex: 1 }}>
                  ✦ EN POPÜLER
                </div>
              )}
              <div style={{
                background: WHITE, borderRadius: 20, padding: "32px 24px",
                border: `2px solid ${plan.popular ? plan.color : "#E2E8F0"}`,
                boxShadow: plan.popular ? `0 8px 32px ${plan.color}25` : "0 2px 12px rgba(0,0,0,0.06)",
                height: "100%", display: "flex", flexDirection: "column",
              }}>
                {/* Mascot */}
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: -4 }}>
                  {plan.name === "Pro" ? <SmallVetCat /> : <SmallVetDog />}
                </div>

                <h3 style={{ fontSize: 22, fontWeight: 800, color: DEEP, marginBottom: 8 }}>{plan.name}</h3>

                {plan.price ? (
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 38, fontWeight: 900, color: plan.color, lineHeight: 1.1 }}>
                      {plan.price} <span style={{ fontSize: 16, fontWeight: 500, color: GRAY }}>TL/ay</span>
                    </div>
                    <div style={{ fontSize: 13, color: GRAY, marginTop: 4 }}>Yıllık {plan.annualTotal} TL + KDV</div>
                  </div>
                ) : (
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 30, fontWeight: 900, color: plan.color, lineHeight: 1.2 }}>Fiyat Alınız</div>
                    <div style={{ fontSize: 13, color: GRAY, marginTop: 4 }}>Klinik büyüklüğüne göre</div>
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
                  <a href={plan.ctaLink} style={{ display: "block", textAlign: "center", padding: "13px 0", background: plan.color, color: WHITE, borderRadius: 10, textDecoration: "none", fontSize: 15, fontWeight: 700 }}>
                    {plan.cta} →
                  </a>
                ) : (
                  <Link href={plan.ctaLink} style={{ display: "block", textAlign: "center", padding: "13px 0", background: plan.color, color: WHITE, borderRadius: 10, textDecoration: "none", fontSize: 15, fontWeight: 700 }}>
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
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5L12 3" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {f}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── TESTIMONIALS ──────────────────────────────────────────────────────────────

function Testimonials() {
  const reviews = [
    {
      name: "Dr. Emre K.",
      clinic: "Hayat Veteriner Kliniği, İstanbul",
      text: "Aşı takvimi modülü hayat kurtarıcı. Artık hiçbir hastanın hatırlatmasını kaçırmıyoruz. Müşterilerimiz de WhatsApp mesajlarından çok memnun.",
      stars: 5,
    },
    {
      name: "Dr. Selin A.",
      clinic: "PetCare Veteriner, Ankara",
      text: "İlaç stoku ve SKT takibi özelliği sayesinde ziyan sıfıra indi. Reçete ve fatura modülleri de muhasebecimizin işini çok kolaylaştırdı.",
      stars: 5,
    },
    {
      name: "Dr. Murat Y.",
      clinic: "Can Veteriner Merkezi, İzmir",
      text: "3 şubemiz var. Business planıyla merkezi raporlama yapabiliyoruz. Her şubenin hasta geçmişine anında erişim sağlıyoruz.",
      stars: 5,
    },
  ];

  return (
    <section style={{ background: BG, padding: "80px 24px", position: "relative", overflow: "hidden" }}>
      <MedicalPatternBg color={BLUE} opacity={0.04} />
      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: DEEP, marginBottom: 12 }}>Veterinerler Anlatıyor</h2>
          <p style={{ fontSize: 16, color: GRAY }}>200+ kliniğin güvendiği sistem.</p>
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
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${DEEP}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <StethoscopeIcon size={18} color={DEEP} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: DEEP }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: "#9CA3AF" }}>{r.clinic}</div>
                </div>
              </div>
            </div>
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
    { q: "VetPanel nedir?", a: "VetPanel, veteriner klinikleri için geliştirilmiş bulut tabanlı yönetim yazılımıdır. Hasta kartları, muayene kayıtları, aşı takvimi, ilaç stoku, reçete ve faturalama gibi tüm süreçleri tek panelden yönetmenizi sağlar." },
    { q: "7 günlük deneme nasıl çalışır?", a: "Kayıt olduğunuzda 7 günlük deneme hemen başlar. Kredi kartı girmenize gerek yoktur. Deneme süresince Pro plan özelliklerine tam erişim sağlarsınız." },
    { q: "WhatsApp hatırlatma nasıl çalışır?", a: "Sistem, aşı tarihlerini ve randevuları otomatik olarak takip eder. Belirlediğiniz gün öncesinde WhatsApp üzerinden hasta sahibine otomatik hatırlatma mesajı gönderir." },
    { q: "Mevcut hasta verilerimi aktarabilir miyim?", a: "Evet. Excel veya CSV formatındaki hasta listelerinizi sisteme toplu olarak yükleyebilirsiniz. Teknik destek ekibimiz aktarım sürecinde yardımcı olur." },
    { q: "Birden fazla veteriner kullanabilir mi?", a: "Pro plan tek veteriner hesabı içerir. Business ve Enterprise planlarında çoklu veteriner ve personel hesabı oluşturabilirsiniz." },
    { q: "Veri güvenliği nasıl sağlanıyor?", a: "Tüm veriler şifreli bağlantı (SSL) ile iletilir, günlük yedeklenir ve yedek kopyalar farklı lokasyonlarda tutulur. KVKK uyumlu altyapı kullanılmaktadır." },
  ];

  return (
    <section id="sss" style={{ background: WHITE, padding: "80px 24px" }}>
      <div style={{ maxWidth: 780, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: DEEP, marginBottom: 12 }}>Sık Sorulan Sorular</h2>
          <p style={{ fontSize: 16, color: GRAY }}>Aklınızdaki soruların cevabı burada.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((item, i) => (
            <div key={i} style={{ border: `1px solid ${open === i ? BLUE + "40" : "#E2E8F0"}`, borderRadius: 12, overflow: "hidden", background: open === i ? "#F0F9FF" : WHITE }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{ width: "100%", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
              >
                <span style={{ fontSize: 15, fontWeight: 600, color: DEEP }}>{item.q}</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={DEEP} strokeWidth="2" style={{ flexShrink: 0, transition: "transform 0.2s", transform: open === i ? "rotate(180deg)" : "rotate(0deg)" }}>
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

// ── CTA BANNER ────────────────────────────────────────────────────────────────

function CTABanner() {
  return (
    <section style={{ background: `linear-gradient(135deg, ${DEEP} 0%, #0F6091 100%)`, padding: "72px 24px", position: "relative", overflow: "hidden" }}>
      <MedicalPatternBg color={WHITE} opacity={0.06} />
      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 48 }}>
        <div>
          <h2 style={{ fontSize: 36, fontWeight: 900, color: WHITE, marginBottom: 12, lineHeight: 1.2 }}>
            Kliniğinizi Bugün Dijitalleştirin
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.75)", marginBottom: 28, maxWidth: 480 }}>
            7 gün ücretsiz, kurulum yok, kredi kartı gerekmez. İlk hastanızı dakikalar içinde kaydedin.
          </p>
          <Link href="/login" style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "14px 32px", background: GREEN, color: WHITE,
            borderRadius: 10, textDecoration: "none", fontSize: 16, fontWeight: 700,
            boxShadow: "0 4px 20px rgba(16,185,129,0.4)",
          }}>
            Ücretsiz Başla
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>
        <div style={{ display: "flex", gap: 0, alignItems: "flex-end", opacity: 0.9 }}>
          <div style={{ transform: "translateX(18px) scale(0.88)" }}><VetCatSVG /></div>
          <div style={{ transform: "scale(0.88)" }}><VetDogSVG /></div>
        </div>
      </div>
    </section>
  );
}

// ── FOOTER ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{ background: "#071E34", padding: "48px 24px 28px", position: "relative", overflow: "hidden" }}>
      <MedicalPatternBg color={WHITE} opacity={0.04} />
      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 48, marginBottom: 40 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: BLUE, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <StethoscopeIcon size={16} color="white" />
              </div>
              <span style={{ fontSize: 18, fontWeight: 800, color: WHITE }}>Vet<span style={{ color: BLUE }}>Panel</span></span>
            </div>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, maxWidth: 280 }}>
              Türkiye&apos;nin veteriner klinikleri için geliştirilen akıllı yönetim platformu.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: "0.5px", marginBottom: 16 }}>ÜRÜN</h4>
            {[{ label: "Özellikler", hash: "ozellikler" }, { label: "Fiyatlandırma", hash: "fiyat" }, { label: "SSS", hash: "sss" }].map((l) => (
              <a key={l.label} href={`#${l.hash}`} style={{ display: "block", fontSize: 14, color: "rgba(255,255,255,0.55)", textDecoration: "none", marginBottom: 8 }}>{l.label}</a>
            ))}
          </div>
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: "0.5px", marginBottom: 16 }}>İLETİŞİM</h4>
            <a href="mailto:pazarlama@marssoft.com.tr" style={{ display: "block", fontSize: 14, color: "rgba(255,255,255,0.55)", textDecoration: "none", marginBottom: 8 }}>
              pazarlama@marssoft.com.tr
            </a>
            <Link href="/login" style={{ display: "inline-block", marginTop: 12, padding: "8px 18px", background: BLUE, color: WHITE, borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              Giriş Yap
            </Link>
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", margin: 0 }}>
            © {new Date().getFullYear()} MarsSOFT. Tüm hakları saklıdır.
          </p>
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

export default function VetLandingPage() {
  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        @media (max-width: 768px) {
          .vet-hero-grid { grid-template-columns: 1fr !important; }
          .vet-hero-grid > div:last-child { display: none !important; }
          .vet-stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          .vet-features-grid { grid-template-columns: 1fr !important; }
          .vet-steps-grid { grid-template-columns: 1fr !important; }
          .vet-pricing-grid { grid-template-columns: 1fr !important; }
          .vet-reviews-grid { grid-template-columns: 1fr !important; }
          .vet-footer-grid { grid-template-columns: 1fr !important; }
          .vet-cta-grid { grid-template-columns: 1fr !important; }
          .vet-cta-grid > div:last-child { display: none !important; }
          .vet-nav-links { display: none !important; }
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
