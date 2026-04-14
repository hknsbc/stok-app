"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (isRegister) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else alert("Kayıt başarılı! Email onayı gerekebilir.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else router.push("/");
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f5f5f5" }}>
      <div style={{ background: "white", padding: 40, borderRadius: 12, width: 360, boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }}>
        <h1 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 24 }}>
          {isRegister ? "Kayıt Ol" : "Giriş Yap"}
        </h1>
        {error && <p style={{ color: "red", marginBottom: 12 }}>{error}</p>}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: 10, border: "1px solid #ccc", borderRadius: 6 }}
          />
          <input
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: 10, border: "1px solid #ccc", borderRadius: 6 }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{ padding: 12, background: "black", color: "white", borderRadius: 6, border: "none", cursor: "pointer" }}
          >
            {loading ? "Yükleniyor..." : isRegister ? "Kayıt Ol" : "Giriş Yap"}
          </button>
        </form>
        <p style={{ marginTop: 16, textAlign: "center", cursor: "pointer", color: "blue" }}
          onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? "Zaten hesabın var mı? Giriş yap" : "Hesabın yok mu? Kayıt ol"}
        </p>
      </div>
    </div>
  );
}