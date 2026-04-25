"use client";
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useMode } from "@/lib/ModeContext";

const PATIENTS = [
  { id: "P-001", name: "Tekir", species: "Kedi", owner: "Ayşe Kaya", age: "3 yaş", lastVisit: "12 Nis 2026" },
  { id: "P-002", name: "Karabaş", species: "Köpek", owner: "Murat Demir", age: "5 yaş", lastVisit: "18 Nis 2026" },
  { id: "P-003", name: "Pamuk", species: "Tavşan", owner: "Fatma Yıldız", age: "1 yaş", lastVisit: "20 Nis 2026" },
];

const VACCINES = [
  { patient: "Tekir", vaccine: "Kuduz Aşısı", due: "28 Nis 2026", owner: "Ayşe Kaya", phone: "+90 532 111 2233", urgent: true },
  { patient: "Karabaş", vaccine: "Karma Aşı (DHPP)", due: "5 May 2026", owner: "Murat Demir", phone: "+90 542 333 4455", urgent: false },
  { patient: "Pamuk", vaccine: "Miyozis Aşısı", due: "10 May 2026", owner: "Fatma Yıldız", phone: "+90 555 666 7788", urgent: false },
];

const APPOINTMENTS = [
  { time: "09:00", patient: "Tekir", type: "Kontrol", vet: "Dr. Sercan Ay", status: "Bekleniyor" },
  { time: "10:30", patient: "Karabaş", type: "Aşı", vet: "Dr. Sercan Ay", status: "Tamamlandı" },
  { time: "13:00", patient: "Minnoş", type: "Operasyon", vet: "Dr. Elif Tan", status: "Bekleniyor" },
  { time: "15:00", patient: "Pamuk", type: "Diş Bakımı", vet: "Dr. Sercan Ay", status: "İptal" },
];

const TREATMENTS = [
  { patient: "Tekir", date: "18 Nis", diagnosis: "Üst solunum yolu enfeksiyonu", treatment: "Antibiyotik + Damla" },
  { patient: "Karabaş", date: "15 Nis", diagnosis: "Deri tahrişi", treatment: "Kortikosteroid krem + diyet" },
  { patient: "Pamuk", date: "20 Nis", diagnosis: "Sindirim bozukluğu", treatment: "Probiyotik + diyet düzeni" },
];

const STATS = [
  { label: "Bugünkü Randevu", value: "8", color: "#0ea5e9", icon: "📅" },
  { label: "Aktif Hasta", value: "124", color: "#8b5cf6", icon: "🐾" },
  { label: "Bekleyen Aşı", value: "3", color: "#f59e0b", icon: "💉" },
  { label: "Bugünkü Operasyon", value: "1", color: "#ef4444", icon: "🏥" },
];

const STATUS_COLORS: Record<string, string> = {
  Bekleniyor: "#f59e0b",
  Tamamlandı: "#22c55e",
  İptal: "#ef4444",
};

export default function VetDashboard() {
  const { theme } = useMode();
  const [selectedPatient, setSelectedPatient] = useState<typeof PATIENTS[0] | null>(null);

  const sendWhatsApp = (phone: string, patient: string, vaccine: string, due: string) => {
    const msg = encodeURIComponent(
      `Sayın hayvan sahibi, ${patient} adlı hayvanınızın ${vaccine} tarihi ${due} olarak yaklaşmaktadır. Randevu almak için kliniğimizi arayabilirsiniz.`
    );
    window.open(`https://wa.me/${phone.replace(/\D/g, "")}?text=${msg}`, "_blank");
  };

  return (
    <DashboardLayout>
      <div style={{ padding: "0 0 32px" }}>
        {/* Header */}
        <div style={{ marginBottom: 28, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 32 }}>🏥</span>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: "bold", color: "#0c4a6e", margin: 0 }}>
              Veteriner Klinik Paneli
            </h1>
            <p style={{ color: "#888", margin: 0, fontSize: 14 }}>
              Hasta kayıtları, aşı takibi ve randevu yönetimi
            </p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
          {STATS.map((s) => (
            <div key={s.label} style={{
              background: "white", borderRadius: 12, padding: "18px 20px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              borderLeft: `4px solid ${s.color}`,
            }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: "bold", color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 13, color: "#888" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          {/* Hasta Kartları */}
          <div style={{ background: "white", borderRadius: 14, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <h2 style={{ fontSize: 16, fontWeight: "bold", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <span>🐾</span> Hasta Kartları
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {PATIENTS.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPatient(selectedPatient?.id === p.id ? null : p)}
                  style={{
                    padding: "12px 14px", borderRadius: 10, cursor: "pointer",
                    border: `1px solid ${selectedPatient?.id === p.id ? theme.primary : "#e5e7eb"}`,
                    background: selectedPatient?.id === p.id ? "#f0f9ff" : "#fafafa",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontWeight: "bold", fontSize: 14 }}>{p.name}</span>
                      <span style={{ color: "#888", fontSize: 12, marginLeft: 8 }}>{p.species}</span>
                    </div>
                    <span style={{ fontSize: 12, color: "#888" }}>{p.id}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>
                    👤 {p.owner} · {p.age} · Son ziyaret: {p.lastVisit}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Randevu Listesi */}
          <div style={{ background: "white", borderRadius: 14, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <h2 style={{ fontSize: 16, fontWeight: "bold", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <span>📅</span> Bugünün Randevuları
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {APPOINTMENTS.map((a, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 14px", borderRadius: 8, background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                }}>
                  <span style={{
                    fontSize: 13, fontWeight: "bold", color: theme.primary,
                    minWidth: 44,
                  }}>
                    {a.time}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{a.patient} — {a.type}</div>
                    <div style={{ fontSize: 12, color: "#888" }}>{a.vet}</div>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: "bold", padding: "2px 8px", borderRadius: 20,
                    background: STATUS_COLORS[a.status] + "22",
                    color: STATUS_COLORS[a.status],
                  }}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Aşı Takvimi + WhatsApp */}
          <div style={{ background: "white", borderRadius: 14, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <h2 style={{ fontSize: 16, fontWeight: "bold", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <span>💉</span> Aşı Takvimi
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {VACCINES.map((v, i) => (
                <div key={i} style={{
                  padding: "12px 14px", borderRadius: 8,
                  background: v.urgent ? "#fef2f2" : "#f9fafb",
                  border: `1px solid ${v.urgent ? "#fecaca" : "#e5e7eb"}`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <div>
                      <span style={{ fontWeight: "bold", fontSize: 14 }}>{v.patient}</span>
                      <span style={{ color: "#888", fontSize: 12, marginLeft: 8 }}>{v.vaccine}</span>
                    </div>
                    <span style={{
                      fontSize: 12, fontWeight: "bold",
                      color: v.urgent ? "#ef4444" : "#f59e0b",
                    }}>
                      {v.due}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "#888" }}>{v.owner} · {v.phone}</span>
                    <button
                      onClick={() => sendWhatsApp(v.phone, v.patient, v.vaccine, v.due)}
                      style={{
                        display: "flex", alignItems: "center", gap: 4,
                        padding: "4px 12px", background: "#25d366",
                        color: "white", border: "none", borderRadius: 6,
                        cursor: "pointer", fontSize: 12, fontWeight: "bold",
                      }}
                    >
                      <span>💬</span> WhatsApp
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tedavi Geçmişi */}
          <div style={{ background: "white", borderRadius: 14, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <h2 style={{ fontSize: 16, fontWeight: "bold", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <span>📋</span> Tedavi Geçmişi
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {TREATMENTS.map((tr, i) => (
                <div key={i} style={{
                  padding: "12px 14px", borderRadius: 8,
                  background: "#f0f9ff", border: "1px solid #bae6fd",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontWeight: "bold", fontSize: 14 }}>{tr.patient}</span>
                    <span style={{ fontSize: 12, color: "#888" }}>{tr.date}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "#0c4a6e", marginBottom: 3 }}>
                    🔍 {tr.diagnosis}
                  </div>
                  <div style={{ fontSize: 12, color: "#555" }}>
                    💊 {tr.treatment}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
