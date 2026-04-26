"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Patient = {
  id: string; pet_name: string; species: string; breed: string;
  age_years: number | null; weight_kg: number | null; allergies: string;
  owner_name: string; owner_phone: string; owner_email: string; notes: string;
};
type Exam = { id: string; date: string; diagnosis: string; treatment_plan: string; total_cost: number; status: string };
type Vaccine = { id: string; vaccine_name: string; administered_date: string; next_due_date: string; batch_number: string };

export default function VetPatientDetail({ id }: { id: string }) {
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [pRes, eRes, vRes] = await Promise.all([
        supabase.from("vet_patients").select("*").eq("id", id).single(),
        supabase.from("vet_examinations").select("id,date,diagnosis,treatment_plan,total_cost,status").eq("patient_id", id).order("date", { ascending: false }),
        supabase.from("vet_vaccines").select("id,vaccine_name,administered_date,next_due_date,batch_number").eq("patient_id", id).order("next_due_date", { ascending: false }),
      ]);
      if (pRes.data) setPatient(pRes.data as Patient);
      setExams((eRes.data ?? []) as Exam[]);
      setVaccines((vRes.data ?? []) as Vaccine[]);
      setLoading(false);
    };
    load();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Bu hastayı silmek istiyor musunuz? Tüm muayene ve aşı kayıtları da silinecek.")) return;
    await supabase.from("vet_examinations").delete().eq("patient_id", id);
    await supabase.from("vet_vaccines").delete().eq("patient_id", id);
    await supabase.from("vet_patients").delete().eq("id", id);
    router.push("/vet/hastalar");
  };

  if (loading) return <DashboardLayout><div style={{ padding: 40, textAlign: "center", color: "#888" }}>Yükleniyor...</div></DashboardLayout>;
  if (!patient) return <DashboardLayout><div style={{ padding: 40, color: "#ef4444" }}>Hasta bulunamadı.</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 820 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: "bold", margin: 0 }}>🐾 {patient.pet_name}</h1>
            <p style={{ color: "#888", margin: "4px 0 0", fontSize: 14 }}>{patient.species}{patient.breed ? ` · ${patient.breed}` : ""}{patient.age_years != null ? ` · ${patient.age_years} yaş` : ""}{patient.weight_kg != null ? ` · ${patient.weight_kg} kg` : ""}</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link href={`/vet/muayene/yeni?patient=${id}`} style={{ padding: "9px 16px", background: "#0ea5e9", color: "white", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>🩺 Muayene</Link>
            <Link href={`/vet/asi/yeni?patient=${id}`} style={{ padding: "9px 16px", background: "#f59e0b", color: "white", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>💉 Aşı</Link>
            <Link href={`/vet/hastalar/${id}/duzenle`} style={{ padding: "9px 16px", background: "#8b5cf6", color: "white", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>Düzenle</Link>
            <button onClick={handleDelete} style={{ padding: "9px 16px", background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Sil</button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <InfoCard title="👤 Sahip Bilgileri">
            <InfoRow label="Ad" value={patient.owner_name} />
            <InfoRow label="Telefon" value={patient.owner_phone || "—"} />
            <InfoRow label="E-posta" value={patient.owner_email || "—"} />
          </InfoCard>
          <InfoCard title="⚠️ Sağlık Bilgileri">
            <InfoRow label="Alerjiler" value={patient.allergies || "Yok"} />
            <InfoRow label="Notlar" value={patient.notes || "—"} />
          </InfoCard>
        </div>

        <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h2 style={{ fontSize: 15, fontWeight: "bold", margin: 0 }}>🩺 Muayene Geçmişi</h2>
            <Link href={`/vet/muayene/yeni?patient=${id}`} style={{ fontSize: 12, color: "#0ea5e9", textDecoration: "none" }}>+ Yeni</Link>
          </div>
          {exams.length === 0 ? (
            <p style={{ color: "#9ca3af", fontSize: 13, textAlign: "center", padding: "16px 0" }}>Henüz muayene kaydı yok.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {exams.map((e) => (
                <Link key={e.id} href={`/vet/muayene/${e.id}`} style={{ display: "block", padding: "12px 14px", borderRadius: 8, background: "#f0f9ff", border: "1px solid #bae6fd", textDecoration: "none", color: "inherit" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{e.diagnosis || "Tanı yok"}</span>
                    <span style={{ fontSize: 12, color: "#888" }}>{e.date}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                    <span style={{ fontSize: 12, color: "#555" }}>{e.treatment_plan || "—"}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#10b981" }}>{Number(e.total_cost || 0).toLocaleString("tr-TR")} TL</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h2 style={{ fontSize: 15, fontWeight: "bold", margin: 0 }}>💉 Aşı Geçmişi</h2>
            <Link href={`/vet/asi/yeni?patient=${id}`} style={{ fontSize: 12, color: "#0ea5e9", textDecoration: "none" }}>+ Yeni</Link>
          </div>
          {vaccines.length === 0 ? (
            <p style={{ color: "#9ca3af", fontSize: 13, textAlign: "center", padding: "16px 0" }}>Henüz aşı kaydı yok.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  {["Aşı Adı", "Uygulama Tarihi", "Sonraki Tarih", "Seri/Batch"].map((h) => (
                    <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 12, color: "#555", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vaccines.map((v) => {
                  const overdue = v.next_due_date && new Date(v.next_due_date) < new Date();
                  return (
                    <tr key={v.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "10px 12px", fontWeight: 600, fontSize: 13 }}>{v.vaccine_name}</td>
                      <td style={{ padding: "10px 12px", fontSize: 13, color: "#555" }}>{v.administered_date || "—"}</td>
                      <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: overdue ? "#ef4444" : "#10b981" }}>{v.next_due_date || "—"}</td>
                      <td style={{ padding: "10px 12px", fontSize: 12, color: "#888" }}>{v.batch_number || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "white", borderRadius: 12, padding: 18, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
      <h2 style={{ fontSize: 14, fontWeight: "bold", marginBottom: 12 }}>{title}</h2>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 13 }}>
      <span style={{ color: "#888", minWidth: 70 }}>{label}:</span>
      <span style={{ color: "#374151" }}>{value}</span>
    </div>
  );
}
