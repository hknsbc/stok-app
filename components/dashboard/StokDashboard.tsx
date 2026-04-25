"use client";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { useMode } from "@/lib/ModeContext";

export default function StokDashboard() {
  const { theme } = useMode();
  return (
    <DashboardLayout>
      <div style={{ padding: 32, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>{theme.logoEmoji}</div>
        <h2 style={{ fontSize: 22, fontWeight: "bold", marginBottom: 8 }}>
          {theme.appTitle}
        </h2>
        <p style={{ color: "#888", marginBottom: 24 }}>
          Mevcut stok panelinize devam etmek için ana sayfaya gidin.
        </p>
        <Link
          href="/"
          style={{
            display: "inline-block",
            padding: "10px 28px",
            background: "#6366f1",
            color: "white",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          Ana Panele Git →
        </Link>
      </div>
    </DashboardLayout>
  );
}
