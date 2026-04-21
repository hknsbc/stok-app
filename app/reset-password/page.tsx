"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ResetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }
    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır.");
      return;
    }
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess("Şifreniz başarıyla güncellendi! Giriş sayfasına yönlendiriliyorsunuz...");
    setTimeout(() => router.push("/login"), 3000);
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f0f4ff" }}>
      <div style={{ background: "white", padding: 40, borderRadius: 12, width: 360, boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 28, marginBottom: 4 }}>🔐</div>
          <h1 style={{ fontSize: 22, fontWeight: "bold" }}>Yeni Şifre Belirle</h1>
          <p style={{ fontSize: 13, color: "#888", marginTop: 4 }}>Stok Takip · Marssoft</p>
        </div>

        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", marginBottom: 16, color: "#dc2626", fontSize: 13 }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 14px", marginBottom: 16, color: "#16a34a", fontSize: 13 }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input type="password" placeholder="Yeni Şifre" value={password} onChange={(e) => setPassword(e.target.value)} required
            style={{ padding: 12, border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14, outline: "none" }} />
          <input type="password" placeholder="Yeni Şifre Tekrar" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
            style={{ padding: 12, border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14, outline: "none" }} />
          <button type="submit" disabled={loading}
            style={{ padding: 12, background: "#1a1a2e", color: "white", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
            {loading ? "Lütfen bekleyin..." : "Şifremi Güncelle"}
          </button>
        </form>
      </div>
    </div>
  );
}