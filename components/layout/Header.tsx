"use client";
import { Menu, X } from "lucide-react";
import { useMode } from "@/lib/ModeContext";
import { useLang } from "@/lib/LangContext";

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
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
              display: "inline-block", fontSize: 16, fontWeight: 600, color: theme.sidebarText,
              whiteSpace: "nowrap", paddingLeft: "100%",
            }}
          >
            {theme.appTitle}
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
