"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLang } from "@/lib/LangContext";
import { useMode } from "@/lib/ModeContext";

// ── Pet branding colours ────────────────────────────────────────────────────
const NAVY = "#1E3A8A";
const RED   = "#EF4444";
const ORANGE = "#F97316";
const BG    = "#F8FAFC";

// ── Inline SVGs (reused from PetLandingPage, kept self-contained) ───────────
function PawPrint({ size = 28, color = NAVY, opacity = 1 }: { size?: number; color?: string; opacity?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill={color} style={{ opacity }} aria-hidden>
      <ellipse cx="50" cy="67" rx="27" ry="24" />
      <ellipse cx="25" cy="38" rx="11" ry="14" />
      <ellipse cx="44" cy="27" rx="10" ry="13" />
      <ellipse cx="63" cy="27" rx="10" ry="13" />
      <ellipse cx="79" cy="38" rx="11" ry="14" />
    </svg>
  );
}

function PawPatternBg() {
  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} aria-hidden>
      <defs>
        <pattern id="loginPaw" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          <g opacity={0.07} fill="white" transform="translate(4,6) rotate(-15,50,55)">
            <ellipse cx="50" cy="67" rx="27" ry="24" />
            <ellipse cx="25" cy="38" rx="11" ry="14" />
            <ellipse cx="44" cy="27" rx="10" ry="13" />
            <ellipse cx="63" cy="27" rx="10" ry="13" />
            <ellipse cx="79" cy="38" rx="11" ry="14" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#loginPaw)" />
    </svg>
  );
}

function CatSVG() {
  return (
    <svg viewBox="0 0 180 220" fill="none" style={{ width: 150, filter: "drop-shadow(0 16px 32px rgba(0,0,0,0.25))" }}>
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
      <line x1="30" y1="101" x2="68" y2="106" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
      <line x1="28" y1="107" x2="68" y2="108" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
      <line x1="96" y1="106" x2="134" y2="101" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
      <line x1="96" y1="108" x2="136" y2="107" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
      <path d="M47,130 Q82,144 117,130" stroke={NAVY} strokeWidth="9" strokeLinecap="round" fill="none"/>
      <circle cx="82" cy="139" r="7" fill={RED}/>
      <ellipse cx="62" cy="207" rx="18" ry="12" fill="#FB923C"/>
      <ellipse cx="102" cy="207" rx="18" ry="12" fill="#FB923C"/>
    </svg>
  );
}

function DogSVG() {
  return (
    <svg viewBox="0 0 180 220" fill="none" style={{ width: 150, filter: "drop-shadow(0 16px 32px rgba(0,0,0,0.2))" }}>
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

// ── Component ────────────────────────────────────────────────────────────────

export default function Login() {
  const router = useRouter();
  const { lang, setLang, t } = useLang();
  const { mode, theme } = useMode();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"temel" | "profesyonel">("temel");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const isPet = mode === "pet";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (isForgotPassword) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) { setError(error.message); setLoading(false); return; }
      setSuccess(t.resetSent);
      setLoading(false);
      return;
    }

    if (isRegister) {
      const isPro = selectedPlan === "profesyonel";
      const isPetTrial = isPet;
      const { data: signUpData, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { plan: selectedPlan, has_branches: isPro } },
      });
      if (error) { setError(error.message); setLoading(false); return; }
      if (signUpData.user) {
        const trialExpiry = new Date();
        trialExpiry.setDate(trialExpiry.getDate() + 7);
        await supabase.from("profiles").update({
          plan: selectedPlan,
          is_active: isPetTrial ? true : false,
          ...(isPetTrial ? { subscription_expires_at: trialExpiry.toISOString() } : {}),
        }).eq("id", signUpData.user.id);
        if (isPro) {
          const { data: profile } = await supabase.from("profiles").select("tenant_id").eq("id", signUpData.user.id).single();
          if (profile?.tenant_id) {
            await supabase.from("tenants").update({ has_branches: true }).eq("id", profile.tenant_id);
          }
        }
      }
      if (isPetTrial) {
        const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
        if (!signInErr && signInData.user) { router.push("/"); return; }
      }
      alert(t.successRegister);
      setLoading(false);
      return;
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) { setError(t.errorLogin); setLoading(false); return; }

    const user = data.user;
    if (!user) { setError(t.errorFailed); setLoading(false); return; }

    const { data: profile } = await supabase.from("profiles").select("is_active, subscription_expires_at").eq("id", user.id).single();
    if (profile) {
      if (profile.is_active === false) {
        await supabase.auth.signOut();
        setError(t.errorInactive);
        setLoading(false);
        return;
      }
      if (profile.subscription_expires_at) {
        const expires = new Date(profile.subscription_expires_at);
        if (expires < new Date()) {
          await supabase.auth.signOut();
          setError(t.errorExpired);
          setLoading(false);
          return;
        }
      }
    }

    router.push("/");
    setLoading(false);
  };

  const resetFlow = () => { setError(""); setSuccess(""); };

  // ── PET LEFT PANEL ────────────────────────────────────────────────────────
  const PetLeftPanel = () => (
    <div style={{
      flex: 1,
      background: `linear-gradient(145deg, ${NAVY} 0%, #1a3270 60%, #162a5e 100%)`,
      display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
      padding: "48px 40px", position: "relative", overflow: "hidden",
    }}>
      <PawPatternBg />

      {/* Back to landing */}
      <Link href="/" style={{
        position: "absolute", top: 24, left: 24,
        display: "flex", alignItems: "center", gap: 6,
        color: "rgba(255,255,255,0.65)", textDecoration: "none", fontSize: 13, fontWeight: 500,
        zIndex: 2,
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        Ana Sayfa
      </Link>

      <div style={{ position: "relative", zIndex: 1, textAlign: "center", width: "100%" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 32 }}>
          <PawPrint size={32} color={ORANGE} />
          <span style={{ fontSize: 26, fontWeight: 900, color: "white", letterSpacing: "-0.5px" }}>
            Pet<span style={{ color: ORANGE }}>Panel</span>
          </span>
        </div>

        {/* Headline */}
        <h2 style={{ fontSize: 28, fontWeight: 800, color: "white", lineHeight: 1.25, marginBottom: 10 }}>
          Petshop&apos;unuzu<br />
          <span style={{ color: ORANGE }}>Kolayca Yönetin</span>
        </h2>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", maxWidth: 300, margin: "0 auto 36px", lineHeight: 1.6 }}>
          Stok, SKT takibi, kasa ve pet kartlarını tek panelden kontrol edin.
        </p>

        {/* Illustrations */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 0, marginBottom: 36 }}>
          <div style={{ transform: "translateX(12px) translateY(4px)" }}><CatSVG /></div>
          <div style={{ transform: "translateX(-12px)" }}><DogSVG /></div>
        </div>

        {/* Feature pills */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          {[
            { icon: "🔔", label: "SKT Takibi" },
            { icon: "🛒", label: "Kasa & Satış" },
            { icon: "🐾", label: "Pet Kartları" },
          ].map((f) => (
            <div key={f.label} style={{
              background: "rgba(255,255,255,0.12)", backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 20, padding: "6px 14px",
              display: "flex", alignItems: "center", gap: 6,
              color: "white", fontSize: 13, fontWeight: 500,
            }}>
              <span>{f.icon}</span> {f.label}
            </div>
          ))}
        </div>

        {/* Trial badge */}
        <div style={{
          marginTop: 28,
          display: "inline-flex", alignItems: "center", gap: 8,
          background: `${ORANGE}25`, border: `1px solid ${ORANGE}60`,
          borderRadius: 12, padding: "10px 20px",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          <span style={{ fontSize: 13, color: ORANGE, fontWeight: 700 }}>7 gün ücretsiz · Kredi kartı gerekmez</span>
        </div>
      </div>
    </div>
  );

  // ── DEFAULT LEFT PANEL (non-pet) ─────────────────────────────────────────
  const DefaultLeftPanel = () => (
    <div style={{
      flex: 1,
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
      padding: 48, position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "rgba(99,102,241,0.15)", top: -50, left: -50, animation: "pulse 4s ease-in-out infinite" }} />
      <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", background: "rgba(16,185,129,0.1)", bottom: 100, right: -30, animation: "pulse 5s ease-in-out infinite 1s" }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/login-illustration.png" alt="Stok Yönetim" style={{ width: "100%", maxWidth: 480, borderRadius: 16, position: "relative", zIndex: 1 }} />
      <div style={{ textAlign: "center", marginTop: 32, position: "relative", zIndex: 1 }}>
        <h2 style={{ fontSize: 26, fontWeight: "bold", color: "white", marginBottom: 12 }}>{t.heroTitle}</h2>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", maxWidth: 360 }}>{t.heroDesc}</p>
      </div>
      <div style={{ display: "flex", gap: 24, marginTop: 32, position: "relative", zIndex: 1 }}>
        {[t.feature1, t.feature2, t.feature3].map((item) => (
          <div key={item} style={{ background: "rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 16px", color: "white", fontSize: 13, backdropFilter: "blur(10px)" }}>{item}</div>
        ))}
      </div>
    </div>
  );

  // ── FORM PANEL ───────────────────────────────────────────────────────────
  const accentColor = isPet ? ORANGE : "#1a1a2e";
  const accentLink  = isPet ? ORANGE : "#6366f1";

  return (
    <div style={{ display: "flex", height: "100vh", background: isPet ? BG : "#f0f4ff" }}>

      {/* Left */}
      {isPet ? <PetLeftPanel /> : <DefaultLeftPanel />}

      {/* Right: Form */}
      <div style={{
        width: 480, display: "flex", justifyContent: "center", alignItems: "center",
        padding: 48,
        background: isPet ? "white" : "white",
        borderLeft: isPet ? `1px solid #E2E8F0` : "none",
      }}>
        <div style={{ width: "100%", maxWidth: 360 }}>

          {/* Lang selector */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24, gap: 8 }}>
            <button onClick={() => setLang("tr")} style={{ padding: "4px 12px", borderRadius: 6, border: `2px solid ${lang === "tr" ? accentColor : "#e5e7eb"}`, background: lang === "tr" ? accentColor : "white", color: lang === "tr" ? "white" : "#888", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>🇹🇷 TR</button>
            <button onClick={() => setLang("en")} style={{ padding: "4px 12px", borderRadius: 6, border: `2px solid ${lang === "en" ? accentColor : "#e5e7eb"}`, background: lang === "en" ? accentColor : "white", color: lang === "en" ? "white" : "#888", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>🇬🇧 EN</button>
          </div>

          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            {isPet ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 6 }}>
                <PawPrint size={28} color={ORANGE} />
                <span style={{ fontSize: 22, fontWeight: 900, color: NAVY, letterSpacing: "-0.5px" }}>
                  Pet<span style={{ color: ORANGE }}>Panel</span>
                </span>
              </div>
            ) : (
              <div style={{ fontSize: 36, marginBottom: 8 }}>{theme.logoEmoji}</div>
            )}
            {!isPet && <h1 style={{ fontSize: 24, fontWeight: "bold", color: "#1a1a2e" }}>{theme.appTitle}</h1>}
            <p style={{ fontSize: 13, color: "#9CA3AF", marginTop: 4 }}>{t.loginSubtitle}</p>
          </div>

          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: NAVY }}>
            {isForgotPassword ? t.forgotPasswordTitle : isRegister ? t.signUp : t.signIn}
          </h2>

          {isForgotPassword && (
            <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 16 }}>{t.forgotPasswordDesc}</p>
          )}

          {error && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px", marginBottom: 16, color: "#DC2626", fontSize: 13 }}>{error}</div>
          )}
          {success && (
            <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 8, padding: "10px 14px", marginBottom: 16, color: "#16A34A", fontSize: 13 }}>{success}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              type="email" placeholder={t.emailLabel} value={email}
              onChange={(e) => setEmail(e.target.value)} required
              style={{ padding: 12, border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 14, outline: "none", fontFamily: "inherit" }}
            />
            {!isForgotPassword && (
              <input
                type="password" placeholder={t.passwordLabel} value={password}
                onChange={(e) => setPassword(e.target.value)} required
                style={{ padding: 12, border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 14, outline: "none", fontFamily: "inherit" }}
              />
            )}

            {/* Pet trial banner */}
            {isRegister && !isForgotPassword && isPet && (
              <div style={{
                background: "linear-gradient(135deg, #FFF7ED, #FEF3C7)",
                border: `2px solid ${ORANGE}`, borderRadius: 12, padding: "14px 16px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <PawPrint size={18} color={ORANGE} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#C2410C" }}>7 Gün Ücretsiz Deneyin!</span>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: "#92400E", lineHeight: 1.5 }}>
                  Kayıt olun, hemen aktif olsun. Kredi kartı gerekmez.
                </p>
              </div>
            )}

            {/* Non-pet plan selector */}
            {isRegister && !isForgotPassword && !isPet && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <p style={{ margin: 0, fontSize: 12, color: "#888", fontWeight: 600 }}>{t.selectPlan}</p>
                <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", border: `2px solid ${selectedPlan === "temel" ? "#6366f1" : "#e5e7eb"}`, borderRadius: 8, cursor: "pointer" }}>
                  <input type="radio" name="plan" value="temel" checked={selectedPlan === "temel"} onChange={() => setSelectedPlan("temel")} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1e1b4b" }}>{t.basicPlan}</div>
                    <div style={{ fontSize: 11, color: "#888" }}>{t.basicPrice}</div>
                  </div>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", border: `2px solid ${selectedPlan === "profesyonel" ? "#10b981" : "#e5e7eb"}`, borderRadius: 8, cursor: "pointer" }}>
                  <input type="radio" name="plan" value="profesyonel" checked={selectedPlan === "profesyonel"} onChange={() => setSelectedPlan("profesyonel")} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1e1b4b" }}>{t.proPlan}</div>
                    <div style={{ fontSize: 11, color: "#10b981" }}>{t.proPrice}</div>
                  </div>
                </label>
              </div>
            )}

            <button
              type="submit" disabled={loading}
              style={{
                padding: "13px 0",
                background: isRegister && isPet ? ORANGE : (isPet ? NAVY : "#1a1a2e"),
                color: "white", borderRadius: 8, border: "none", cursor: loading ? "not-allowed" : "pointer",
                fontSize: 15, fontWeight: 700, marginTop: 4,
                opacity: loading ? 0.7 : 1,
                boxShadow: isPet ? `0 4px 14px ${isRegister ? ORANGE : NAVY}40` : "none",
              }}
            >
              {loading
                ? t.loginLoading
                : isForgotPassword
                  ? t.sendResetLink
                  : isRegister
                    ? (isPet ? "7 Gün Ücretsiz Başla →" : t.signUp)
                    : t.signIn}
            </button>
          </form>

          {!isForgotPassword && !isRegister && (
            <p
              style={{ marginTop: 12, textAlign: "right", cursor: "pointer", color: accentLink, fontSize: 13, fontWeight: 500 }}
              onClick={() => { setIsForgotPassword(true); resetFlow(); }}
            >
              {t.forgotPassword}
            </p>
          )}

          {isForgotPassword ? (
            <p
              style={{ marginTop: 16, textAlign: "center", cursor: "pointer", color: accentLink, fontSize: 13 }}
              onClick={() => { setIsForgotPassword(false); resetFlow(); }}
            >
              {t.backToLogin}
            </p>
          ) : (
            <p
              style={{ marginTop: 16, textAlign: "center", cursor: "pointer", color: accentLink, fontSize: 13, fontWeight: 500 }}
              onClick={() => { setIsRegister(!isRegister); resetFlow(); }}
            >
              {isRegister ? t.hasAccount : t.noAccount}
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
