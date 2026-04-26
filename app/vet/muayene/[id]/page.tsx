"use client";
import { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";

type Exam = { id: string; pet_name: string; owner_name: string; complaint: string; diagnosis: string; treatment_plan: string; medicines_used: string[]; labor_cost: number; medicine_cost: number; total_cost: number; prescription: string; date: string; status: string; patient_id: string };

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [exam, setExam] = useState<Exam | null>(null);

  useEffect(() => {
    supabase.from("vet_examinations").select("*").eq("id", id).single().then(({ data }) => { if (data) setExam(data as Exam); });
  }, [id]);

  if (!exam) return <DashboardLayout><div style={{ padding: 40, textAlign: "center", color: "#888" }}>Yükleniyor...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: "bold", margin: 0 }}>🩺 Muayene Detayı</h1>
          <Link href={`/vet/hastalar/${exam.patient_id}`} style={{ padding: "8px 16px", background: "#f0f9ff", color: "#0ea5e9", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>← Hastaya Dön</Link>
        </div>
        {[
          { label: "Hasta", value: `${exam.pet_name} — ${exam.owner_name}` },
          { label: "Tarih", value: exam.date },
          { label: "Şikayet", value: exam.complaint || "—" },
          { label: "Tanı", value: exam.diagnosis || "—" },
          { label: "Tedavi Planı", value: exam.treatment_plan || "—" },
          { label: "Kullanılan İlaçlar", value: Array.isArray(exam.medicines_used) ? exam.medicines_used.join(", ") || "—" : "—" },
          { label: "İşçilik", value: `${Number(exam.labor_cost || 0).toLocaleString("tr-TR")} TL` },
          { label: "İlaç / Malzeme", value: `${Number(exam.medicine_cost || 0).toLocaleString("tr-TR")} TL` },
          { label: "Toplam", value: `${Number(exam.total_cost || 0).toLocaleString("tr-TR")} TL` },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: "flex", gap: 12, padding: "12px 16px", background: "white", borderRadius: 10, marginBottom: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <span style={{ minWidth: 130, color: "#888", fontSize: 13 }}>{label}</span>
            <span style={{ fontSize: 14, fontWeight: label === "Toplam" ? "bold" : "normal", color: label === "Toplam" ? "#10b981" : "#374151" }}>{value}</span>
          </div>
        ))}
        {exam.prescription && (
          <div style={{ background: "white", borderRadius: 10, padding: 16, marginTop: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#888", marginBottom: 8 }}>📄 Reçete</div>
            <pre style={{ fontSize: 13, color: "#374151", whiteSpace: "pre-wrap", margin: 0 }}>{exam.prescription}</pre>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
