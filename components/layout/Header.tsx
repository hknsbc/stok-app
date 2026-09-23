"use client";
import { Menu, X } from "lucide-react";
import { useMode } from "@/lib/ModeContext";
import { useLang } from "@/lib/LangContext";

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

function ForkliftIcon() {
  return (
    <svg width="28" height="20" viewBox="0 0 34 24" style={{ flexShrink: 0 }} aria-hidden>
      {/* gövde */}
      <rect x="14" y="10" width="14" height="9" rx="3" fill="#FBBF24" stroke="#92400E" strokeWidth="0.8" />
      {/* kabin çerçevesi */}
      <path d="M16 10V5h8" stroke="#92400E" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* sürücü gözü (şirin detay) */}
      <circle cx="20" cy="13.5" r="1.6" fill="#FFF7ED" stroke="#92400E" strokeWidth="0.6" />
      <circle cx="20.4" cy="13.5" r="0.7" fill="#451A03" />
      {/* direk (mast) */}
      <rect x="10" y="2" width="2.2" height="18" rx="1" fill="#78716C" />
      {/* çatal */}
      <rect x="2" y="16" width="9" height="2" rx="0.8" fill="#A8A29E" />
      {/* kaldırılmış koli */}
      <rect className="forklift-box" x="1" y="6" width="9" height="8" rx="1.4" fill="#DEB887" stroke="#92400E" strokeWidth="1.1" />
      <path className="forklift-box" d="M1 10h9" stroke="#92400E" strokeWidth="1" />
      {/* tekerlekler */}
      <circle cx="18" cy="20.5" r="2.5" fill="#292524" />
      <circle cx="18" cy="20.5" r="1" fill="#D6D3D1" />
      <circle cx="26" cy="20.5" r="2.5" fill="#292524" />
      <circle cx="26" cy="20.5" r="1" fill="#D6D3D1" />
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
      <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0, flex: 1 }}>
        <button
          onClick={onToggleSidebar}
          style={{ background: "none", border: "none", cursor: "pointer", flexShrink: 0, color: theme.sidebarText }}
          aria-label="Menüyü aç/kapat"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <span
          style={{
            fontSize: 16, fontWeight: 600, color: theme.sidebarText, whiteSpace: "nowrap",
            overflow: "hidden", textOverflow: "ellipsis", flexShrink: 1, minWidth: 40,
          }}
        >
          {theme.appTitle}
        </span>
        <div style={{ overflow: "hidden", minWidth: 0, flex: 1 }}>
          <span
            className="header-marquee"
            style={{
              display: "inline-flex", alignItems: "center", gap: 14, fontSize: 18,
              whiteSpace: "nowrap", paddingLeft: "100%",
            }}
          >
            <ForkliftIcon />
            <span>📦</span>
            <span>📦</span>
            <ForkliftIcon />
            <span>📦</span>
            <span>📦</span>
            <ForkliftIcon />
            <span>📦</span>
            <span>📦</span>
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
