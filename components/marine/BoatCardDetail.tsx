"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import { useRouter } from "next/navigation";
import { maintenanceReminderLink } from "@/lib/whatsapp";

type BoatCard = {
  id: string;
  name: string;
  model: string | null;
  engine_type: string | null;
  serial_number: string | null;
  owner_name: string;
  owner_phone: string | null;
  marina: string | null;
  notes: string | null;
  created_at: string;
};

type MaintenanceRecord = {
  id: string;
  description: string;
  status: string;
  date: string;
  total_cost: number;
  labor_cost: number;
  parts_cost: number;
};

const STATUS_LABEL: Record<string, { label: string; bg: string; color: string }> = {
  open: { label: "Açık", bg: "#eff6ff", color: "#2563eb" },
  pending_parts: { label: "Parça Bekliyor", bg: "#fffbeb", color: "#d97706" },
  completed: { label: "Tamamlandı", bg: "#f0fdf4", color: "#16a34a" },
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 12, padding: "9px 0", borderBottom: "1px solid #f1f5f9" }}>
      <span style={{ minWidth: 170, fontSize: 12, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</span>
      <span style={{ fontSize: 13, color: "#0f172a", flex: 1 }}>{value ?? "—"}</span>
    </div>
  );
}

export default function BoatCardDetail({ id }: { id: string }) {
  const router = useRouter();
  const [boat, setBoat] = useState<BoatCard | null>(null);
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [boatRes, recRes] = await Promise.all([
        supabase.from("boat_cards").select("*").eq("id", id).single(),
        supabase.from("maintenance_records").select("id, description, status, date, labor_cost, parts_cost")
          .eq("boat_id", id).order("date", { ascending: false }).limit(10),
      ]);
      if (boatRes.error || !boatRes.data) { alert("Tekne kartı bulunamadı."); router.push("/marine/tekne"); return; }
      setBoat(boatRes.data);
      if (recRes.data) {
        setRecords(recRes.data.map((r) => ({ ...r, total_cost: (r.labor_cost ?? 0) + (r.parts_cost ?? 0) })));
      }
      setLoading(false);
    };
    fetch();
  }, [id, router]);

  const handleDelete = async () => {
    if (!confirm("Bu tekne kartını silmek istediğinizden emin misiniz?")) return;
    await supabase.from("boat_cards").delete().eq("id", id);
    router.push("/marine/tekne");
  };

  if (loading) return <DashboardLayout><p style={{ color: "#94a3b8" }}>Yükleniyor...</p></DashboardLayout>;
  if (!boat) return null;

  const reminderLink = boat.owner_phone
    ? maintenanceReminderLink({ ownerName: boat.owner_name, ownerPhone: boat.owner_phone, boatName: boat.name, maintenanceType: "Periyodik Bakım", dueDate: new Date().toLocaleDateString("tr-TR") })
    : null;

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 680 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 68, height: 68, borderRadius: 14, background: "linear-gradient(135deg, #0c2340, #06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>
              🚢
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: "bold", color: "#0c2340", margin: 0 }}>{boat.name}</h1>
              <p style={{ color: "#94a3b8", margin: "4px 0 0", fontSize: 14 }}>
                {boat.engine_type}{boat.model ? ` · ${boat.model}` : ""}
              </p>
            </div>
          </div>
          {reminderLink && (
            <a href={reminderLink} target="_blank" rel="noopener noreferrer" style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "9px 16px", background: "#25d366", color: "white",
              borderRadius: 8, textDecoration: "none", fontWeight: 700, fontSize: 13,
            }}>
              📲 WhatsApp Hatırlatma
            </a>
          )}
        </div>

        {/* Details */}
        <div style={{ background: "white", borderRadius: 12, padding: "8px 20px", boxShadow: "0 2px 12px rgba(6,182,212,0.08)", border: "1px solid #e0f7fa", marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#06b6d4", margin: "14px 0 4px", textTransform: "uppercase", letterSpacing: 0.5 }}>Tekne Bilgileri</p>
          <Row label="Model" value={boat.model} />
          <Row label="Motor Tipi" value={boat.engine_type} />
          <Row label="Seri / Motor No" value={boat.serial_number ? <span style={{ fontFamily: "monospace", background: "#e0f7fa", padding: "1px 8px", borderRadius: 4 }}>{boat.serial_number}</span> : null} />
          <Row label="Marina / Bağlama" value={boat.marina} />

          <p style={{ fontSize: 11, fontWeight: 700, color: "#06b6d4", margin: "14px 0 4px", textTransform: "uppercase", letterSpacing: 0.5 }}>Sahip Bilgileri</p>
          <Row label="Sahip" value={boat.owner_name} />
          <Row label="Telefon" value={boat.owner_phone} />

          {boat.notes && (
            <>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#06b6d4", margin: "14px 0 4px", textTransform: "uppercase", letterSpacing: 0.5 }}>Notlar</p>
              <div style={{ padding: "9px 0", borderBottom: "1px solid #f1f5f9" }}>
                <p style={{ fontSize: 13, color: "#0f172a", margin: 0, whiteSpace: "pre-wrap" }}>{boat.notes}</p>
              </div>
            </>
          )}
          <p style={{ fontSize: 11, color: "#cbd5e1", margin: "10px 0 6px" }}>
            Oluşturulma: {new Date(boat.created_at).toLocaleDateString("tr-TR")}
          </p>
        </div>

        {/* Maintenance history */}
        <div style={{ background: "white", borderRadius: 12, padding: "16px 20px", boxShadow: "0 2px 12px rgba(6,182,212,0.08)", border: "1px solid #e0f7fa", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0c2340", margin: 0 }}>🔧 Bakım Geçmişi</h2>
            <button onClick={() => router.push(`/marine/bakim/ekle?boat=${id}`)}
              style={{ padding: "6px 14px", background: "#06b6d4", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
              + Bakım Ekle
            </button>
          </div>
          {records.length === 0 ? (
            <p style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>Henüz bakım kaydı yok.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {records.map((r) => {
                const s = STATUS_LABEL[r.status] ?? STATUS_LABEL.open;
                return (
                  <div key={r.id} onClick={() => router.push(`/marine/bakim/${r.id}`)}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 8, background: "#f8fafc", border: "1px solid #e2e8f0", cursor: "pointer" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{r.description}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>{r.date}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#0c2340" }}>₺{r.total_cost.toFixed(2)}</span>
                      <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: s.bg, color: s.color }}>{s.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => router.push(`/marine/tekne/${id}/duzenle`)}
            style={{ flex: 1, padding: "11px 0", background: "#06b6d4", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold" }}>
            Düzenle
          </button>
          <button onClick={handleDelete}
            style={{ flex: 1, padding: "11px 0", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold" }}>
            Sil
          </button>
          <button onClick={() => router.push("/marine/tekne")}
            style={{ flex: 1, padding: "11px 0", background: "#f1f5f9", border: "none", borderRadius: 8, cursor: "pointer" }}>
            Geri
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
