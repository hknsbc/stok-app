"use client";
import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import { useRouter, useSearchParams } from "next/navigation";

type Patient = { id: string; pet_name: string; owner_name: string };

function ExamFormInner() {
  const router = useRouter();
  const params = useSearchParams();
  const prePatient = params.get("patient") ?? "";

  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientId, setPatientId] = useState(prePatient);
  const [complaint, setComplaint] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatmentPlan, setTreatmentPlan] = useState("");
  const [medicinesUsed, setMedicinesUsed] = useState("");
  const [laborCost, setLaborCost] = useState("0");
  const [medicineCost, setMedicineCost] = useState("0");
  const [prescription, setPrescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from("profiles").select("tenant_id").eq("id", user.id).single();
      if (!profile?.tenant_id) return;
      const { data } = await supabase.from("vet_patients").select("id,pet_name,owner_name").eq("tenant_id", profile.tenant_id).order("pet_name");
      setPatients(data ?? []);
    };
    load();
  }, []);

  const total = (Number(laborCost) || 0) + (Number(medicineCost) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) { alert("Hasta seçiniz."); return; }
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    const { data: profile } = await supabase.from("profiles").select("tenant_id").eq("id", user.id).single();
    if (!profile?.tenant_id) { setSaving(false); return; }

    const patient = patients.find((p) => p.id === patientId);
    const { error } = await supabase.from("vet_examinations").insert({
      tenant_id: profile.tenant_id,
      patient_id: patientId,
      pet_name: patient?.pet_name ?? "",
      owner_name: patient?.owner_name ?? "",
      complaint,
      diagnosis,
      treatment_plan: treatmentPlan,
      medicines_used: medicinesUsed ? medicinesUsed.split(",").map((s) => s.trim()) : [],
      labor_cost: Number(laborCost) || 0,
      medicine_cost: Number(medicineCost) || 0,
      total_cost: total,
      prescription,
      date,
      status: "tamamlandı",
    });

    if (error) { alert(`Hata: ${error.message}`); setSaving(false); return; }
    router.push(patientId ? `/vet/hastalar/${patientId}` : "/vet/muayene");
  };

  const inp: React.CSSProperties = { width: "100%", padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" };
  const lbl: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 4 };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <h1 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 24 }}>🩺 Yeni Muayene</h1>
        <form onSubmit={handleSubmit}>
          <Card title="🐾 Hasta Seçimi">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={lbl}>Hasta *</label>
                <select style={inp} value={patientId} onChange={(e) => setPatientId(e.target.value)} required>
                  <option value="">— Hasta seçin —</option>
                  {patients.map((p) => <option key={p.id} value={p.id}>{p.pet_name} ({p.owner_name})</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Muayene Tarihi</label>
                <input style={inp} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>
          </Card>

          <Card title="📋 Muayene Bilgileri">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={lbl}>Şikayet</label>
                <textarea style={{ ...inp, height: 70, resize: "vertical" }} value={complaint} onChange={(e) => setComplaint(e.target.value)} placeholder="Hayvanın şikayeti..." />
              </div>
              <div>
                <label style={lbl}>Tanı</label>
                <input style={inp} value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="Üst solunum yolu enfeksiyonu..." />
              </div>
              <div>
                <label style={lbl}>Tedavi Planı</label>
                <textarea style={{ ...inp, height: 70, resize: "vertical" }} value={treatmentPlan} onChange={(e) => setTreatmentPlan(e.target.value)} placeholder="Antibiyotik 7 gün, günde 2 doz..." />
              </div>
              <div>
                <label style={lbl}>Kullanılan İlaçlar (virgülle ayırın)</label>
                <input style={inp} value={medicinesUsed} onChange={(e) => setMedicinesUsed(e.target.value)} placeholder="Amoksisilin, Prednizol..." />
              </div>
            </div>
          </Card>

          <Card title="💰 Maliyet Hesaplama">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={lbl}>İşçilik (TL)</label>
                <input style={inp} type="number" min="0" step="0.01" value={laborCost} onChange={(e) => setLaborCost(e.target.value)} />
              </div>
              <div>
                <label style={lbl}>İlaç / Malzeme (TL)</label>
                <input style={inp} type="number" min="0" step="0.01" value={medicineCost} onChange={(e) => setMedicineCost(e.target.value)} />
              </div>
            </div>
            <div style={{ marginTop: 14, padding: "12px 16px", background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 600, color: "#374151" }}>Toplam Tutar</span>
              <span style={{ fontSize: 18, fontWeight: "bold", color: "#10b981" }}>{total.toLocaleString("tr-TR")} TL</span>
            </div>
          </Card>

          <Card title="📄 Reçete">
            <textarea style={{ ...inp, height: 100, resize: "vertical" }} value={prescription} onChange={(e) => setPrescription(e.target.value)} placeholder="Reçete içeriği..." />
          </Card>

          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: "12px 0", background: saving ? "#e5e7eb" : "#0ea5e9", color: saving ? "#aaa" : "white", border: "none", borderRadius: 8, cursor: saving ? "not-allowed" : "pointer", fontWeight: "bold", fontSize: 15 }}>
              {saving ? "Kaydediliyor..." : "Muayene Kaydet"}
            </button>
            <button type="button" onClick={() => router.back()} style={{ padding: "12px 24px", background: "#f3f4f6", color: "#555", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14 }}>İptal</button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "white", borderRadius: 12, padding: 20, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
      <h2 style={{ fontSize: 14, fontWeight: "bold", marginBottom: 14, color: "#374151" }}>{title}</h2>
      {children}
    </div>
  );
}

export default function ExaminationForm() {
  return <Suspense fallback={null}><ExamFormInner /></Suspense>;
}
