"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import { useRouter } from "next/navigation";
import { maintenanceCompleteLink } from "@/lib/whatsapp";

type Record_ = {
  id: string;
  boat_id: string | null;
  description: string;
  labor_hours: number;
  labor_cost: number;
  parts_cost: number;
  status: string;
  date: string;
  notes: string | null;
};

type Boat = { id: string; name: string; owner_name: string; owner_phone: string | null };

const STATUS: Record<string, { label: string; bg: string; color: string }> = {
  open: { label: "Açık", bg: "#eff6ff", color: "#2563eb" },
  pending_parts: { label: "Parça Bekliyor", bg: "#fffbeb", color: "#d97706" },
  completed: { label: "Tamamlandı", bg: "#f0fdf4", color: "#16a34a" },
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 12, padding: "9px 0", borderBottom: "1px solid #f1f5f9" }}>
      <span style={{ minWidth: 180, fontSize: 12, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</span>
      <span style={{ fontSize: 13, color: "#0f172a", flex: 1 }}>{value ?? "—"}</span>
    </div>
  );
}

export default function MaintenanceDetail({ id }: { id: string }) {
  const router = useRouter();
  const [record, setRecord] = useState<Record_ | null>(null);
  const [boat, setBoat] = useState<Boat | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase.from("maintenance_records").select("*").eq("id", id).single();
      if (error || !data) { alert("Kayıt bulunamadı."); router.push("/marine/bakim"); return; }
      setRecord(data);
      if (data.boat_id) {
        const { data: b } = await supabase.from("boat_cards").select("id, name, owner_name, owner_phone").eq("id", data.boat_id).single();
        if (b) setBoat(b);
      }
      setLoading(false);
    };
    fetch();
  }, [id, router]);

  const handleDelete = async () => {
    if (!confirm("Bu bakım kaydını silmek istediğinizden emin misiniz?")) return;
    await supabase.from("maintenance_records").delete().eq("id", id);
    router.push("/marine/bakim");
  };

  if (loading) return <DashboardLayout><p style={{ color: "#94a3b8" }}>Yükleniyor...</p></DashboardLayout>;
  if (!record) return null;

  const total = (record.labor_cost ?? 0) + (record.parts_cost ?? 0);
  const s = STATUS[record.status] ?? STATUS.open;
  const waLink = boat?.owner_phone
    ? maintenanceCompleteLink({ ownerName: boat.owner_name, ownerPhone: boat.owner_phone, boatName: boat.name, description: record.description, laborCost: record.labor_cost, partsCost: record.parts_cost, totalCost: total, date: record.date, status: record.status })
    : null;

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 620 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: "bold", color: "#0c2340", margin: 0 }}>🔧 Bakım Detayı</h1>
            <p style={{ color: "#94a3b8", margin: "4px 0 0", fontSize: 13 }}>{record.date} · {boat?.name ?? "Tekne belirtilmemiş"}</p>
          </div>
          <span style={{ padding: "6px 16px", borderRadius: 20, fontSize: 13, fontWeight: 700, background: s.bg, color: s.color }}>{s.label}</span>
        </div>

        {/* Main card */}
        <div style={{ background: "white", borderRadius: 12, padding: "8px 20px", boxShadow: "0 2px 12px rgba(6,182,212,0.08)", border: "1px solid #e0f7fa", marginBottom: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#06b6d4", margin: "14px 0 4px", textTransform: "uppercase", letterSpacing: 0.5 }}>İş Bilgileri</p>
          <Row label="Tekne" value={boat ? <span style={{ fontWeight: 600 }}>{boat.name}</span> : null} />
          <Row label="Açıklama" value={record.description} />
          <Row label="Tarih" value={record.date} />

          <p style={{ fontSize: 11, fontWeight: 700, color: "#06b6d4", margin: "14px 0 4px", textTransform: "uppercase", letterSpacing: 0.5 }}>Maliyet</p>
          <Row label="İşçilik Süresi" value={`${record.labor_hours} saat`} />
          <Row label="İşçilik Maliyeti" value={`₺${(record.labor_cost ?? 0).toFixed(2)}`} />
          <Row label="Parça / Malzeme" value={`₺${(record.parts_cost ?? 0).toFixed(2)}`} />
          <div style={{ padding: "12px 0", display: "flex", justifyContent: "flex-end" }}>
            <div style={{ background: "#e0f7fa", borderRadius: 10, padding: "10px 20px", textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "#0891b2", fontWeight: 700, textTransform: "uppercase" }}>Toplam Maliyet</div>
              <div style={{ fontSize: 26, fontWeight: "bold", color: "#06b6d4" }}>₺{total.toFixed(2)}</div>
            </div>
          </div>

          {record.notes && (
            <>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#06b6d4", margin: "14px 0 4px", textTransform: "uppercase", letterSpacing: 0.5 }}>Notlar</p>
              <div style={{ padding: "9px 0 12px" }}>
                <p style={{ fontSize: 13, color: "#0f172a", margin: 0, whiteSpace: "pre-wrap" }}>{record.notes}</p>
              </div>
            </>
          )}
        </div>

        {/* WhatsApp */}
        {waLink && (
          <a href={waLink} target="_blank" rel="noopener noreferrer" style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "12px 0", background: "#25d366", color: "white",
            borderRadius: 10, textDecoration: "none", fontWeight: 700, fontSize: 15,
            marginBottom: 12,
          }}>
            📲 Müşteriye WhatsApp ile Gönder
          </a>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => router.push(`/marine/bakim/${id}/duzenle`)}
            style={{ flex: 1, padding: "11px 0", background: "#06b6d4", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold" }}>
            Düzenle
          </button>
          <button onClick={handleDelete}
            style={{ flex: 1, padding: "11px 0", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold" }}>
            Sil
          </button>
          <button onClick={() => router.push("/marine/bakim")}
            style={{ flex: 1, padding: "11px 0", background: "#f1f5f9", border: "none", borderRadius: 8, cursor: "pointer" }}>
            Geri
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
