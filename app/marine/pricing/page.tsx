"use client";
import { useState } from "react";
import Link from "next/link";

type Plan = {
  key: string;
  name: string;
  tagline: string;
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  priceRange?: string;
  popular: boolean;
  cta: string;
  ctaHref: string;
  features: string[];
  highlight: string;
};

const PLANS: Plan[] = [
  {
    key: "pro",
    name: "Pro",
    tagline: "For independent marine service shops",
    monthlyPrice: 99,
    yearlyPrice: 79,
    popular: false,
    cta: "Get Started",
    ctaHref: "/login",
    highlight: "#06b6d4",
    features: [
      "Unlimited boat cards",
      "Maintenance history & tracking",
      "Parts stock management",
      "Serial number tracking",
      "Labor + material cost calculation",
      "WhatsApp maintenance reminders",
      "Mobile-responsive dashboard",
      "3-column professional panel",
    ],
  },
  {
    key: "business",
    name: "Business",
    tagline: "For growing marine service businesses",
    monthlyPrice: 199,
    yearlyPrice: 159,
    popular: true,
    cta: "Start Free Trial",
    ctaHref: "/login",
    highlight: "#0ea5e9",
    features: [
      "Everything in Pro",
      "Multi-user access (up to 10)",
      "Multi-branch support",
      "Advanced reports & analytics",
      "Priority email & chat support",
      "Custom branding",
      "REST API access",
      "Bulk data import / export",
    ],
  },
  {
    key: "enterprise",
    name: "Enterprise",
    tagline: "For marinas, shipyards & fleets",
    monthlyPrice: null,
    yearlyPrice: null,
    priceRange: "$399–699",
    popular: false,
    cta: "Contact Sales",
    ctaHref: "mailto:pazarlama@marssoft.com.tr?subject=Marine%20Enterprise%20Inquiry",
    highlight: "#6366f1",
    features: [
      "Everything in Business",
      "Custom marina / shipyard modules",
      "Custom integrations & webhooks",
      "Dedicated onboarding manager",
      "Team training package",
      "99.9% uptime SLA",
      "Custom reporting & dashboards",
      "Unlimited users & branches",
    ],
  },
];

const CHECK = (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="8" fill="currentColor" fillOpacity="0.15" />
    <path d="M4.5 8l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function MarinePricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: "#060f1e", color: "white", fontFamily: "system-ui, sans-serif" }}>

      {/* ── Nav ── */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <span className="text-2xl">⚓</span>
          <span className="font-bold text-lg" style={{ color: "#06b6d4" }}>MarineApp</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/marine/tekne" className="text-sm no-underline" style={{ color: "#94a3b8" }}>Dashboard</Link>
          <Link href="/login" className="text-sm font-semibold px-4 py-2 rounded-lg no-underline" style={{ background: "#06b6d4", color: "white" }}>
            Sign In
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <header className="text-center px-6 pt-16 pb-12 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
          style={{ background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.3)", color: "#06b6d4" }}>
          ⚓ Marine Software Pricing
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-5" style={{ letterSpacing: "-0.02em" }}>
          One platform for{" "}
          <span style={{ background: "linear-gradient(90deg, #06b6d4, #3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            every marina
          </span>
        </h1>
        <p className="text-lg mb-4" style={{ color: "#94a3b8", lineHeight: 1.7 }}>
          Manage boat maintenance, parts inventory, and operations from a single platform.
          Trusted by marine professionals.
        </p>

        {/* Annual toggle */}
        <div className="inline-flex items-center gap-3 mt-2">
          <span className="text-sm font-medium" style={{ color: annual ? "#64748b" : "white" }}>Monthly</span>
          <button
            onClick={() => setAnnual(!annual)}
            className="relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none"
            style={{ background: annual ? "#06b6d4" : "#1e3a5f" }}
            aria-label="Toggle annual billing"
          >
            <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
              style={{ transform: annual ? "translateX(24px)" : "translateX(0)" }} />
          </button>
          <span className="text-sm font-medium" style={{ color: annual ? "white" : "#64748b" }}>
            Annual
            <span className="ml-1.5 px-2 py-0.5 text-xs font-bold rounded-full" style={{ background: "rgba(16,185,129,0.15)", color: "#10b981" }}>
              Save 20%
            </span>
          </span>
        </div>
      </header>

      {/* ── Pricing cards ── */}
      <section className="px-4 pb-20 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {PLANS.map((plan) => {
            const price = plan.monthlyPrice === null
              ? null
              : annual ? plan.yearlyPrice : plan.monthlyPrice;

            return (
              <div
                key={plan.key}
                className="relative flex flex-col rounded-2xl p-8 transition-transform duration-200 hover:-translate-y-1"
                style={{
                  background: plan.popular
                    ? "linear-gradient(160deg, #0c2a50 0%, #0a2240 100%)"
                    : "rgba(255,255,255,0.04)",
                  border: plan.popular
                    ? `2px solid ${plan.highlight}`
                    : "1px solid rgba(255,255,255,0.08)",
                  boxShadow: plan.popular ? `0 0 40px rgba(6,182,212,0.15)` : "none",
                }}
              >
                {/* Most popular badge */}
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold whitespace-nowrap"
                    style={{ background: "linear-gradient(90deg, #06b6d4, #0ea5e9)", color: "white", letterSpacing: "0.05em" }}>
                    ✦ MOST POPULAR
                  </div>
                )}

                {/* Plan header */}
                <div className="mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4"
                    style={{ background: `${plan.highlight}20`, border: `1px solid ${plan.highlight}40` }}>
                    {plan.key === "pro" ? "⚙️" : plan.key === "business" ? "🚢" : "🏗️"}
                  </div>
                  <h2 className="text-xl font-bold mb-1">{plan.name}</h2>
                  <p className="text-sm" style={{ color: "#64748b" }}>{plan.tagline}</p>
                </div>

                {/* Price */}
                <div className="mb-6 pb-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  {price !== null ? (
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-extrabold" style={{ color: plan.highlight, letterSpacing: "-0.03em" }}>
                        ${price}
                      </span>
                      <span className="text-sm mb-1.5" style={{ color: "#64748b" }}>/ mo</span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-4xl font-extrabold" style={{ color: plan.highlight, letterSpacing: "-0.03em" }}>
                        {plan.priceRange}
                      </span>
                      <span className="text-sm ml-1" style={{ color: "#64748b" }}>/ mo</span>
                    </div>
                  )}
                  {annual && price !== null && (
                    <p className="text-xs mt-1" style={{ color: "#10b981" }}>
                      Billed annually · Save ${((plan.monthlyPrice! - plan.yearlyPrice!) * 12).toLocaleString()}/yr
                    </p>
                  )}
                  {plan.monthlyPrice === null && (
                    <p className="text-xs mt-1" style={{ color: "#64748b" }}>Custom billing available</p>
                  )}
                </div>

                {/* Features */}
                <ul className="flex flex-col gap-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm" style={{ color: "#cbd5e1" }}>
                      <span style={{ color: plan.highlight, marginTop: 2 }}>{CHECK}</span>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <a
                  href={plan.ctaHref}
                  className="block text-center py-3 rounded-xl font-bold text-sm no-underline transition-opacity duration-150 hover:opacity-90"
                  style={
                    plan.popular
                      ? { background: `linear-gradient(90deg, ${plan.highlight}, #0ea5e9)`, color: "white" }
                      : { background: `${plan.highlight}18`, border: `1px solid ${plan.highlight}50`, color: plan.highlight }
                  }
                >
                  {plan.cta} {plan.key !== "enterprise" && "→"}
                </a>
              </div>
            );
          })}
        </div>

        {/* ── Feature comparison note ── */}
        <div className="mt-16 rounded-2xl p-8 text-center"
          style={{ background: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.15)" }}>
          <p className="text-sm font-semibold mb-1" style={{ color: "#06b6d4" }}>All plans include</p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 mt-4">
            {["SSL security", "99.9% uptime", "Daily backups", "GDPR compliant", "Email support", "Free updates"].map((f) => (
              <span key={f} className="flex items-center gap-1.5 text-sm" style={{ color: "#94a3b8" }}>
                <span style={{ color: "#06b6d4" }}>✓</span> {f}
              </span>
            ))}
          </div>
        </div>

        {/* ── FAQ ── */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="flex flex-col gap-4">
            {[
              { q: "Can I switch plans at any time?", a: "Yes. You can upgrade or downgrade your plan at any time. Changes take effect at your next billing cycle." },
              { q: "Is there a free trial?", a: "The Business plan includes a 14-day free trial with no credit card required." },
              { q: "Do you offer discounts for annual billing?", a: "Yes — annual billing saves you 20% compared to monthly billing on all plans." },
              { q: "What counts as a 'branch' in the Business plan?", a: "A branch is a separate operational location (e.g. a second marina yard) under the same account." },
            ].map(({ q, a }) => (
              <div key={q} className="rounded-xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="font-semibold text-sm mb-2" style={{ color: "white" }}>{q}</p>
                <p className="text-sm" style={{ color: "#94a3b8", lineHeight: 1.7 }}>{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="text-center py-10 px-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", color: "#475569" }}>
        <p className="text-sm">© {new Date().getFullYear()} Marssoft · <a href="mailto:pazarlama@marssoft.com.tr" className="no-underline" style={{ color: "#06b6d4" }}>pazarlama@marssoft.com.tr</a></p>
      </footer>
    </div>
  );
}
