"use client";
import { useEffect, useState, useCallback } from "react";
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
  LogOut,
  Home,
  User,
  Truck,
  Settings,
  Building2,
  PawPrint,
  AlertTriangle,
  Anchor,
  Wrench,
  Layers,
  Stethoscope,
  Syringe,
  Pill,
  ClipboardList,
  Receipt,
  MessageCircle,
} from "lucide-react";
import { useLang } from "@/lib/LangContext";
import { useMode } from "@/lib/ModeContext";
import Header from "@/components/layout/Header";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [hasBranches, setHasBranches] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLang();
  const { mode, theme } = useMode();

  // Detect mobile and set sidebar default
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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
        .from("profiles").select("is_superadmin, tenant_id").eq("id", user.id).single();
      setIsSuperAdmin(profile?.is_superadmin ?? false);
      if (profile?.tenant_id) {
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

  // Close sidebar on mobile after navigation
  const handleNavClick = useCallback(() => {
    if (isMobile) setSidebarOpen(false);
  }, [isMobile]);

  const navLinkStyle = (active: boolean) => ({
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 12px",
    borderRadius: 8,
    marginBottom: 4,
    background: active ? theme.primary : "transparent",
    color: theme.sidebarText,
    textDecoration: "none",
    fontSize: 14,
    whiteSpace: "nowrap" as const,
  });

  if (!authChecked) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#f5f5f5" }}>
        <div style={{ color: "#888", fontSize: 14 }}>{t.loading}</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f5f5f5", position: "relative" }}>

      {/* ── Mobile backdrop ── */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
            zIndex: 40,
          }}
        />
      )}

      {/* ── Sidebar ── */}
      <div style={{
        width: 240,
        background: theme.sidebar,
        color: theme.sidebarText,
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        // Mobile: fixed overlay; Desktop: static
        ...(isMobile ? {
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          zIndex: 50,
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.28s ease",
        } : {
          position: "relative",
          transform: sidebarOpen ? "translateX(0)" : "translateX(-240px)",
          marginLeft: sidebarOpen ? 0 : -240,
          transition: "transform 0.28s ease, margin-left 0.28s ease",
          overflow: "hidden",
        }),
      }}>
        <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>{theme.logoEmoji}</span>
          <span style={{ fontSize: 16, fontWeight: "bold", whiteSpace: "nowrap" }}>{theme.appName}</span>
        </div>
        <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link key={item.path} href={item.path} onClick={handleNavClick} style={navLinkStyle(isActive)}>
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
          {mode === "marine" && (
            <>
              <Link href="/marine/tekne" onClick={handleNavClick} style={navLinkStyle(pathname.startsWith("/marine/tekne"))}>
                <Anchor size={18} />
                Tekne Kartları
              </Link>
              <Link href="/marine/bakim" onClick={handleNavClick} style={navLinkStyle(pathname.startsWith("/marine/bakim"))}>
                <Wrench size={18} />
                Bakım Kayıtları
              </Link>
              <Link href="/marine/parca" onClick={handleNavClick} style={navLinkStyle(pathname.startsWith("/marine/parca"))}>
                <Layers size={18} />
                Parça Stokları
              </Link>
            </>
          )}
          {mode === "vet" && (
            <>
              <Link href="/vet/hastalar" onClick={handleNavClick} style={navLinkStyle(pathname.startsWith("/vet/hastalar"))}>
                <Stethoscope size={18} />
                Hasta Kartları
              </Link>
              <Link href="/vet/muayene" onClick={handleNavClick} style={navLinkStyle(pathname.startsWith("/vet/muayene"))}>
                <ClipboardList size={18} />
                Muayeneler
              </Link>
              <Link href="/vet/asi" onClick={handleNavClick} style={navLinkStyle(pathname.startsWith("/vet/asi"))}>
                <Syringe size={18} />
                Aşı Takvimi
              </Link>
              <Link href="/vet/stok" onClick={handleNavClick} style={navLinkStyle(pathname.startsWith("/vet/stok"))}>
                <Pill size={18} />
                İlaç Stoku
              </Link>
              <Link href="/vet/fatura" onClick={handleNavClick} style={navLinkStyle(pathname.startsWith("/vet/fatura"))}>
                <Receipt size={18} />
                Faturalar
              </Link>
              <Link href="/vet/mesajlar" onClick={handleNavClick} style={navLinkStyle(pathname.startsWith("/vet/mesajlar"))}>
                <MessageCircle size={18} />
                Mesaj Merkezi
              </Link>
            </>
          )}
          {mode === "pet" && (
            <>
              <Link href="/pet/kart" onClick={handleNavClick} style={navLinkStyle(pathname.startsWith("/pet/kart"))}>
                <PawPrint size={18} />
                Pet Kartları
              </Link>
              <Link href="/pet/skt" onClick={handleNavClick} style={navLinkStyle(pathname === "/pet/skt")}>
                <AlertTriangle size={18} />
                SKT Takibi
              </Link>
            </>
          )}
          {hasBranches && (
            <Link href="/subeler" onClick={handleNavClick} style={navLinkStyle(pathname === "/subeler")}>
              <Building2 size={18} />
              {t.menuSubeler}
            </Link>
          )}
          {isSuperAdmin && (
            <Link href="/admin" onClick={handleNavClick} style={{
              ...navLinkStyle(pathname === "/admin"),
              marginTop: 8,
              borderTop: "1px solid rgba(255,255,255,0.1)",
              background: pathname === "/admin" ? theme.primary : `${theme.primary}26`,
            }}>
              <Settings size={18} />
              {t.menuAdmin}
            </Link>
          )}
        </nav>
        <div style={{ padding: 16, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: theme.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <User size={16} color="white" />
            </div>
            <span style={{ fontSize: 12, color: theme.sidebarText, opacity: 0.7, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {userEmail ?? "Kullanici"}
            </span>
          </div>
          <button onClick={handleLogout} style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "transparent",
            border: "none",
            color: theme.sidebarText,
            opacity: 0.6,
            cursor: "pointer",
            fontSize: 13,
            padding: "6px 0",
          }}>
            <LogOut size={16} />
            {t.logout}
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <Header sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div style={{ flex: 1, overflow: "auto", padding: "16px" }} className="main-content">
          {children}
        </div>
      </div>
    </div>
  );
}
