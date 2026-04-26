"use client";
import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import { useSearchParams } from "next/navigation";

type Vaccine = {
  id: string; pet_name: string; owner_name: string; owner_phone: string;
  vaccine_name: string; administered_date: string; next_due_date: string;
  batch_number: string; notes: string; patient_id: string;
};
type Patient = { id: string; pet_name: string; owner_name: string; owner_phone: string };

function sendWhatsApp(phone: string, petName: string, vaccineName: string, dueDate: string) {
  const clean = phone.replace(/\D/g, "");
  const num = clean.startsWith("0") ? "90" + clean.slice(1) : clean.startsWith("90") ? clean : "90" + clean;
  const text = encodeURIComponent(`Sayın hayvan sahibi,\n\n${petName} adlı hayvanınızın *${vaccineName}* tarihi ${dueDate} olarak yaklaşmaktadır.\n\nRandevu almak için kliniğimizi arayabilirsiniz. 🐾`);
  window.open(`https://wa.me/${num}?text=${text}`, "_blank");
}

function VaccineScheduleInner() {
  const params = useSearchParams();
  const prePatient = params.get("patient") ?? "";

  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filter, setFilter] = useState<"all" | "upcoming" | "overdue">("upcoming");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [patientId, setPatientId] = useState(prePatient);
  const [vaccineName, setVaccineName] = useState("");
  const [administeredDate, setAdministeredDate] = useState(new Date().toISOString().split("T")[0]);
  const [nextDueDate, setNextDueDate] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase.from("profiles").select("tenant_id").eq("id", user.id).single();
    if (!profile?.tenant_id) return;
    const [vRes, pRes] = await Promise.all([
      supabase.from("vet_vaccines").select("*").eq("tenant_id", profile.tenant_id).order("next_due_date"),
      supabase.from("vet_patients").select("id,pet_name,owner_name,owner_phone").eq("tenant_id", profile.tenant_id).order("pet_name"),
    ]);
    setVaccines(vRes.data ?? []);
    setPatients(pRes.data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const today = new Date().toISOString().split("T")[0];
  const in30 = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];

  const filtered = vaccines.filter((v) => {
    if (filter === "overdue") return v.next_due_date && v.next_due_date < today;
    if (filter === "upcoming") return v.next_due_date && v.next_due_date >= today && v.next_due_date <= in30;
    return true;
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !vaccineName) { alert("Hasta ve aşı adı zorunludur."); return; }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    const { data: profile } = await supabase.from("profiles").select("tenant_id").eq("id", user.id).single();
    const patient = patients.find((p) => p.id === patientId);
    const { error } = await supabase.from("vet_vaccines").insert({
      tenant_id: profile?.tenant_id,
      patient_id: patientId,
      pet_name: patient?.pet_name ?? "",
      owner_name: patient?.owner_name ?? "",
      owner_phone: patient?.owner_phone ?? "",
      vaccine_name: vaccineName,
      administered_date: administeredDate,
      next_due_date: nextDueDate || null,
      batch_number: batchNumber,
      notes,
    });
    if (error) { alert(`Hata: ${error.message}`); setSaving(false); return; }
    setShowForm(false);
    setVaccineName(""); setNextDueDate(""); setBatchNumber(""); setNotes("");
    await load();
    setSaving(false);
  };

  const inp: React.CSSProperties = { width: "100%", padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" };

  return (
    <DashboardLayout>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h1 style={{ fontSize: 24, fontWeight: "bold" }}>💉 Aşı Takvimi</h1>
          <button onClick={() => setShowForm(!showForm)} style={{ padding: "10px 20px", background: "#f59e0b", color: "white", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: "bold", fontSize: 14 }}>
            {showForm ? "İptal" : "+ Aşı Ekle"}
          </button>
        </div>

        {showForm && (
          <div style={{ background: "white", borderRadius: 12, padding: 20, marginBottom: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <h2 style={{ fontSize: 15, fontWeight: "bold", marginBottom: 16 }}>Yeni Aşı Kaydı</h2>
            <form onSubmit={handleSave}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 4 }}>Hasta *</label>
                  <select style={inp} value={patientId} onChange={(e) => setPatientId(e.target.value)} required>
                    <option value="">— Hasta seçin —</option>
                    {patients.map((p) => <option key={p.id} value={p.id}>{p.pet_name} ({p.owner_name})</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 4 }}>Aşı Adı *</label>
                  <input style={inp} value={vaccineName} onChange={(e) => setVaccineName(e.target.value)} placeholder="Kuduz Aşısı" required />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 4 }}>Uygulama Tarihi</label>
                  <input style={inp} type="date" value={administeredDate} onChange={(e) => setAdministeredDate(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 4 }}>Sonraki Aşı Tarihi</label>
                  <input style={inp} type="date" value={nextDueDate} onChange={(e) => setNextDueDate(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 4 }}>Seri / Batch No</label>
                  <input style={inp} value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} placeholder="LOT-2026-001" />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 4 }}>Notlar</label>
                  <input style={inp} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ek notlar..." />
                </div>
              </div>
              <button type="submit" disabled={saving} style={{ marginTop: 14, padding: "10px 24px", background: saving ? "#e5e7eb" : "#f59e0b", color: saving ? "#aaa" : "white", border: "none", borderRadius: 8, cursor: saving ? "not-allowed" : "pointer", fontWeight: "bold" }}>
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </form>
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {(["upcoming", "overdue", "all"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "7px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: filter === f ? "#f59e0b" : "#f3f4f6", color: filter === f ? "white" : "#555" }}>
              {f === "upcoming" ? "Yaklaşan (30 gün)" : f === "overdue" ? "Gecikmiş" : "Tümü"}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {loading ? <div style={{ textAlign: "center", padding: 40, color: "#888" }}>Yükleniyor...</div> : filtered.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "52px 24px", background: "white", borderRadius: 12 }}>
              <div style={{ fontSize: 36 }}>💉</div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#374151", margin: 0 }}>Bu kategoride aşı kaydı yok.</p>
            </div>
          ) : filtered.map((v) => {
            const overdue = v.next_due_date && v.next_due_date < today;
            const daysLeft = v.next_due_date ? Math.ceil((new Date(v.next_due_date).getTime() - Date.now()) / 86400000) : null;
            return (
              <div key={v.id} style={{ background: "white", borderRadius: 12, padding: 18, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", border: `1px solid ${overdue ? "#fecaca" : "#fde68a"}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontWeight: "bold", fontSize: 15, marginBottom: 4 }}>{v.pet_name} <span style={{ fontSize: 13, color: "#888", fontWeight: "normal" }}>— {v.vaccine_name}</span></div>
                  <div style={{ fontSize: 13, color: "#555" }}>👤 {v.owner_name}{v.batch_number ? ` · ${v.batch_number}` : ""}</div>
                  {v.administered_date && <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>Uygulandı: {v.administered_date}</div>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {v.next_due_date && (
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, color: "#888" }}>Sonraki aşı</div>
                      <div style={{ fontWeight: "bold", color: overdue ? "#ef4444" : "#d97706" }}>{v.next_due_date}</div>
                      {daysLeft !== null && <div style={{ fontSize: 11, color: overdue ? "#ef4444" : "#888" }}>{overdue ? `${Math.abs(daysLeft)} gün gecikti` : `${daysLeft} gün kaldı`}</div>}
                    </div>
                  )}
                  {v.owner_phone && (
                    <button onClick={() => sendWhatsApp(v.owner_phone, v.pet_name, v.vaccine_name, v.next_due_date)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "7px 14px", background: "#25d366", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: "bold", whiteSpace: "nowrap" }}>
                      💬 WhatsApp
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function VaccineSchedule() {
  return <Suspense fallback={null}><VaccineScheduleInner /></Suspense>;
}
