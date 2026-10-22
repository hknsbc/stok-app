"use client";
import type { CSSProperties } from "react";

// Animasyonlu depo sahnesi: raflar dizilir, forklift koli yerleştirir,
// bantta koliler akar ve barkod okuyucu onaylar. Tamamı SVG + CSS (stiller .sw-*).

const INDIGO = "#6366F1";
const GREEN = "#10B981";
const AMBER = "#F59E0B";

type Box = { x: number; y: number; w: number; h: number; c: string };

// Raf başına kolilerin yerleşimi (3 kat, her katta 2 bölme)
const SHELF_BOXES: Box[] = [
  // üst kat (beam y=110)
  { x: 36, y: 68, w: 54, h: 42, c: "#6366F1" }, { x: 100, y: 76, w: 48, h: 34, c: "#818CF8" },
  { x: 176, y: 70, w: 52, h: 40, c: "#4F46E5" }, { x: 238, y: 78, w: 46, h: 32, c: "#8B5CF6" },
  // orta kat (beam y=190)
  { x: 36, y: 152, w: 46, h: 38, c: "#818CF8" }, { x: 92, y: 146, w: 56, h: 44, c: "#6366F1" },
  { x: 176, y: 154, w: 50, h: 36, c: "#10B981" }, { x: 236, y: 148, w: 48, h: 42, c: "#4F46E5" },
  // alt kat (beam y=270)
  { x: 36, y: 230, w: 58, h: 40, c: "#4F46E5" }, { x: 104, y: 236, w: 44, h: 34, c: "#F59E0B" },
  { x: 176, y: 228, w: 52, h: 42, c: "#6366F1" },
];

function BoxShape({ x, y, w, h, c }: Box) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="4" fill={c} />
      <rect x={x} y={y} width={w} height={h} rx="4" fill="url(#swShine)" />
      <line x1={x} y1={y + h * 0.42} x2={x + w} y2={y + h * 0.42} stroke="#fff" strokeWidth="1.2" opacity="0.35" />
      <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h * 0.42} stroke="#fff" strokeWidth="1.2" opacity="0.35" />
      <rect x={x + w * 0.12} y={y + h * 0.58} width={w * 0.34} height={h * 0.22} rx="1.5" fill="#fff" opacity="0.85" />
    </g>
  );
}

export default function WarehouseScene({ style, maxWidth = 520 }: { style?: CSSProperties; maxWidth?: number }) {
  return (
    <div style={{
      width: "100%", maxWidth, borderRadius: 22, overflow: "hidden", position: "relative",
      background: "linear-gradient(160deg, #1E1B4B 0%, #2E2A7A 60%, #1E1B4B 100%)",
      boxShadow: "0 30px 70px rgba(30,27,75,0.45), inset 0 0 0 1px rgba(255,255,255,0.08)",
      ...style,
    }}>
      <style>{`
        .sw-pop      { transform-box: fill-box; transform-origin: bottom center; opacity: 0; animation: sw-pop 0.6s cubic-bezier(0.22,1.4,0.36,1) forwards; }
        .sw-glow     { animation: sw-glow 6s ease-in-out infinite; }
        .sw-belt     { stroke-dasharray: 8 10; animation: sw-belt 0.9s linear infinite; }
        .sw-pkg      { animation: sw-pkg 6s linear infinite; }
        .sw-fork     { animation: sw-drive 10s ease-in-out infinite; }
        .sw-lift     { animation: sw-lift 10s ease-in-out infinite; }
        .sw-load     { animation: sw-load 10s steps(1) infinite; }
        .sw-placed   { opacity: 0; animation: sw-placed 10s steps(1) infinite; }
        .sw-wheel    { transform-box: fill-box; transform-origin: center; animation: sw-wheel 1.1s linear infinite; }
        .sw-scanbeam { animation: sw-scanbeam 2s ease-in-out infinite; }
        .sw-ok       { transform-box: fill-box; transform-origin: center; animation: sw-ok 2s ease-out infinite; opacity: 0; }
        .sw-chip     { animation: sw-chip 5s ease-in-out infinite; }
        .sw-light    { animation: sw-light 1.4s ease-in-out infinite; }
        @keyframes sw-pop      { 0% { opacity: 0; transform: scale(0.2) translateY(-30px); } 100% { opacity: 1; transform: none; } }
        @keyframes sw-glow     { 0%, 70%, 100% { filter: none; } 80%, 90% { filter: drop-shadow(0 0 7px rgba(165,180,252,0.95)) brightness(1.25); } }
        @keyframes sw-belt     { to { stroke-dashoffset: -18; } }
        @keyframes sw-pkg      { 0% { transform: translateX(0); opacity: 0; } 6% { opacity: 1; } 92% { opacity: 1; } 100% { transform: translateX(176px); opacity: 0; } }
        @keyframes sw-drive    { 0%, 4% { transform: translateX(0); } 40%, 64% { transform: translateX(162px); } 100% { transform: translateX(0); } }
        @keyframes sw-lift     { 0%, 40% { transform: translateY(0); } 52%, 62% { transform: translateY(-40px); } 72%, 100% { transform: translateY(0); } }
        @keyframes sw-load     { 0% { opacity: 1; } 57% { opacity: 0; } 98% { opacity: 1; } }
        @keyframes sw-placed   { 0% { opacity: 0; } 57% { opacity: 1; } 96% { opacity: 0; } }
        @keyframes sw-wheel    { to { transform: rotate(360deg); } }
        @keyframes sw-scanbeam { 0%, 100% { transform: translateY(0); opacity: 0.9; } 50% { transform: translateY(26px); opacity: 1; } }
        @keyframes sw-ok       { 0%, 40% { opacity: 0; transform: scale(0.3); } 55% { opacity: 1; transform: scale(1.15); } 75% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(1); } }
        @keyframes sw-chip     { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes sw-light    { 0%, 100% { opacity: 0.35; } 50% { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) {
          .sw-pop { animation: none; opacity: 1; }
          .sw-glow, .sw-belt, .sw-pkg, .sw-fork, .sw-lift, .sw-load, .sw-wheel, .sw-scanbeam, .sw-ok, .sw-chip, .sw-light { animation: none; }
          .sw-placed { animation: none; opacity: 1; }
          .sw-pkg { opacity: 1; }
        }
      `}</style>

      <svg viewBox="0 0 520 345" fill="none" style={{ display: "block", width: "100%", height: "auto" }} role="img" aria-label="Animasyonlu depo: raflar, forklift ve konveyör">
        <defs>
          <linearGradient id="swShine" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.22" />
            <stop offset="1" stopColor="#000" stopOpacity="0.18" />
          </linearGradient>
          <linearGradient id="swFloor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3B3796" />
            <stop offset="1" stopColor="#1E1B4B" />
          </linearGradient>
          <pattern id="swGrid" width="26" height="26" patternUnits="userSpaceOnUse">
            <path d="M26 0H0V26" stroke="#fff" strokeOpacity="0.045" />
          </pattern>
        </defs>

        <rect width="520" height="345" fill="url(#swGrid)" />

        {/* Zemin */}
        <rect y="300" width="520" height="45" fill="url(#swFloor)" />
        <line x1="0" y1="300" x2="520" y2="300" stroke="#A5B4FC" strokeOpacity="0.35" />
        <line x1="0" y1="332" x2="520" y2="332" stroke="#FBBF24" strokeOpacity="0.5" strokeDasharray="14 12" />

        {/* Raf: dikmeler + kirişler */}
        {[24, 160, 296].map((x) => (
          <rect key={x} x={x} y="40" width="8" height="260" rx="3" fill="#A5B4FC" opacity="0.55" />
        ))}
        {[110, 190, 270].map((y) => (
          <rect key={y} x="20" y={y} width="288" height="8" rx="3" fill="#C7D2FE" opacity="0.8" />
        ))}
        <rect x="20" y="32" width="288" height="8" rx="3" fill="#818CF8" opacity="0.6" />

        {/* Raf kolileri — sırayla belirir, ara ara parlar (envanter taraması) */}
        {SHELF_BOXES.map((b, i) => (
          <g key={i} className="sw-pop" style={{ animationDelay: `${0.4 + i * 0.14}s` }}>
            <g className="sw-glow" style={{ animationDelay: `${(i * 0.55) % 6}s` }}>
              <BoxShape {...b} />
            </g>
          </g>
        ))}

        {/* Forkliftin yerleştirdiği koli (üst-sağ boş yuva) */}
        <g className="sw-placed">
          <BoxShape x={240} y={226} w={44} h={44} c={AMBER} />
        </g>

        {/* Konveyör */}
        <g>
          <rect x="332" y="270" width="176" height="20" rx="10" fill="#0F172A" opacity="0.85" />
          <line className="sw-belt" x1="342" y1="280" x2="498" y2="280" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
          <circle cx="342" cy="280" r="9" fill="#334155" /><circle cx="498" cy="280" r="9" fill="#334155" />
          <rect x="346" y="290" width="6" height="10" fill="#475569" /><rect x="488" y="290" width="6" height="10" fill="#475569" />
          {[0, -2, -4].map((d, i) => (
            <g key={i} className="sw-pkg" style={{ animationDelay: `${d}s` }}>
              <BoxShape x={338} y={238} w={32} h={32} c={[INDIGO, GREEN, "#8B5CF6"][i]} />
            </g>
          ))}
        </g>

        {/* Barkod okuyucu kemeri */}
        <g>
          <rect x="414" y="196" width="6" height="74" rx="2" fill="#94A3B8" />
          <rect x="474" y="196" width="6" height="74" rx="2" fill="#94A3B8" />
          <rect x="410" y="190" width="74" height="10" rx="4" fill="#CBD5E1" />
          <circle className="sw-light" cx="422" cy="195" r="2.6" fill={GREEN} />
          <circle className="sw-light" cx="472" cy="195" r="2.6" fill={GREEN} style={{ animationDelay: "0.4s" }} />
          <g className="sw-scanbeam">
            <rect x="422" y="206" width="50" height="2.5" rx="1.2" fill={GREEN} />
            <rect x="422" y="203" width="50" height="9" fill={GREEN} opacity="0.18" />
          </g>
          <g className="sw-ok" style={{ animationDelay: "0.7s" }}>
            <circle cx="447" cy="170" r="13" fill={GREEN} />
            <path d="M440.5 170.5l4.5 4.5 8-9" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </g>

        {/* Forklift */}
        <g transform="translate(60 322)">
          <g className="sw-fork">
            {/* zemin gölgesi */}
            <ellipse cx="-16" cy="2" rx="46" ry="4" fill="#000" opacity="0.28" />
            {/* mast */}
            <rect x="14" y="-84" width="6" height="82" rx="2" fill="#94A3B8" />
            <rect x="24" y="-84" width="4" height="82" rx="2" fill="#64748B" />
            {/* çatal + koli (yukarı-aşağı) */}
            <g className="sw-lift">
              <g className="sw-load"><BoxShape x={18} y={-56} w={44} h={44} c={AMBER} /></g>
              <rect x="14" y="-12" width="50" height="5" rx="2" fill="#CBD5E1" />
              <rect x="12" y="-26" width="7" height="22" rx="2" fill="#94A3B8" />
            </g>
            {/* gövde */}
            <path d="M-52 -14 h66 v-26 h-22 l-8 -16 h-30 a6 6 0 0 0 -6 6 z" fill="#FBBF24" />
            <rect x="-52" y="-14" width="66" height="8" rx="3" fill="#F59E0B" />
            {/* kabin çerçevesi + operatör */}
            <path d="M-44 -40 v-34 h32 v6" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="-28" cy="-52" r="6.5" fill="#FDE68A" />
            <rect x="-34" y="-46" width="12" height="12" rx="3" fill="#6366F1" />
            <circle className="sw-light" cx="-10" cy="-76" r="3" fill="#F97316" />
            {/* tekerlekler */}
            <g transform="translate(-34 -9)"><circle r="10" fill="#0F172A" /><circle className="sw-wheel" r="4.5" fill="#64748B" /><line className="sw-wheel" x1="-4" y1="0" x2="4" y2="0" stroke="#0F172A" strokeWidth="1.5" /></g>
            <g transform="translate(0 -9)"><circle r="10" fill="#0F172A" /><circle className="sw-wheel" r="4.5" fill="#64748B" /><line className="sw-wheel" x1="-4" y1="0" x2="4" y2="0" stroke="#0F172A" strokeWidth="1.5" /></g>
          </g>
        </g>

        {/* Bilgi çipleri */}
        <g className="sw-chip">
          <rect x="332" y="38" width="150" height="40" rx="12" fill="#fff" opacity="0.1" stroke="#fff" strokeOpacity="0.22" />
          <circle cx="352" cy="58" r="10" fill={GREEN} opacity="0.25" />
          <path d="M347 58.5l3.5 3.5 6.5-7" stroke={GREEN} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <text x="371" y="55" fill="#fff" fontSize="11.5" fontWeight="700" fontFamily="system-ui, sans-serif">Stok güncellendi</text>
          <text x="371" y="69" fill="#A5B4FC" fontSize="10" fontFamily="system-ui, sans-serif">anlık · otomatik</text>
        </g>
        <g className="sw-chip" style={{ animationDelay: "-2.2s" }}>
          <rect x="352" y="94" width="130" height="34" rx="11" fill="#fff" opacity="0.1" stroke="#fff" strokeOpacity="0.22" />
          <rect x="364" y="104" width="14" height="14" rx="3" fill={AMBER} />
          <text x="386" y="115" fill="#fff" fontSize="11.5" fontWeight="700" fontFamily="system-ui, sans-serif">1.240 ürün rafta</text>
        </g>
      </svg>
    </div>
  );
}
