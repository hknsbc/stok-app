"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";

type Invoice = { id: string; pet_name: string; owner_name: string; service_total: number; medicine_total: number; total: number; status: string; date: string };

export default function VetFaturaPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from("profiles").select("tenant_id").eq("id", user.id).single();
      if (!profile?.tenant_id) return;
      const { data } = await supabase.from("vet_invoices").select("id,pet_name,owner_name,service_total,medicine_total,total,status,date").eq("tenant_id", profile.tenant_id).order("date", { ascending: false });
      setInvoices(data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const STATUS_COLOR: Record<string, string> = { ödendi: "#10b981", bekliyor: "#f59e0b", iptal: "#ef4444" };

  return (
    <DashboardLayout>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h1 style={{ fontSize: 24, fontWeight: "bold" }}>🧾 Faturalar</h1>
          <Link href="/vet/fatura/yeni" style={{ padding: "10px 20px", background: "#10b981", color: "white", borderRadius: 8, textDecoration: "none", fontWeight: "bold", fontSize: 14 }}>
            + Yeni Fatura
          </Link>
        </div>

        <div style={{ background: "white", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#888" }}>Yükleniyor...</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  {["Tarih", "Hasta", "Sahip", "Hizmet", "İlaç", "Toplam", "Durum"].map((h) => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, color: "#555", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#888" }}>{inv.date}</td>
                    <td style={{ padding: "12px 16px", fontWeight: 600, fontSize: 14 }}>{inv.pet_name}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#555" }}>{inv.owner_name}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13 }}>{Number(inv.service_total || 0).toLocaleString("tr-TR")} TL</td>
                    <td style={{ padding: "12px 16px", fontSize: 13 }}>{Number(inv.medicine_total || 0).toLocaleString("tr-TR")} TL</td>
                    <td style={{ padding: "12px 16px", fontWeight: "bold", color: "#10b981" }}>{Number(inv.total || 0).toLocaleString("tr-TR")} TL</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: (STATUS_COLOR[inv.status] ?? "#888") + "20", color: STATUS_COLOR[inv.status] ?? "#888" }}>
                        {inv.status || "bekliyor"}
                      </span>
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr><td colSpan={7}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "52px 24px" }}>
                      <div style={{ fontSize: 36 }}>🧾</div>
                      <p style={{ fontSize: 15, fontWeight: 600, color: "#374151", margin: 0 }}>Henüz fatura yok.</p>
                      <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>Kullanıma hazır.</p>
                    </div>
                  </td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
