"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"temel" | "profesyonel">("temel");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");

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
        }).eq("id", signUpData.user.id);
        if (isPro) {
          const { data: profile } = await supabase
            .from("profiles").select("tenant_id").eq("id", signUpData.user.id).single();
          if (profile?.tenant_id) {
            await supabase.from("tenants").update({ has_branches: true }).eq("id", profile.tenant_id);
          }
        }
      }
      alert("Kayıt başarılı! E-posta onayı gerekebilir.");
      setLoading(false);
      return;
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError("E-posta veya şifre hatalı.");
      setLoading(false);
      return;
    }

    const user = data.user;
    if (!user) { setError("Giris basarisiz."); setLoading(false); return; }

    // Profil kontrolleri
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_active, subscription_expires_at")
      .eq("id", user.id)
      .single();

    if (profile) {
      if (profile.is_active === false) {
        await supabase.auth.signOut();
        setError("Hesabınız askıya alınmıştır. Lütfen destek ile iletişime geçin.");
        setLoading(false);
        return;
      }

      if (profile.subscription_expires_at) {
        const expires = new Date(profile.subscription_expires_at);
        if (expires < new Date()) {
          await supabase.auth.signOut();
          setError("Abonelik süreniz dolmuştur. Lütfen aboneliğinizi yenileyin.");
          setLoading(false);
          return;
        }
      }
    }

    router.push("/");
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f5f5f5" }}>
      <div style={{ background: "white", padding: 40, borderRadius: 12, width: 360, boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 28, marginBottom: 4 }}>📦</div>
          <h1 style={{ fontSize: 22, fontWeight: "bold" }}>Stok Takip</h1>
          <p style={{ fontSize: 13, color: "#888", marginTop: 4 }}>by Marssoft</p>
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>
          {isRegister ? "Kayıt Ol" : "Giriş Yap"}
        </h2>

        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", marginBottom: 16, color: "#dc2626", fontSize: 13 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="email"
            placeholder="E-posta"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8, fontSize: 14 }}
          />
          <input
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8, fontSize: 14 }}
          />
          {isRegister && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <p style={{ margin: 0, fontSize: 12, color: "#888", fontWeight: 600 }}>Plan Seçin</p>
              <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", border: `2px solid ${selectedPlan === "temel" ? "#6366f1" : "#e5e7eb"}`, borderRadius: 8, cursor: "pointer" }}>
                <input
                  type="radio"
                  name="plan"
                  value="temel"
                  checked={selectedPlan === "temel"}
                  onChange={() => setSelectedPlan("temel")}
                  style={{ cursor: "pointer" }}
                />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1e1b4b" }}>Temel Plan</div>
                  <div style={{ fontSize: 11, color: "#888" }}>2.500 TL/Ay</div>
                </div>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", border: `2px solid ${selectedPlan === "profesyonel" ? "#10b981" : "#e5e7eb"}`, borderRadius: 8, cursor: "pointer" }}>
                <input
                  type="radio"
                  name="plan"
                  value="profesyonel"
                  checked={selectedPlan === "profesyonel"}
                  onChange={() => setSelectedPlan("profesyonel")}
                  style={{ cursor: "pointer" }}
                />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1e1b4b" }}>Profesyonel Plan</div>
                  <div style={{ fontSize: 11, color: "#10b981" }}>Fiyat Teklifi · Şube Yönetimi dahil</div>
                </div>
              </label>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{ padding: 12, background: "#1a1a2e", color: "white", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600 }}
          >
            {loading ? "Lütfen bekleyin..." : isRegister ? "Kayıt Ol" : "Giriş Yap"}
          </button>
        </form>

        <p style={{ marginTop: 16, textAlign: "center", cursor: "pointer", color: "#6366f1", fontSize: 13 }}
          onClick={() => { setIsRegister(!isRegister); setError(""); }}>
          {isRegister ? "Zaten hesabın var mı? Giriş yap" : "Hesabın yok mu? Kayıt ol"}
        </p>
      </div>
    </div>
  );
}
