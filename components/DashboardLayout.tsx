"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  FileText,
  CreditCard,
  Shield,
  Menu,
  X,
  LogOut,
  Home,
  User,
  Truck,
  Settings,
  Building2,
} from "lucide-react";
import { useLang } from "@/lib/LangContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [hasBranches, setHasBranches] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { lang, setLang, t } = useLang();

  const menuItems = [
    { label: t.menuHome, path: "/", icon: Home },
    { label: t.menuCari, path: "/cari", icon: Users },
    { label: t.menuStok, path: "/stok", icon: Package },
    { label: t.menuAlislar, path: "/alislar", icon: Truck },
    { label: t.menuSatislar, path: "/satislar", icon: BarChart3 },
    { label: t.menuYeniSatis, path: "/yeni-satis", icon: ShoppingCart },
    { label: t.menuRaporlar, path: "/raporlar", icon: FileText },
    { label: t.menuAbonelik, path: "/abonelik", icon: CreditCard },
    { label: t.menuLisans, path: "/lisans", icon: Shield },
  ];

  useEffect(() => {
    const checkAuth = async () => {
      const { supabase } = await import("@/lib/supabase");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      setUserEmail(user.email ?? null);
      const { data: profile } = await supabase
        .from("profiles").select("is_superadmin, tenant_id, plan").eq("id", user.id).single();
      setIsSuperAdmin(profile?.is_superadmin ?? false);
      const isPro = profile?.plan === "profesyonel";
      if (isPro) {
        setHasBranches(true);
      } else if (profile?.tenant_id) {
        const { data: tenant } = await supabase
          .from("tenants").select("has_branches").eq("id", profile.tenant_id).single();
        setHasBranches(tenant?.has_branches ?? false);
      }
      setAuthChecked(true);
    };
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    const { supabase } = await import("@/lib/supabase");
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (!authChecked) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#f5f5f5" }}>
        <div style={{ color: "#888", fontSize: 14 }}>{t.loading}</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f5f5f5" }}>
      <div style={{
        width: sidebarOpen ? 240 : 0,
        background: "#1a1a2e",
        color: "white",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.3s",
        overflow: "hidden",
        flexShrink: 0,
      }}>
        <div style={{ padding: "20px 16px", borderBottom: "1px solid #333", display: "flex", alignItems: "center", gap: 10 }}>
          <Package size={24} color="#6366f1" />
          <span style={{ fontSize: 18, fontWeight: "bold" }}>Stok Takip</span>
        </div>
        <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link key={item.path} href={item.path} style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                borderRadius: 8,
                marginBottom: 4,
                background: isActive ? "#6366f1" : "transparent",
                color: "white",
                textDecoration: "none",
                fontSize: 14,
                whiteSpace: "nowrap",
              }}>
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
          {hasBranches && (
            <Link href="/subeler" style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 12px", borderRadius: 8, marginBottom: 4,
              background: pathname === "/subeler" ? "#6366f1" : "transparent",
              color: "white", textDecoration: "none", fontSize: 14, whiteSpace: "nowrap",
            }}>
              <Building2 size={18} />
              {t.menuSubeler}
            </Link>
          )}
          {isSuperAdmin && (
            <Link href="/admin" style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 12px", borderRadius: 8, marginBottom: 4, marginTop: 8,
              background: pathname === "/admin" ? "#6366f1" : "rgba(99,102,241,0.15)",
              color: "white", textDecoration: "none", fontSize: 14, whiteSpace: "nowrap",
              borderTop: "1px solid #333",
            }}>
              <Settings size={18} />
              {t.menuAdmin}
            </Link>
          )}
        </nav>
        <div style={{ padding: 16, borderTop: "1px solid #333" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <User size={16} />
            </div>
            <span style={{ fontSize: 12, color: "#ccc", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {userEmail ?? "Kullanici"}
            </span>
          </div>
          <button onClick={handleLogout} style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "transparent",
            border: "none",
            color: "#aaa",
            cursor: "pointer",
            fontSize: 13,
            padding: "6px 0",
          }}>
            <LogOut size={16} />
            {t.logout}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <div style={{
          height: 60,
          background: "white",
          borderBottom: "1px solid #eee",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "none", border: "none", cursor: "pointer" }}>
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <span style={{ fontSize: 16, fontWeight: 600 }}>{t.sysTitle}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setLang("tr")} style={{ padding: "4px 10px", borderRadius: 6, border: `2px solid ${lang === "tr" ? "#1a1a2e" : "#e5e7eb"}`, background: lang === "tr" ? "#1a1a2e" : "white", color: lang === "tr" ? "white" : "#888", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>🇹🇷 TR</button>
              <button onClick={() => setLang("en")} style={{ padding: "4px 10px", borderRadius: 6, border: `2px solid ${lang === "en" ? "#1a1a2e" : "#e5e7eb"}`, background: lang === "en" ? "#1a1a2e" : "white", color: lang === "en" ? "white" : "#888", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>🇬🇧 EN</button>
            </div>
            <span style={{ fontSize: 13, color: "#aaa", fontWeight: 500 }}>Marssoft</span>
          </div>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
