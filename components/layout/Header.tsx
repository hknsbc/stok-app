"use client";
import { Menu, X } from "lucide-react";
import { useMode } from "@/lib/ModeContext";
import { useLang } from "@/lib/LangContext";

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

function ForkliftIcon({ color }: { color: string }) {
  return (
    <svg width="28" height="20" viewBox="0 0 34 24" style={{ flexShrink: 0 }} aria-hidden>
      {/* gövde */}
      <rect x="14" y="10" width="14" height="9" rx="2" fill={color} opacity="0.9" />
      {/* kabin çerçevesi */}
      <path d="M16 10V5h8" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* direk (mast) */}
      <rect x="10" y="2" width="2.2" height="18" fill={color} />
      {/* çatal */}
      <rect x="2" y="16" width="9" height="2" fill={color} />
      {/* kaldırılmış koli */}
      <rect className="forklift-box" x="1" y="6" width="9" height="8" rx="1" fill={color} opacity="0.55" stroke={color} strokeWidth="1.3" />
      {/* tekerlekler */}
      <circle cx="18" cy="20.5" r="2.3" fill={color} />
      <circle cx="26" cy="20.5" r="2.3" fill={color} />
    </svg>
  );
}

function VanIcon({ color }: { color: string }) {
  return (
    <svg width="30" height="18" viewBox="0 0 34 22" style={{ flexShrink: 0 }} aria-hidden>
      {/* kargo kasası */}
      <rect x="0" y="4" width="22" height="10" rx="2" fill={color} opacity="0.9" />
      {/* kabin */}
      <rect x="20" y="7" width="10" height="7" rx="2" fill={color} opacity="0.9" />
      {/* ön cam */}
      <rect x="23" y="8.5" width="5" height="3.5" rx="0.6" fill="white" opacity="0.35" />
      {/* tampon hattı */}
      <rect x="0" y="13.5" width="32" height="1.8" rx="0.9" fill={color} opacity="0.9" />
      {/* tekerlekler */}
      <circle cx="7" cy="17" r="2.4" fill={color} />
      <circle cx="25" cy="17" r="2.4" fill={color} />
    </svg>
  );
}

export default function Header({ sidebarOpen, onToggleSidebar }: HeaderProps) {
  const { theme } = useMode();
  const { lang, setLang } = useLang();

  return (
    <div
      style={{
        height: 60,
        background: theme.sidebar,
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 12px",
        flexShrink: 0,
        gap: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0, flex: 1 }}>
        <button
          onClick={onToggleSidebar}
          style={{ background: "none", border: "none", cursor: "pointer", flexShrink: 0, color: theme.sidebarText }}
          aria-label="Menüyü aç/kapat"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div style={{ overflow: "hidden", minWidth: 0, flex: 1 }}>
          <span
            className="header-marquee"
            style={{
              display: "inline-flex", alignItems: "center", gap: 10, fontSize: 16, fontWeight: 600,
              color: theme.sidebarText, whiteSpace: "nowrap", paddingLeft: "100%",
            }}
          >
            <ForkliftIcon color={theme.sidebarText} />
            <span>{theme.appTitle}</span>
            <VanIcon color={theme.sidebarText} />
            <span>{theme.appTitle}</span>
            <ForkliftIcon color={theme.sidebarText} />
            <span>{theme.appTitle}</span>
            <VanIcon color={theme.sidebarText} />
          </span>
        </div>
      </div>

      <style>{`
        @keyframes header-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .header-marquee {
          animation: header-marquee 14s linear infinite;
        }
        @keyframes forklift-box-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1.5px); }
        }
        .forklift-box {
          animation: forklift-box-bob 1.6s ease-in-out infinite;
          transform-origin: center;
        }
      `}</style>

      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => setLang("tr")}
            style={{
              padding: "4px 10px", borderRadius: 6,
              border: `2px solid ${lang === "tr" ? theme.primary : "rgba(255,255,255,0.2)"}`,
              background: lang === "tr" ? theme.primary : "transparent",
              color: lang === "tr" ? "white" : theme.sidebarText,
              fontSize: 12, cursor: "pointer", fontWeight: 600,
            }}
          >
            🇹🇷 TR
          </button>
          <button
            onClick={() => setLang("en")}
            style={{
              padding: "4px 10px", borderRadius: 6,
              border: `2px solid ${lang === "en" ? theme.primary : "rgba(255,255,255,0.2)"}`,
              background: lang === "en" ? theme.primary : "transparent",
              color: lang === "en" ? "white" : theme.sidebarText,
              fontSize: 12, cursor: "pointer", fontWeight: 600,
            }}
          >
            🇬🇧 EN
          </button>
        </div>
        <span className="hide-mobile" style={{ fontSize: 13, color: theme.sidebarText, opacity: 0.6, fontWeight: 500 }}>Marssoft</span>
      </div>
    </div>
  );
}
