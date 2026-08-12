import Link from "next/link";

export type LegalSectionBody = string | { list: string[] };
export type LegalSection = { heading: string; body: LegalSectionBody[] };

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  intro?: string;
  sections: LegalSection[];
}

export default function LegalPage({ title, lastUpdated, intro, sections }: LegalPageProps) {
  return (
    <div style={{ minHeight: "100vh", background: "#f0f4ff", padding: "48px 20px", boxSizing: "border-box" }}>
      <div style={{
        maxWidth: 800, margin: "0 auto", background: "white", borderRadius: 12,
        boxShadow: "0 2px 12px rgba(0,0,0,0.1)", padding: "40px 48px", boxSizing: "border-box",
      }}>
        <h1 style={{ fontSize: 26, fontWeight: "bold", marginBottom: 6, color: "#1a1a2e" }}>{title}</h1>
        <p style={{ fontSize: 13, color: "#888", marginBottom: 28 }}>Son güncelleme: {lastUpdated}</p>

        {intro && (
          <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, marginBottom: 28 }}>{intro}</p>
        )}

        {sections.map((s, i) => (
          <section key={s.heading} style={{ marginBottom: 26 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "#1a1a2e" }}>
              {i + 1}. {s.heading}
            </h2>
            {s.body.map((b, j) =>
              typeof b === "string" ? (
                <p key={j} style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, marginBottom: 8 }}>{b}</p>
              ) : (
                <ul key={j} style={{ margin: "0 0 8px", paddingLeft: 20, fontSize: 14, color: "#374151", lineHeight: 1.7 }}>
                  {b.list.map((item) => <li key={item}>{item}</li>)}
                </ul>
              )
            )}
          </section>
        ))}

        <div style={{ marginTop: 36, paddingTop: 20, borderTop: "1px solid #eee" }}>
          <Link href="/" style={{ color: "#6366f1", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
            ← Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
