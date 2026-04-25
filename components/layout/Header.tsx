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
        background: "white",
        borderBottom: "1px solid #eee",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button
          onClick={onToggleSidebar}
          style={{ background: "none", border: "none", cursor: "pointer" }}
          aria-label="Menüyü aç/kapat"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <span style={{ fontSize: 16, fontWeight: 600, color: "#1e1b4b" }}>
          {theme.appTitle}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => setLang("tr")}
            style={{
              padding: "4px 10px", borderRadius: 6,
              border: `2px solid ${lang === "tr" ? theme.primary : "#e5e7eb"}`,
              background: lang === "tr" ? theme.primary : "white",
              color: lang === "tr" ? "white" : "#888",
              fontSize: 12, cursor: "pointer", fontWeight: 600,
            }}
          >
            🇹🇷 TR
          </button>
          <button
            onClick={() => setLang("en")}
            style={{
              padding: "4px 10px", borderRadius: 6,
              border: `2px solid ${lang === "en" ? theme.primary : "#e5e7eb"}`,
              background: lang === "en" ? theme.primary : "white",
              color: lang === "en" ? "white" : "#888",
              fontSize: 12, cursor: "pointer", fontWeight: 600,
            }}
          >
            🇬🇧 EN
          </button>
        </div>
        <span style={{ fontSize: 13, color: "#aaa", fontWeight: 500 }}>Marssoft</span>
      </div>
    </div>
  );
}
