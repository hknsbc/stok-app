"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";

type FilterType = "bugun" | "bu_hafta" | "bu_ay" | "gecen_ay" | "tum_zamanlar" | "ay_sec";

type SaleRow = {
  date: string;
  product_id: string;
  quantity: number;
  price: number;
  total: number;
  cost: number;
};

type Summary = {
  ciro: number;
  maliyet: number;
  kar: number;
  adet: number;
};

function getDateRange(filter: FilterType, customMonth: string): { start: string | null; end: string | null } {
  const today = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  if (filter === "bugun") {
    const t = fmt(today);
    return { start: t, end: t };
  }
  if (filter === "bu_hafta") {
    const day = today.getDay(); // 0=Sun
    const diffToMon = (day === 0 ? -6 : 1 - day);
    const mon = new Date(today); mon.setDate(today.getDate() + diffToMon);
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
    return { start: fmt(mon), end: fmt(sun) };
  }
  if (filter === "bu_ay") {
    const y = today.getFullYear(), m = today.getMonth();
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);
    return { start: fmt(first), end: fmt(last) };
  }
  if (filter === "gecen_ay") {
    const y = today.getFullYear(), m = today.getMonth();
    const first = new Date(y, m - 1, 1);
    const last = new Date(y, m, 0);
    return { start: fmt(first), end: fmt(last) };
  }
  if (filter === "ay_sec" && customMonth) {
    const [y, m] = customMonth.split("-").map(Number);
    const first = new Date(y, m - 1, 1);
    const last = new Date(y, m, 0);
    return { start: fmt(first), end: fmt(last) };
  }
  return { start: null, end: null };
}

function calcSummary(rows: { total: number; cost: number; quantity: number }[]): Summary {
  const ciro = rows.reduce((a, r) => a + Number(r.total || 0), 0);
  const maliyet = rows.reduce((a, r) => a + Number(r.cost || 0), 0);
  const adet = rows.reduce((a, r) => a + Number(r.quantity || 0), 0);
  return { ciro, maliyet, kar: ciro - maliyet, adet };
}

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "bugun", label: "Bugün" },
  { key: "bu_hafta", label: "Bu Hafta" },
  { key: "bu_ay", label: "Bu Ay" },
  { key: "gecen_ay", label: "Geçen Ay" },
  { key: "tum_zamanlar", label: "Tüm Zamanlar" },
  { key: "ay_sec", label: "Ay Seç" },
];

export default function Raporlar() {
  const today = new Date();
  const defaultMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

  const [filter, setFilter] = useState<FilterType>("bu_ay");
  const [customMonth, setCustomMonth] = useState(defaultMonth);
  const [summary, setSummary] = useState<Summary>({ ciro: 0, maliyet: 0, kar: 0, adet: 0 });
  const [satislar, setSatislar] = useState<SaleRow[]>([]);
  const [productNames, setProductNames] = useState<Record<string, string>>({});
  const [toplamUrun, setToplamUrun] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { start, end } = getDateRange(filter, customMonth);

    let salesQuery = supabase.from("sales").select("date, product_id, quantity, price, total, cost");
    if (start && end) {
      salesQuery = salesQuery.gte("date", start).lte("date", end);
    }
    salesQuery = salesQuery.order("date", { ascending: false });

    const [salesRes, productsRes] = await Promise.all([
      salesQuery,
      supabase.from("products").select("id, name"),
    ]);

    if (salesRes.data) {
      setSummary(calcSummary(salesRes.data));
      setSatislar(salesRes.data);
    } else {
      setSummary({ ciro: 0, maliyet: 0, kar: 0, adet: 0 });
      setSatislar([]);
    }

    if (productsRes.data) {
      setToplamUrun(productsRes.data.length);
      const names: Record<string, string> = {};
      for (const p of productsRes.data) names[p.id] = p.name;
      setProductNames(names);
    }

    setLoading(false);
  }, [filter, customMonth]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filterLabel = FILTERS.find((f) => f.key === filter)?.label ?? "";
  const karlilikPct = summary.ciro > 0 ? ((summary.kar / summary.ciro) * 100).toFixed(1) : "0.0";

  return (
    <DashboardLayout>
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <h1 style={{ fontSize: 28, fontWeight: "bold" }}>Raporlar</h1>
          {/* Tarih filtre butonları */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {FILTERS.map((f) => (
              <button key={f.key} onClick={() => setFilter(f.key)} style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid " + (filter === f.key ? "#6366f1" : "#ddd"),
                background: filter === f.key ? "#6366f1" : "white",
                color: filter === f.key ? "white" : "#333",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: filter === f.key ? "bold" : "normal",
              }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ay seçici */}
        {filter === "ay_sec" && (
          <div style={{ marginBottom: 20 }}>
            <input
              type="month"
              value={customMonth}
              onChange={(e) => setCustomMonth(e.target.value)}
              style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14 }}
            />
          </div>
        )}

        {/* Dönem etiketi */}
        <p style={{ color: "#888", fontSize: 13, marginBottom: 20 }}>
          {loading ? "Yukleniyor..." : `Seçilen dönem: ${filterLabel}${filter === "ay_sec" ? ` (${customMonth})` : ""} — ${satislar.length} satış kaydı`}
        </p>

        {/* Özet kartlar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 28 }}>
          {[
            { label: "Toplam Ciro", value: summary.ciro.toFixed(2) + " TL", color: "#6366f1" },
            { label: "Toplam Maliyet", value: summary.maliyet.toFixed(2) + " TL", color: "#f59e0b" },
            { label: "Toplam Kar", value: summary.kar.toFixed(2) + " TL", color: summary.kar >= 0 ? "#10b981" : "#ef4444" },
            { label: "Karlılık %", value: "%" + karlilikPct, color: Number(karlilikPct) >= 0 ? "#10b981" : "#ef4444" },
            { label: "Satılan Adet", value: String(summary.adet), color: "#334155" },
          ].map((card) => (
            <div key={card.label} style={{ background: "white", padding: "20px 18px", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
              <p style={{ color: "#888", fontSize: 12, marginBottom: 8 }}>{card.label}</p>
              <p style={{ fontSize: 20, fontWeight: "bold", color: card.color }}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* Satış detay tablosu */}
        <div style={{ background: "white", padding: 24, borderRadius: 12 }}>
          <h2 style={{ fontSize: 17, fontWeight: "bold", marginBottom: 16 }}>
            Satış Detayları
          </h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  {["Tarih", "Ürün", "Adet", "Alış Fiyatı", "Satış Fiyatı", "Ciro", "Maliyet", "Kar", "Karlılık %"].map((h) => (
                    <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 12, color: "#555", fontWeight: 600, borderBottom: "2px solid #eee" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {satislar.map((s, i) => {
                  const qty = Number(s.quantity || 0);
                  const total = Number(s.total || 0);
                  const cost = Number(s.cost || 0);
                  const alisBirimF = qty > 0 ? cost / qty : 0;
                  const rowKar = total - cost;
                  const rowKarPct = total > 0 ? (rowKar / total) * 100 : 0;
                  return (
                    <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "10px 12px", fontSize: 13 }}>{s.date}</td>
                      <td style={{ padding: "10px 12px", fontSize: 13 }}>{productNames[s.product_id] || "-"}</td>
                      <td style={{ padding: "10px 12px", fontSize: 13 }}>{qty}</td>
                      <td style={{ padding: "10px 12px", fontSize: 13, color: "#f59e0b" }}>{alisBirimF.toFixed(2)} TL</td>
                      <td style={{ padding: "10px 12px", fontSize: 13, color: "#6366f1" }}>{Number(s.price || 0).toFixed(2)} TL</td>
                      <td style={{ padding: "10px 12px", fontSize: 13 }}>{total.toFixed(2)} TL</td>
                      <td style={{ padding: "10px 12px", fontSize: 13 }}>{cost.toFixed(2)} TL</td>
                      <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: "bold", color: rowKar >= 0 ? "#10b981" : "#ef4444" }}>{rowKar.toFixed(2)} TL</td>
                      <td style={{ padding: "10px 12px", fontSize: 13, color: rowKarPct >= 0 ? "#10b981" : "#ef4444" }}>%{rowKarPct.toFixed(1)}</td>
                    </tr>
                  );
                })}
                {satislar.length === 0 && !loading && (
                  <tr><td colSpan={9} style={{ padding: 28, textAlign: "center", color: "#aaa", fontSize: 13 }}>Bu dönemde satış kaydı bulunamadı.</td></tr>
                )}
              </tbody>
              {satislar.length > 0 && (
                <tfoot>
                  <tr style={{ background: "#f9fafb", fontWeight: "bold" }}>
                    <td colSpan={2} style={{ padding: "10px 12px", fontSize: 13 }}>TOPLAM</td>
                    <td style={{ padding: "10px 12px", fontSize: 13 }}>{summary.adet}</td>
                    <td colSpan={2} />
                    <td style={{ padding: "10px 12px", fontSize: 13, color: "#6366f1" }}>{summary.ciro.toFixed(2)} TL</td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: "#f59e0b" }}>{summary.maliyet.toFixed(2)} TL</td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: summary.kar >= 0 ? "#10b981" : "#ef4444" }}>{summary.kar.toFixed(2)} TL</td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: summary.kar >= 0 ? "#10b981" : "#ef4444" }}>%{karlilikPct}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
