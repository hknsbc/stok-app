"use client";
import { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type SaleLine = {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  total: number;
  date: string;
  payment_method: "nakit" | "banka" | "kredi_kart" | null;
  notes: string | null;
};

export default function FisPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = use(params);
  const [lines, setLines] = useState<SaleLine[]>([]);
  const [productMap, setProductMap] = useState<Record<string, string>>({});
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("company_name").eq("id", user.id).single();
        setCompanyName(profile?.company_name ?? null);
      }

      const { data: sales } = await supabase.from("sales").select("*").eq("sale_group_id", groupId).order("created_at");
      if (sales) setLines(sales);

      if (sales && sales.length > 0) {
        const { data: products } = await supabase
          .from("products").select("id, name")
          .in("id", sales.map((s) => s.product_id).filter(Boolean));
        if (products) {
          const map: Record<string, string> = {};
          products.forEach((p) => { map[p.id] = p.name; });
          setProductMap(map);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [groupId]);

  const total = lines.reduce((a, l) => a + Number(l.total || 0), 0);
  const paymentLabel = (pm: SaleLine["payment_method"]) =>
    pm === "nakit" ? "Nakit" : pm === "banka" ? "Banka" : pm === "kredi_kart" ? "Kredi Kartı" : "—";

  if (loading) {
    return <div style={{ padding: 40, textAlign: "center", color: "#888" }}>Yükleniyor...</div>;
  }

  if (lines.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <p style={{ color: "#888", marginBottom: 16 }}>Bu fişe ait kayıt bulunamadı.</p>
        <Link href="/satislar" style={{ color: "#6366f1" }}>← Satışlara dön</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4ff", padding: "32px 16px", boxSizing: "border-box" }}>
      <div className="fis-actions" style={{ maxWidth: 420, margin: "0 auto 16px", display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <button
          onClick={() => window.print()}
          style={{ padding: "8px 18px", background: "#6366f1", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 }}
        >
          🖨️ Yazdır
        </button>
      </div>

      <div style={{
        maxWidth: 420, margin: "0 auto", background: "white", borderRadius: 12,
        boxShadow: "0 2px 12px rgba(0,0,0,0.1)", padding: "28px 24px", fontFamily: "monospace",
      }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 18, fontWeight: "bold" }}>{companyName || "StokPanel"}</div>
          <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>SATIŞ FİŞİ</div>
          <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>
            {new Date(lines[0].date).toLocaleDateString("tr-TR")} · Fiş No: {groupId.slice(0, 8).toUpperCase()}
          </div>
        </div>

        <div style={{ borderTop: "1px dashed #ccc", borderBottom: "1px dashed #ccc", padding: "10px 0", marginBottom: 12 }}>
          {lines.map((l) => (
            <div key={l.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
              <span style={{ flex: 1 }}>{productMap[l.product_id] ?? "Ürün"} x{l.quantity}</span>
              <span>{Number(l.total).toFixed(2)} TL</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: "bold", marginBottom: 8 }}>
          <span>TOPLAM</span>
          <span>{total.toFixed(2)} TL</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#555" }}>
          <span>Ödeme Yöntemi</span>
          <span>{paymentLabel(lines[0].payment_method)}</span>
        </div>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: "#aaa" }}>
          Teşekkür ederiz
        </div>
      </div>

      <div className="fis-actions" style={{ maxWidth: 420, margin: "16px auto 0", textAlign: "center" }}>
        <Link href="/satislar" style={{ color: "#6366f1", fontSize: 13, textDecoration: "none" }}>← Satışlara dön</Link>
      </div>

      <style>{`
        @media print {
          .fis-actions { display: none !important; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
}
