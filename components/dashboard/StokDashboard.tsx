"use client";
// StokDashboard — placeholder that delegates to the existing stok system at app/page.tsx
// The real stok dashboard lives at the root route (/) and remains completely untouched.
// This component exists only so DashboardPage can import a named component for the stok mode.
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";

export default function StokDashboard() {
  return (
    <DashboardLayout>
      <div style={{ padding: 32, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
        <h2 style={{ fontSize: 22, fontWeight: "bold", marginBottom: 8 }}>
          Stok Yönetim Sistemi
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
