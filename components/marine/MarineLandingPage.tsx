"use client";
import { useState } from "react";
import Link from "next/link";

const CYAN  = "#06B6D4";
const DEEP  = "#0C2340";
const TEAL  = "#0E7490";
const GREEN = "#10B981";
const BG    = "#F0F9FF";
const WHITE = "#FFFFFF";
const GRAY  = "#4B5563";

// ── SVG ASSETS ────────────────────────────────────────────────────────────────

function AnchorIcon({ size = 28, color = CYAN }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="3"/>
      <line x1="12" y1="22" x2="12" y2="8"/>
      <path d="M5 12H2a10 10 0 0 0 20 0h-3"/>
    </svg>
  );
}

function WavePatternBg({ color = CYAN, opacity = 0.06 }: { color?: string; opacity?: number }) {
  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} aria-hidden>
      <defs>
        <pattern id="marineWave" x="0" y="0" width="120" height="40" patternUnits="userSpaceOnUse">
          <path d="M0 20 Q15 8 30 20 Q45 32 60 20 Q75 8 90 20 Q105 32 120 20" stroke={color} strokeWidth="1.2" fill="none" opacity={opacity}/>
          <path d="M0 32 Q15 20 30 32 Q45 44 60 32 Q75 20 90 32 Q105 44 120 32" stroke={color} strokeWidth="0.8" fill="none" opacity={opacity * 0.6}/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#marineWave)" />
    </svg>
  );
}

function BoatIllustration() {
  return (
    <svg viewBox="0 0 380 280" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", maxWidth: 380 }}>
      {/* Ocean waves */}
      <path d="M0 220 Q40 208 80 220 Q120 232 160 220 Q200 208 240 220 Q280 232 320 220 Q360 208 380 220 L380 280 L0 280 Z" fill={CYAN} opacity="0.18"/>
      <path d="M0 234 Q50 222 100 234 Q150 246 200 234 Q250 222 300 234 Q350 246 380 234 L380 280 L0 280 Z" fill={CYAN} opacity="0.25"/>
      <path d="M0 248 Q60 236 120 248 Q180 260 240 248 Q300 236 380 248 L380 280 L0 280 Z" fill={TEAL} opacity="0.5"/>
      <path d="M0 260 L380 260 L380 280 L0 280 Z" fill={DEEP} opacity="0.4"/>

      {/* Yacht hull */}
      <path d="M60 218 Q80 230 200 230 Q320 230 340 218 L320 198 L80 198 Z" fill={WHITE}/>
      <path d="M60 218 Q80 230 200 230 Q320 230 340 218 L320 198 L80 198 Z" stroke="#CBD5E1" strokeWidth="1.5" fill="none"/>
      {/* Hull stripe */}
      <path d="M80 212 Q200 220 320 212" stroke={CYAN} strokeWidth="4" strokeLinecap="round"/>

      {/* Deck / cabin */}
      <rect x="130" y="168" width="140" height="32" rx="6" fill={DEEP}/>
      <rect x="135" y="173" width="130" height="22" rx="4" fill="#1E3A5F"/>
      {/* Windows */}
      {[145, 175, 215, 245].map((x, i) => (
        <rect key={i} x={x} y="178" width="24" height="14" rx="3" fill={CYAN} opacity="0.7"/>
      ))}

      {/* Mast */}
      <rect x="198" y="60" width="4" height="138" rx="2" fill={DEEP}/>
      {/* Boom */}
      <rect x="130" y="150" width="120" height="3" rx="1.5" fill={TEAL}/>

      {/* Main sail */}
      <path d="M200 65 L320 150 L200 150 Z" fill={WHITE} stroke="#CBD5E1" strokeWidth="1"/>
      <path d="M202 75 L310 150 L202 150 Z" fill={CYAN} opacity="0.12"/>

      {/* Jib */}
      <path d="M200 90 L140 150 L200 150 Z" fill={WHITE} stroke="#CBD5E1" strokeWidth="1"/>
      <path d="M200 95 L144 150 L200 150 Z" fill={TEAL} opacity="0.1"/>

      {/* Flag */}
      <path d="M202 60 L230 68 L202 76 Z" fill={CYAN}/>

      {/* Radar/antenna */}
      <line x1="270" y1="168" x2="270" y2="140" stroke="#94A3B8" strokeWidth="2"/>
      <circle cx="270" cy="138" r="5" fill="#64748B"/>

      {/* Anchor hanging */}
      <line x1="90" y1="218" x2="90" y2="240" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3 2"/>
      <circle cx="90" cy="244" r="4" fill={TEAL} opacity="0.6"/>

      {/* Water reflection */}
      <ellipse cx="200" cy="262" rx="120" ry="6" fill={CYAN} opacity="0.15"/>

      {/* Small buoy */}
      <circle cx="330" cy="236" r="8" fill={CYAN}/>
      <rect x="328" y="224" width="4" height="14" rx="2" fill="#64748B"/>

      {/* Sun on horizon */}
      <circle cx="60" cy="80" r="22" fill="#FEF3C7" opacity="0.9"/>
      <circle cx="60" cy="80" r="16" fill="#FDE68A"/>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => (
        <line key={i}
          x1={60 + 20 * Math.cos(a * Math.PI / 180)}
          y1={80 + 20 * Math.sin(a * Math.PI / 180)}
          x2={60 + 28 * Math.cos(a * Math.PI / 180)}
          y2={80 + 28 * Math.sin(a * Math.PI / 180)}
          stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round"/>
      ))}

      {/* Seagulls */}
      <path d="M280 70 Q285 66 290 70" stroke="#94A3B8" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M295 58 Q301 54 307 58" stroke="#94A3B8" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M310 78 Q315 74 320 78" stroke="#94A3B8" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

function DashboardPreviewSVG() {
  return (
    <svg viewBox="0 0 360 220" fill="none" style={{ width: "100%", maxWidth: 360, borderRadius: 14, filter: "drop-shadow(0 20px 40px rgba(6,182,212,0.18))" }}>
      <rect x="0" y="0" width="360" height="220" rx="12" fill="white" stroke="#E2E8F0" strokeWidth="1.5"/>
      <rect x="0" y="0" width="360" height="34" rx="12" fill={DEEP}/>
      <rect x="0" y="24" width="360" height="10" fill={DEEP}/>
      <circle cx="16" cy="17" r="5" fill="#EF4444"/>
      <circle cx="30" cy="17" r="5" fill="#F59E0B"/>
      <circle cx="44" cy="17" r="5" fill={GREEN}/>
      <rect x="60" y="11" width="200" height="12" rx="6" fill="rgba(255,255,255,0.1)"/>
      {/* Sidebar */}
      <rect x="0" y="34" width="72" height="186" fill={DEEP}/>
      {/* Sidebar logo */}
      <circle cx="36" cy="52" r="12" fill={CYAN} opacity="0.3"/>
      <text x="36" y="57" textAnchor="middle" fontSize="12" fill={CYAN}>⚓</text>
      {[72, 94, 116, 138, 160].map((y, i) => (
        <rect key={i} x="8" y={y} width={i === 1 ? 56 : 48} height="14" rx="4" fill={i === 1 ? CYAN : "rgba(255,255,255,0.12)"}/>
      ))}
      {/* Stats row */}
      {[80, 154, 228].map((x, i) => (
        <g key={i}>
          <rect x={x} y="42" width="62" height="44" rx="8" fill={["#ECFEFF", "#F0FDF4", "#FFF7ED"][i]}/>
          <rect x={x+6} y="50" width="30" height="8" rx="3" fill={[CYAN, GREEN, "#F59E0B"][i]} opacity="0.7"/>
          <rect x={x+6} y="63" width="20" height="14" rx="3" fill={[CYAN, GREEN, "#F59E0B"][i]}/>
        </g>
      ))}
      {/* Chart area */}
      <rect x="80" y="96" width="135" height="80" rx="8" fill="#F8FAFC"/>
      {[96,110,124,138,152,166,180].map((x, i) => {
        const h = [30, 45, 55, 70, 50, 80, 65][i];
        return <rect key={i} x={x} y={176 - h} width="10" height={h} rx="3" fill={CYAN} opacity={0.35 + i * 0.09}/>;
      })}
      {/* Wave line */}
      <path d="M86 150 Q100 135 114 145 Q128 155 142 132 Q156 109 170 125 Q184 141 198 118" stroke={TEAL} strokeWidth="2" fill="none" opacity="0.6"/>
      {/* Service table */}
      <rect x="224" y="96" width="128" height="80" rx="8" fill="#F8FAFC"/>
      <rect x="230" y="104" width="116" height="10" rx="3" fill="#E2E8F0"/>
      {[120,135,150,165].map((y, i) => (
        <g key={i}>
          <rect x="230" y={y} width="50" height="7" rx="2" fill="#E2E8F0"/>
          <rect x="290" y={y} width="30" height="7" rx="2" fill={i % 2 === 0 ? "#ECFEFF" : "#DCFCE7"}/>
          <rect x="328" y={y} width="14" height="7" rx="2" fill="#E2E8F0"/>
        </g>
      ))}
      <rect x="72" y="186" width="288" height="34" fill="#F8FAFC"/>
      <rect x="80" y="194" width="60" height="10" rx="4" fill="#E2E8F0"/>
      <rect x="152" y="194" width="40" height="10" rx="4" fill="#E2E8F0"/>
    </svg>
  );
}

// ── NAVBAR ────────────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 100, background: WHITE, borderBottom: "1px solid #CFFAFE", boxShadow: "0 1px 8px rgba(6,182,212,0.08)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: DEEP, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AnchorIcon size={18} color={CYAN} />
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, color: DEEP, letterSpacing: "-0.5px" }}>Marine<span style={{ color: CYAN }}>Panel</span></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <a href="#ozellikler" style={{ padding: "8px 14px", color: GRAY, textDecoration: "none", fontSize: 14, fontWeight: 500 }}>Özellikler</a>
          <a href="#fiyat"      style={{ padding: "8px 14px", color: GRAY, textDecoration: "none", fontSize: 14, fontWeight: 500 }}>Fiyatlandırma</a>
          <a href="#sss"        style={{ padding: "8px 14px", color: GRAY, textDecoration: "none", fontSize: 14, fontWeight: 500 }}>SSS</a>
          <Link href="/login" style={{ padding: "8px 16px", color: DEEP, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>Giriş Yap</Link>
          <Link href="/login" style={{ padding: "9px 20px", background: CYAN, color: WHITE, borderRadius: 8, textDecoration: "none", fontSize: 14, fontWeight: 700 }}>
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
    <section style={{ background: `linear-gradient(135deg, ${BG} 0%, #ECFEFF 60%)`, position: "relative", overflow: "hidden", padding: "80px 24px 60px" }}>
      <WavePatternBg color={CYAN} opacity={0.07} />
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center", position: "relative", zIndex: 1 }}>
        {/* Left copy */}
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${CYAN}18`, border: `1px solid ${CYAN}40`, borderRadius: 20, padding: "5px 14px", marginBottom: 20 }}>
            <AnchorIcon size={13} color={CYAN} />
            <span style={{ fontSize: 12, fontWeight: 700, color: TEAL, letterSpacing: "0.5px" }}>TÜRKİYE&apos;NİN DENİZCİLİK YÖNETİM YAZILIMI</span>
          </div>

          <h1 style={{ fontSize: 48, fontWeight: 900, color: DEEP, lineHeight: 1.12, marginBottom: 20, letterSpacing: "-1px" }}>
            Marina ve Tekne<br />
            <span style={{ color: CYAN }}>Yönetimini</span><br />
            Dijitalleştirin
          </h1>

          <p style={{ fontSize: 18, color: GRAY, lineHeight: 1.65, marginBottom: 32, maxWidth: 460 }}>
            Tekne kayıtlarından periyodik bakıma, parça stokundan servis faturasına kadar tüm marina işlemlerinizi tek panelden yönetin.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 32 }}>
            <Link href="/login" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 28px", background: CYAN, color: WHITE,
              borderRadius: 10, textDecoration: "none", fontSize: 16, fontWeight: 700,
              boxShadow: "0 4px 16px rgba(6,182,212,0.35)",
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

        {/* Right: Illustrations */}
        <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
          <div style={{ position: "relative", zIndex: 2 }}>
            <DashboardPreviewSVG />
          </div>
          <div style={{ position: "relative", zIndex: 1, marginTop: -20 }}>
            <BoatIllustration />
          </div>

          {/* Floating badge 1 */}
          <div style={{ position: "absolute", top: 10, left: -24, background: WHITE, borderRadius: 12, padding: "10px 16px", boxShadow: "0 4px 20px rgba(6,182,212,0.14)", display: "flex", alignItems: "center", gap: 8, zIndex: 3 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#ECFEFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={CYAN} strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: DEEP }}>128 Bakım</div>
              <div style={{ fontSize: 11, color: "#6B7280" }}>bu ay tamamlandı</div>
            </div>
          </div>

          {/* Floating badge 2 */}
          <div style={{ position: "absolute", bottom: 80, right: -16, background: WHITE, borderRadius: 12, padding: "10px 16px", boxShadow: "0 4px 20px rgba(6,182,212,0.14)", display: "flex", alignItems: "center", gap: 8, zIndex: 3 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#ECFEFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AnchorIcon size={18} color={CYAN} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: DEEP }}>340 Tekne</div>
              <div style={{ fontSize: 11, color: "#6B7280" }}>aktif kayıt</div>
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
    { value: "500+",  label: "Marina & Tersane" },
    { value: "5.000+", label: "Kayıtlı Tekne" },
    { value: "30.000+", label: "Servis Kaydı" },
    { value: "7/24",  label: "Teknik Destek" },
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
      icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={CYAN} strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
      title: "Tekne / Yat Kartı",
      desc: "Her tekneye ait marka, model, motor bilgisi, belgeler ve tüm servis geçmişini tek ekranda görün. Müşteri bağlantısı otomatik kurulur.",
      bg: "#ECFEFF", border: "#67E8F9",
    },
    {
      icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
      title: "Periyodik Bakım Takibi",
      desc: "Motor saati, takvim veya deniz mili bazlı bakım planları oluşturun. Zamanı gelen bakım için otomatik hatırlatma alın.",
      bg: "#F0FDF4", border: "#86EFAC",
    },
    {
      icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
      title: "Parça & Aksesuar Stoku",
      desc: "Denizcilik parçaları, yağlar, filtreler ve aksesuarları barkodla takip edin. Kritik stok seviyesinde anında uyarı alın.",
      bg: "#FFFBEB", border: "#FCD34D",
    },
    {
      icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
      title: "Servis Emri & Fatura",
      desc: "İş emri açın, kullanılan parçaları ve işçiliği kaydedin. Tek tıkla fatura oluşturun, müşteriye PDF olarak gönderin.",
      bg: "#F5F3FF", border: "#C4B5FD",
    },
  ];

  return (
    <section id="ozellikler" style={{ background: WHITE, padding: "80px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${CYAN}12`, borderRadius: 20, padding: "5px 16px", marginBottom: 16 }}>
            <AnchorIcon size={13} color={CYAN} />
            <span style={{ fontSize: 12, fontWeight: 700, color: TEAL, letterSpacing: "0.5px" }}>ÖZELLİKLER</span>
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: DEEP, marginBottom: 12 }}>Marina & Tekne Yönetiminin Tam Çözümü</h2>
          <p style={{ fontSize: 16, color: GRAY, maxWidth: 520, margin: "0 auto" }}>
            Servis kaydından faturaya, stoktan bakım takibine kadar her şey tek panelde.
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
    { n: "1", title: "Kaydolun", desc: "E-posta ve şifrenizle 30 saniyede hesap açın. Kurulum, sunucu ya da teknik bilgi gerekmez." },
    { n: "2", title: "Tekneleri & Müşterileri Ekleyin", desc: "Tekne ve müşteri bilgilerini girin ya da Excel&apos;den toplu yükleyin. Belge yükleme desteği mevcuttur." },
    { n: "3", title: "İlk Servis Emrini Açın", desc: "Tekneyi seçin, yapılan işlemi ve kullanılan parçaları girin, faturayı bir tıkla oluşturun." },
  ];
  return (
    <section style={{ background: BG, padding: "80px 24px", position: "relative", overflow: "hidden" }}>
      <WavePatternBg color={CYAN} opacity={0.05} />
      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: DEEP, marginBottom: 12 }}>3 Adımda Başlayın</h2>
          <p style={{ fontSize: 16, color: GRAY }}>Teknik bilgi gerekmez. Kurulum yok.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
          {steps.map((s, i) => (
            <div key={s.n} style={{ textAlign: "center", position: "relative" }}>
              {i < 2 && <div style={{ position: "absolute", top: 30, left: "calc(50% + 40px)", width: "calc(100% - 80px)", height: 2, background: `${DEEP}15`, zIndex: 0 }} />}
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ width: 60, height: 60, borderRadius: "50%", background: CYAN, color: WHITE, fontSize: 22, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>{s.n}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: DEEP, marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: GRAY, lineHeight: 1.65, maxWidth: 260, margin: "0 auto" }} dangerouslySetInnerHTML={{ __html: s.desc }} />
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
      price: "990",
      note: "TL + KDV / ay",
      color: CYAN,
      popular: false,
      cta: "Hemen Başla",
      ctaHref: "/login",
      features: ["Sınırsız tekne kaydı", "Servis emri & fatura", "Parça stoku takibi", "Periyodik bakım planları", "Müşteri & cari yönetimi", "Temel raporlar", "1 kullanıcı"],
    },
    {
      name: "Business",
      price: "2.490",
      note: "TL + KDV / ay",
      color: TEAL,
      popular: true,
      cta: "Hemen Başla",
      ctaHref: "/login",
      features: ["Pro plan dahil", "Çoklu kullanıcı (10'a kadar)", "Çoklu liman / marina", "Gelişmiş raporlar & analizler", "REST API erişimi", "Toplu veri import / export", "Öncelikli destek"],
    },
    {
      name: "Enterprise",
      price: null,
      note: "Şirketinize özel",
      color: "#F59E0B",
      popular: false,
      cta: "Fiyat Al",
      ctaHref: "mailto:pazarlama@marssoft.com.tr?subject=MarinePanel Enterprise Fiyat Talebi",
      features: ["Business plan dahil", "Sınırsız kullanıcı & marina", "Özel modüller & entegrasyonlar", "Muhasebe & ERP entegrasyonu", "Eğitim + onboarding", "SLA garantisi"],
    },
  ];

  return (
    <section id="fiyat" style={{ background: WHITE, padding: "80px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${CYAN}12`, borderRadius: 20, padding: "5px 16px", marginBottom: 16 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            <span style={{ fontSize: 12, fontWeight: 700, color: TEAL, letterSpacing: "0.5px" }}>FİYATLANDIRMA</span>
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: DEEP, marginBottom: 12 }}>İşletmenize Uygun Plan</h2>
          <p style={{ fontSize: 16, color: GRAY }}>14 gün ücretsiz dene, beğenirsen devam et.</p>
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
                <h3 style={{ fontSize: 22, fontWeight: 800, color: DEEP, marginBottom: 8 }}>{plan.name}</h3>
                {plan.price ? (
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                      <span style={{ fontSize: 42, fontWeight: 900, color: plan.color, letterSpacing: "-1px" }}>{plan.price}</span>
                    </div>
                    <div style={{ fontSize: 13, color: GRAY, marginTop: 2 }}>{plan.note}</div>
                  </div>
                ) : (
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 30, fontWeight: 900, color: plan.color }}>Fiyat Alınız</div>
                    <div style={{ fontSize: 13, color: GRAY, marginTop: 4 }}>{plan.note}</div>
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
                {plan.ctaHref.startsWith("mailto:") ? (
                  <a href={plan.ctaHref} style={{ display: "block", textAlign: "center", padding: "13px 0", background: plan.color, color: WHITE, borderRadius: 10, textDecoration: "none", fontSize: 15, fontWeight: 700 }}>
                    {plan.cta} →
                  </a>
                ) : (
                  <Link href={plan.ctaHref} style={{ display: "block", textAlign: "center", padding: "13px 0", background: plan.color, color: WHITE, borderRadius: 10, textDecoration: "none", fontSize: 15, fontWeight: 700 }}>
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
      name: "Murat K.",
      co: "Ege Marina, Bodrum",
      text: "130 teknenin bakım takvimini kağıtta yönetiyorduk. MarinePanel&apos;e geçince hem hiçbir servis kaçırmaz olduk hem de müşteri memnuniyeti arttı.",
      stars: 5,
    },
    {
      name: "Sercan Ö.",
      co: "BlueSea Tekne Servisi, İzmir",
      text: "Parça stoğu ve servis emri entegrasyonu mükemmel. Fatura da otomatik oluşuyor, muhasebeye gönderiyoruz. Çok zaman kazandırdı.",
      stars: 5,
    },
    {
      name: "Aslı D.",
      co: "Deniz Ekspertiz, Antalya",
      text: "Tekne geçmişini müşteriyle paylaşmak artık çok kolay. PDF rapor özelliği sayesinde profesyonel görünüyoruz.",
      stars: 5,
    },
  ];

  return (
    <section style={{ background: BG, padding: "80px 24px", position: "relative", overflow: "hidden" }}>
      <WavePatternBg color={CYAN} opacity={0.05} />
      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: DEEP, marginBottom: 12 }}>Denizciler Anlatıyor</h2>
          <p style={{ fontSize: 16, color: GRAY }}>500+ marina ve tekne servisinin güvendiği sistem.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {reviews.map((r) => (
            <div key={r.name} style={{ background: WHITE, borderRadius: 16, padding: 28, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", gap: 2, marginBottom: 16 }}>
                {Array.from({ length: r.stars }).map((_, i) => (
                  <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#FBBF24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                ))}
              </div>
              <p style={{ fontSize: 15, color: GRAY, lineHeight: 1.7, marginBottom: 20, fontStyle: "italic" }}>&ldquo;{r.text}&rdquo;</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${CYAN}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AnchorIcon size={18} color={CYAN} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: DEEP }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: "#9CA3AF" }}>{r.co}</div>
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
    { q: "MarinePanel nedir?", a: "MarinePanel, marinalar, tekne servisleri ve su sporları işletmeleri için geliştirilmiş bulut tabanlı yönetim yazılımıdır. Tekne kayıtlarından periyodik bakıma, parça stokundan servis faturasına kadar tüm operasyonlarınızı tek panelden yürütebilirsiniz." },
    { q: "14 günlük deneme nasıl çalışır?", a: "Kayıt olduğunuzda 14 günlük deneme hemen başlar. Kredi kartı girmenize gerek yoktur. Deneme süresince seçtiğiniz plana göre tüm özelliklere erişirsiniz." },
    { q: "Mevcut tekne ve müşteri verilerimi nasıl aktarabilirim?", a: "Excel veya CSV formatındaki tekne, müşteri ve servis geçmişi verilerinizi sisteme toplu olarak yükleyebilirsiniz. Teknik destek ekibimiz aktarım sürecinde ücretsiz yardımcı olur." },
    { q: "Birden fazla marina veya lokasyon kullanılabilir mi?", a: "Pro plan tek lokasyon içerir. Business planında 10 kullanıcıya ve çoklu marina/lokasyona destek verilir. Enterprise planında ise kullanıcı ve lokasyon sayısı sınırsızdır." },
    { q: "Tekne belgeleri (ruhsat, sigorta vb.) sisteme yüklenebilir mi?", a: "Evet. Her tekne kartına PDF, görsel ve diğer formatlarda belge yükleyebilirsiniz. Belge son geçerlilik tarihi için otomatik hatırlatma alabilirsiniz." },
    { q: "Aboneliğimi istediğim zaman iptal edebilir miyim?", a: "Evet. Aylık planlarda bir sonraki fatura dönemi başlamadan iptal etmeniz yeterlidir. Kalan süre için ücret iadesi yapılmaz; ancak iptal tarihine kadar sistemi kullanmaya devam edersiniz." },
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
            <div key={i} style={{ border: `1px solid ${open === i ? CYAN + "50" : "#E2E8F0"}`, borderRadius: 12, overflow: "hidden", background: open === i ? BG : WHITE }}>
              <button onClick={() => setOpen(open === i ? null : i)} style={{ width: "100%", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
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
    <section style={{ background: `linear-gradient(135deg, ${DEEP} 0%, #0A3D5C 100%)`, padding: "72px 24px", position: "relative", overflow: "hidden" }}>
      <WavePatternBg color={WHITE} opacity={0.05} />
      <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 48 }}>
        <div>
          <h2 style={{ fontSize: 36, fontWeight: 900, color: WHITE, marginBottom: 12, lineHeight: 1.2 }}>
            Marinanızı Bugün Dijitalleştirin
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.72)", marginBottom: 28, maxWidth: 480 }}>
            14 gün ücretsiz, kurulum yok, kredi kartı gerekmez. Dakikalar içinde ilk teknenizi kaydedin.
          </p>
          <Link href="/login" style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "14px 32px", background: CYAN, color: WHITE,
            borderRadius: 10, textDecoration: "none", fontSize: 16, fontWeight: 700,
            boxShadow: "0 4px 20px rgba(6,182,212,0.45)",
          }}>
            Ücretsiz Başla
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>
        <div style={{ opacity: 0.9 }}>
          <BoatIllustration />
        </div>
      </div>
    </section>
  );
}

// ── FOOTER ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{ background: "#06111D", padding: "48px 24px 28px", position: "relative", overflow: "hidden" }}>
      <WavePatternBg color={WHITE} opacity={0.04} />
      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 48, marginBottom: 40 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: DEEP, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${CYAN}40` }}>
                <AnchorIcon size={16} color={CYAN} />
              </div>
              <span style={{ fontSize: 18, fontWeight: 800, color: WHITE }}>Marine<span style={{ color: CYAN }}>Panel</span></span>
            </div>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, maxWidth: 280 }}>
              Türkiye&apos;nin marina ve tekne servis işletmeleri için geliştirilen akıllı yönetim platformu.
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
            <Link href="/login" style={{ display: "inline-block", marginTop: 12, padding: "8px 18px", background: CYAN, color: WHITE, borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
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

export default function MarineLandingPage() {
  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        @media (max-width: 768px) {
          .marine-hero-grid { grid-template-columns: 1fr !important; }
          .marine-hero-grid > div:last-child { display: none !important; }
          .marine-3col { grid-template-columns: 1fr !important; }
          .marine-2col { grid-template-columns: 1fr !important; }
          .marine-cta-grid { grid-template-columns: 1fr !important; }
          .marine-cta-grid > div:last-child { display: none !important; }
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
