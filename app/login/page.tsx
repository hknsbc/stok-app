"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/LangContext";

export default function Login() {
  const router = useRouter();
  const { lang, setLang, t } = useLang();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"temel" | "profesyonel">("temel");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
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
      const { data: signUpData, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { plan: selectedPlan, has_branches: isPro } },
      });
      if (error) { setError(error.message); setLoading(false); return; }
      if (signUpData.user) {
        await supabase.from("profiles").update({
          plan: selectedPlan,
          is_active: false,
        }).eq("id", signUpData.user.id);
        if (isPro) {
          const { data: profile } = await supabase.from("profiles").select("tenant_id").eq("id", signUpData.user.id).single();
          if (profile?.tenant_id) {
            await supabase.from("tenants").update({ has_branches: true }).eq("id", profile.tenant_id);
          }
        }
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

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f0f4ff" }}>
      <div style={{
        flex: 1,
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
        padding: 48, position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "rgba(99,102,241,0.15)", top: -50, left: -50, animation: "pulse 4s ease-in-out infinite" }} />
        <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", background: "rgba(16,185,129,0.1)", bottom: 100, right: -30, animation: "pulse 5s ease-in-out infinite 1s" }} />
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

      <div style={{ width: 480, display: "flex", justifyContent: "center", alignItems: "center", padding: 48, background: "white" }}>
        <div style={{ width: "100%", maxWidth: 360 }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24, gap: 8 }}>
            <button onClick={() => setLang("tr")} style={{ padding: "4px 12px", borderRadius: 6, border: `2px solid ${lang === "tr" ? "#1a1a2e" : "#e5e7eb"}`, background: lang === "tr" ? "#1a1a2e" : "white", color: lang === "tr" ? "white" : "#888", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>🇹🇷 TR</button>
            <button onClick={() => setLang("en")} style={{ padding: "4px 12px", borderRadius: 6, border: `2px solid ${lang === "en" ? "#1a1a2e" : "#e5e7eb"}`, background: lang === "en" ? "#1a1a2e" : "white", color: lang === "en" ? "white" : "#888", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>🇬🇧 EN</button>
          </div>

          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📦</div>
            <h1 style={{ fontSize: 24, fontWeight: "bold", color: "#1a1a2e" }}>{t.loginTitle}</h1>
            <p style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{t.loginSubtitle}</p>
          </div>

          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: "#1a1a2e" }}>
            {isForgotPassword ? t.forgotPasswordTitle : isRegister ? t.signUp : t.signIn}
          </h2>

          {isForgotPassword && (
            <p style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>{t.forgotPasswordDesc}</p>
          )}

          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", marginBottom: 16, color: "#dc2626", fontSize: 13 }}>{error}</div>
          )}

          {success && (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 14px", marginBottom: 16, color: "#16a34a", fontSize: 13 }}>{success}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input type="email" placeholder={t.emailLabel} value={email} onChange={(e) => setEmail(e.target.value)} required
              style={{ padding: 12, border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14, outline: "none" }} />

            {!isForgotPassword && (
              <input type="password" placeholder={t.passwordLabel} value={password} onChange={(e) => setPassword(e.target.value)} required
                style={{ padding: 12, border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14, outline: "none" }} />
            )}

            {isRegister && !isForgotPassword && (
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

            <button type="submit" disabled={loading}
              style={{ padding: 12, background: "#1a1a2e", color: "white", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, marginTop: 4 }}>
              {loading ? t.loginLoading : isForgotPassword ? t.sendResetLink : isRegister ? t.signUp : t.signIn}
            </button>
          </form>

          {!isForgotPassword && !isRegister && (
            <p style={{ marginTop: 12, textAlign: "right", cursor: "pointer", color: "#6366f1", fontSize: 13 }}
              onClick={() => { setIsForgotPassword(true); setError(""); setSuccess(""); }}>
              {t.forgotPassword}
            </p>
          )}

          {isForgotPassword ? (
            <p style={{ marginTop: 16, textAlign: "center", cursor: "pointer", color: "#6366f1", fontSize: 13 }}
              onClick={() => { setIsForgotPassword(false); setError(""); setSuccess(""); }}>
              {t.backToLogin}
            </p>
          ) : (
            <p style={{ marginTop: 16, textAlign: "center", cursor: "pointer", color: "#6366f1", fontSize: 13 }}
              onClick={() => { setIsRegister(!isRegister); setError(""); setSuccess(""); }}>
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
