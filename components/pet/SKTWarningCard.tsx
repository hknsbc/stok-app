"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Counts = { expired: number; warn30: number; warn60: number };

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(dateStr);
  return Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export default function SKTWarningCard() {
  const [counts, setCounts] = useState<Counts>({ expired: 0, warn30: 0, warn60: 0 });

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("products")
        .select("expiry_date")
        .not("expiry_date", "is", null);
      if (!data) return;
      const result = { expired: 0, warn30: 0, warn60: 0 };
      for (const p of data) {
        const d = daysUntil(p.expiry_date!);
        if (d < 0) result.expired++;
        else if (d <= 30) result.warn30++;
        else if (d <= 60) result.warn60++;
      }
      setCounts(result);
    };
    fetch();
  }, []);

  const total = counts.expired + counts.warn30 + counts.warn60;
  const urgentColor = counts.expired > 0 ? "#ef4444" : counts.warn30 > 0 ? "#f97316" : "#eab308";

  return (
    <Link href="/pet/skt" style={{ textDecoration: "none" }}>
      <div style={{
        background: "white", borderRadius: 12, padding: "16px 20px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        borderLeft: `4px solid ${total > 0 ? urgentColor : "#16a34a"}`,
        cursor: "pointer", transition: "box-shadow 0.15s",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#555" }}>⚠️ SKT Uyarıları</span>
          <span style={{ fontSize: 11, color: "#6366f1", fontWeight: 500 }}>Tümünü gör →</span>
        </div>

        {total === 0 ? (
          <p style={{ fontSize: 13, color: "#16a34a", margin: 0, fontWeight: 500 }}>✓ Kritik ürün yok</p>
        ) : (
          <div style={{ display: "flex", gap: 10 }}>
            {counts.expired > 0 && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "6px 12px", textAlign: "center", flex: 1 }}>
                <div style={{ fontSize: 20, fontWeight: "bold", color: "#ef4444" }}>{counts.expired}</div>
                <div style={{ fontSize: 11, color: "#888" }}>Geçmiş</div>
              </div>
            )}
            {counts.warn30 > 0 && (
              <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8, padding: "6px 12px", textAlign: "center", flex: 1 }}>
                <div style={{ fontSize: 20, fontWeight: "bold", color: "#f97316" }}>{counts.warn30}</div>
                <div style={{ fontSize: 11, color: "#888" }}>≤30 Gün</div>
              </div>
            )}
            {counts.warn60 > 0 && (
              <div style={{ background: "#fefce8", border: "1px solid #fde68a", borderRadius: 8, padding: "6px 12px", textAlign: "center", flex: 1 }}>
                <div style={{ fontSize: 20, fontWeight: "bold", color: "#eab308" }}>{counts.warn60}</div>
                <div style={{ fontSize: 11, color: "#888" }}>≤60 Gün</div>
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
