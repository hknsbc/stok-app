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
  LogOut,
  Home,
  User,
  Truck,
  Settings,
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
  Wallet,
  CalendarCheck,
  Warehouse,
} from "lucide-react";
import { useLang } from "@/lib/LangContext";
import { useMode } from "@/lib/ModeContext";
import Header from "@/components/layout/Header";
import { ParticleField } from "@/components/stok/motion";
import { greeting } from "@/components/stok/greeting";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const WHATSAPP_NUMBER = "905447221935";

// Her sayfa kendi DashboardLayout'unu oluşturduğu için, oturum bilgisi ve
// "bir kez oynat" animasyon bayrakları modül seviyesinde tutulur (sayfa geçişlerinde sıfırlanmaz).
type AuthCache = { email: string | null; userId: string; isSuperAdmin: boolean; tenantId: string | null; companyName: string | null };
let authCache: AuthCache | null = null;
let navIntroPlayed = false;

function WhatsAppIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="white" aria-hidden>
      <path d="M16.004 3C9.374 3 4 8.374 4 15.004c0 2.37.697 4.58 1.903 6.444L4 29l7.74-1.868a11.9 11.9 0 0 0 4.264.78h.005c6.63 0 12.004-5.374 12.004-12.004C28.013 8.28 22.634 3 16.004 3Zm0 21.84a9.78 9.78 0 0 1-4.986-1.37l-.358-.213-3.712.897.906-3.617-.234-.372a9.78 9.78 0 0 1-1.49-5.16c0-5.42 4.41-9.83 9.874-9.83 5.42 0 9.83 4.41 9.83 9.83 0 5.464-4.41 9.835-9.83 9.835Z" />
      <path d="M21.49 18.02c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-1.76-.88-2.91-1.57-4.07-3.56-.31-.53.31-.49.88-1.63.1-.2.05-.37-.05-.52-.1-.15-.47-1.13-.64-1.5-.17-.37-.35-.32-.48-.32-.12 0-.27 0-.42 0-.15 0-.37.05-.56.3-.2.25-.77.75-.77 1.83 0 1.08.78 2.12.89 2.27.1.15 1.63 2.49 3.95 3.4 1.97.78 2.37.63 2.8.59.43-.05 1.39-.56 1.58-1.1.2-.54.2-1 .14-1.1-.06-.1-.23-.16-.48-.28Z" />
    </svg>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [authChecked, setAuthChecked] = useState(authCache !== null);
  const [userEmail, setUserEmail] = useState<string | null>(authCache?.email ?? null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(authCache?.isSuperAdmin ?? false);
  const [userId, setUserId] = useState<string | null>(authCache?.userId ?? null);
  const [tenantId, setTenantId] = useState<string | null>(authCache?.tenantId ?? null);
  const [companyName, setCompanyName] = useState<string | null>(authCache?.companyName ?? null);
  const [welcome, setWelcome] = useState<"off" | "show" | "out">("off");
  const [playNavIntro] = useState(() => !navIntroPlayed);
  const pathname = usePathname();
  const router = useRouter();
  const { t, lang } = useLang();
  const { mode, theme } = useMode();
  const isStok = mode === "stok";

  useEffect(() => { navIntroPlayed = true; }, []);

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
  ];

  useEffect(() => {
    const checkAuth = async () => {
      const { supabase } = await import("@/lib/supabase");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        authCache = null;
        router.replace("/login");
        return;
      }
      setUserEmail(user.email ?? null);
      setUserId(user.id);
      const { data: profile } = await supabase
        .from("profiles").select("is_superadmin, tenant_id, company_name").eq("id", user.id).single();
      setIsSuperAdmin(profile?.is_superadmin ?? false);
      setTenantId(profile?.tenant_id ?? null);
      setCompanyName(profile?.company_name ?? null);
      authCache = {
        email: user.email ?? null, userId: user.id, isSuperAdmin: profile?.is_superadmin ?? false,
        tenantId: profile?.tenant_id ?? null, companyName: profile?.company_name ?? null,
      };
      setAuthChecked(true);

      // Girişte bir kez: kişiye özel karşılama ekranı
      if (mode === "stok") {
        try {
          if (!sessionStorage.getItem("sp_welcome")) {
            sessionStorage.setItem("sp_welcome", "1");
            setWelcome("show");
            setTimeout(() => setWelcome("out"), 2300);
            setTimeout(() => setWelcome("off"), 3000);
          }
        } catch { /* sessionStorage yoksa karşılamayı atla */ }
      }
    };
    checkAuth();
  }, [router, mode]);

  // Kullanım takibi (sadece Stok paneli): hangi sayfaya girildiği
  useEffect(() => {
    if (mode !== "stok" || !userId || !tenantId) return;
    const logPageview = async () => {
      const { supabase } = await import("@/lib/supabase");
      await supabase.from("usage_events").insert({
        tenant_id: tenantId,
        user_id: userId,
        event_type: "pageview",
        path: pathname,
      });
    };
    logPageview();
  }, [pathname, mode, userId, tenantId]);

  // Kullanım takibi: sekme aktifken 60sn'de bir "hala buradayım" sinyali
  useEffect(() => {
    if (mode !== "stok" || !userId || !tenantId) return;
    const sendHeartbeat = async () => {
      if (document.visibilityState !== "visible") return;
      const { supabase } = await import("@/lib/supabase");
      await supabase.from("usage_events").insert({
        tenant_id: tenantId,
        user_id: userId,
        event_type: "heartbeat",
      });
    };
    const interval = setInterval(sendHeartbeat, 60000);
    return () => clearInterval(interval);
  }, [mode, userId, tenantId]);

  const handleLogout = async () => {
    const { supabase } = await import("@/lib/supabase");
    await supabase.auth.signOut();
    authCache = null;
    try { sessionStorage.removeItem("sp_welcome"); } catch { /* yoksay */ }
    router.push("/login");
  };

  // Close sidebar on mobile after navigation
  const handleNavClick = useCallback(() => {
    if (isMobile) setSidebarOpen(false);
  }, [isMobile]);

  const navCls = (active: boolean) => (isStok ? `sp-navitem${active ? " sp-active" : ""}` : undefined);

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

  if (!authChecked && isStok) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, height: "100vh", background: "radial-gradient(ellipse at 30% 20%, #3730a3 0%, #1E1B4B 50%, #0f0d2e 100%)" }}>
        <div className="sp-btn-glow" style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg,#6366F1,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>📦</div>
        <div style={{ width: 120, height: 3, borderRadius: 3, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
          <div className="sp-progress" style={{ height: "100%", background: "linear-gradient(90deg,#6366F1,#06B6D4)", animationDuration: "1.2s" }} />
        </div>
        <div style={{ color: "#A5B4FC", fontSize: 13 }}>{t.loading}</div>
      </div>
    );
  }

  if (!authChecked) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#f5f5f5" }}>
        <div style={{ color: "#888", fontSize: 14 }}>{t.loading}</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: isStok ? "linear-gradient(135deg,#f5f3ff 0%,#f8fafc 55%,#eef2ff 100%)" : "#f5f5f5", position: "relative" }}>

      {/* ── Karşılama ekranı (girişte bir kez) ── */}
      {welcome !== "off" && (
        <div className={`sp-welcome${welcome === "out" ? " sp-out" : ""}`} aria-live="polite">
          <ParticleField color="165,180,252" density={9000} />
          <div className="sp-orb" aria-hidden style={{ position: "absolute", width: 520, height: 520, borderRadius: "50%", top: -180, left: -140, background: "radial-gradient(circle, rgba(99,102,241,0.5), transparent 68%)", filter: "blur(28px)" }} />
          <div className="sp-orb" aria-hidden style={{ position: "absolute", width: 420, height: 420, borderRadius: "50%", bottom: -160, right: -100, background: "radial-gradient(circle, rgba(16,185,129,0.3), transparent 68%)", filter: "blur(28px)", animationDelay: "-7s" }} />
          <div style={{ position: "relative", textAlign: "center", padding: 24, maxWidth: 560 }}>
            <div className="sp-welcome-in sp-btn-glow" style={{ width: 72, height: 72, borderRadius: 20, margin: "0 auto 26px", background: "linear-gradient(135deg,#6366F1,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 40px rgba(99,102,241,0.6)", animationDelay: "0.1s" }}>
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            </div>
            <div className="sp-welcome-in" style={{ animationDelay: "0.35s", fontSize: 18, color: "#A5B4FC", fontWeight: 600, marginBottom: 8 }}>{greeting(lang)}</div>
            <div className="sp-welcome-in" style={{ animationDelay: "0.55s", fontSize: 40, fontWeight: 900, color: "white", letterSpacing: "-1px", lineHeight: 1.15, marginBottom: 12, wordBreak: "break-word" }}>
              <span className="sp-gradient-text" style={{ backgroundImage: "linear-gradient(100deg,#fff,#C7D2FE,#67E8F9,#fff)" }}>
                {companyName ?? userEmail?.split("@")[0] ?? ""}
              </span>
            </div>
            <div className="sp-welcome-in" style={{ animationDelay: "0.8s", fontSize: 15, color: "rgba(255,255,255,0.6)", marginBottom: 34 }}>
              {lang === "tr" ? "Deponuz hazırlanıyor…" : "Preparing your warehouse…"}
            </div>
            <div className="sp-welcome-in" style={{ animationDelay: "0.9s", width: 220, height: 4, borderRadius: 4, background: "rgba(255,255,255,0.12)", overflow: "hidden", margin: "0 auto" }}>
              <div className="sp-progress" style={{ height: "100%", background: "linear-gradient(90deg,#6366F1,#06B6D4,#10B981)", animationDelay: "0.9s" }} />
            </div>
          </div>
        </div>
      )}

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
        background: isStok ? "linear-gradient(185deg, #1a1a2e 0%, #1E1B4B 55%, #251f5e 100%)" : theme.sidebar,
        boxShadow: isStok ? "4px 0 28px rgba(30,27,75,0.25)" : undefined,
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
        <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>{theme.logoEmoji}</span>
            <span style={{ fontSize: 17, fontWeight: "bold", whiteSpace: "nowrap" }}>{theme.appName}</span>
          </div>
          {companyName && (
            <div style={{
              marginTop: 6, fontSize: 12, color: theme.sidebarText, opacity: 0.75,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              🏢 {companyName}
            </div>
          )}
        </div>
        <nav className={isStok ? (playNavIntro ? "sp-nav-stagger" : "sp-nav-still") : undefined} style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link key={item.path} href={item.path} onClick={handleNavClick} className={navCls(isActive)} style={navLinkStyle(isActive)}>
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
          {mode === "stok" && (
            <>
              <Link href="/stok/kasa" onClick={handleNavClick} className={navCls(pathname === "/stok/kasa")} style={navLinkStyle(pathname === "/stok/kasa")}>
                <Wallet size={18} />
                Kasa
              </Link>
              <Link href="/stok/depolar" onClick={handleNavClick} className={navCls(pathname.startsWith("/stok/depolar"))} style={navLinkStyle(pathname.startsWith("/stok/depolar"))}>
                <Warehouse size={18} />
                Depolar
              </Link>
              <Link href="/stok/hareketler" onClick={handleNavClick} className={navCls(pathname === "/stok/hareketler")} style={navLinkStyle(pathname === "/stok/hareketler")}>
                <ClipboardList size={18} />
                Hareketler
              </Link>
              <Link href="/ayarlar" onClick={handleNavClick} className={navCls(pathname === "/ayarlar")} style={navLinkStyle(pathname === "/ayarlar")}>
                <Settings size={18} />
                Ayarlar
              </Link>
            </>
          )}
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
              <Link href="/pet/kasa" onClick={handleNavClick} style={navLinkStyle(pathname === "/pet/kasa")}>
                <Wallet size={18} />
                Kasa
              </Link>
              <Link href="/pet/gunsonu" onClick={handleNavClick} style={navLinkStyle(pathname === "/pet/gunsonu")}>
                <CalendarCheck size={18} />
                Gün Sonu
              </Link>
            </>
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
            <div style={{ position: "relative", width: 34, height: 34, borderRadius: "50%", background: isStok ? "linear-gradient(135deg,#6366F1,#8B5CF6)" : theme.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: isStok ? "0 0 0 2px rgba(165,180,252,0.35)" : undefined, color: "white", fontWeight: 800, fontSize: 14 }}>
              {isStok && userEmail ? userEmail[0].toUpperCase() : <User size={16} color="white" />}
              {isStok && <span className="sp-live" style={{ position: "absolute", right: -1, bottom: -1, width: 10, height: 10, borderRadius: "50%", background: "#10B981", border: "2px solid #1E1B4B" }} />}
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
          <div key={pathname} className={isStok ? "sp-page" : undefined}>
            {children}
          </div>
        </div>
      </div>

      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noopener noreferrer"
        title="WhatsApp ile bize yazın"
        style={{
          position: "fixed", bottom: 20, right: 20, width: 56, height: 56, borderRadius: "50%",
          background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 14px rgba(0,0,0,0.3)", zIndex: 60, textDecoration: "none",
        }}
      >
        <WhatsAppIcon />
      </a>
    </div>
  );
}
