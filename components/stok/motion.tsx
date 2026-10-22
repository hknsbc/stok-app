"use client";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

// Görünür olunca bir kez tetiklenen scroll-reveal sarmalayıcı (stilleri globals.css: .sp-reveal)
export function Reveal({
  children, delay = 0, style, className = "", as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  style?: CSSProperties;
  className?: string;
  as?: "div" | "li" | "section";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) { setShown(true); io.disconnect(); }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={`sp-reveal${shown ? " sp-in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </Tag>
  );
}

// Görünür olunca 0'dan hedefe sayan sayaç
export function CountUp({
  to, decimals = 0, prefix = "", suffix = "", duration = 1600, thousands = false,
}: {
  to: number; decimals?: number; prefix?: string; suffix?: string; duration?: number; thousands?: boolean;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [val, setVal] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      if (reduced) { setVal(to); return; }
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        setVal(to * (1 - Math.pow(1 - p, 4))); // easeOutQuart
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to, duration]);

  const fixed = val.toFixed(decimals);
  const text = thousands ? Number(fixed).toLocaleString("tr-TR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : fixed;
  return <span ref={ref}>{prefix}{text}{suffix}</span>;
}

// İmleci takip eden hafif 3D eğim (masaüstü, hover destekli cihazlar)
export function Tilt({ children, max = 6, style }: { children: ReactNode; max?: number; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement | null>(null);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * max}deg) rotateX(${-y * max}deg)`;
  };
  const onLeave = () => { if (ref.current) ref.current.style.transform = ""; };

  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className="sp-tilt" style={style}>
      {children}
    </div>
  );
}

// İmleçle etkileşen parçacık ağı (canvas). Hareket azaltma açıksa çizilmez.
export function ParticleField({ color = "99,102,241", density = 11000, style }: { color?: string; density?: number; style?: CSSProperties }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0, raf = 0;
    const mouse = { x: -9999, y: -9999 };
    type P = { x: number; y: number; vx: number; vy: number; r: number };
    let pts: P[] = [];

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(90, Math.max(18, Math.floor((w * h) / density)));
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
        r: 1 + Math.random() * 1.8,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < 14000) { const d = Math.sqrt(d2) || 1; p.x += (dx / d) * 1.4; p.y += (dy / d) * 1.4; }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color},0.7)`; ctx.fill();
      }
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d2 = dx * dx + dy * dy;
          if (d2 < 15000) {
            ctx.strokeStyle = `rgba(${color},${(1 - d2 / 15000) * 0.35})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
          }
        }
        const mx = pts[i].x - mouse.x, my = pts[i].y - mouse.y, md = mx * mx + my * my;
        if (md < 28000) {
          ctx.strokeStyle = `rgba(${color},${(1 - md / 28000) * 0.6})`;
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
      }
      raf = requestAnimationFrame(draw);
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    };
    const onLeave = () => { mouse.x = mouse.y = -9999; };

    resize(); draw();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, [color, density]);

  return <canvas ref={ref} aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", ...style }} />;
}

// Sayfanın üstünde kaydırma ilerleme çubuğu
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (ref.current) ref.current.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return <div ref={ref} aria-hidden style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, zIndex: 200, transformOrigin: "left", transform: "scaleX(0)", background: "linear-gradient(90deg,#6366F1,#8B5CF6,#06B6D4,#10B981)", boxShadow: "0 0 12px rgba(99,102,241,0.7)" }} />;
}

// İmleci izleyen ışık efektli kart (stil: .sp-spot)
export function SpotCard({ children, style, className = "" }: { children: ReactNode; style?: CSSProperties; className?: string }) {
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget, r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return <div onPointerMove={onMove} className={`sp-spot ${className}`} style={style}>{children}</div>;
}

// Kelimeleri sırayla bulanıklıktan netliğe getirir
export function SplitWords({ text, delay = 0, step = 90 }: { text: string; delay?: number; step?: number }) {
  return (
    <>
      {text.split(" ").map((w, i) => (
        <span key={i} className="sp-word" style={{ animationDelay: `${delay + i * step}ms` }}>{w}&nbsp;</span>
      ))}
    </>
  );
}
