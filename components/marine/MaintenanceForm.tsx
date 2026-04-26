"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";

export type MaintenanceData = {
  id?: string;
  boat_id: string;
  description: string;
  labor_hours: string;
  labor_cost: string;
  parts_cost: string;
  status: string;
  date: string;
  notes: string;
};

const EMPTY: MaintenanceData = {
  boat_id: "", description: "", labor_hours: "0",
  labor_cost: "0", parts_cost: "0",
  status: "open", date: new Date().toISOString().split("T")[0], notes: "",
};

const STATUS_OPTIONS = [
  { value: "open", label: "Açık" },
  { value: "pending_parts", label: "Parça Bekliyor" },
  { value: "completed", label: "Tamamlandı" },
];

const inp: React.CSSProperties = {
  padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: 8,
  width: "100%", fontSize: 14, boxSizing: "border-box", outline: "none", background: "white",
};
const lbl: React.CSSProperties = {
  fontSize: 12, color: "#64748b", marginBottom: 4, display: "block",
  fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4,
};

export default function MaintenanceForm({ initialData }: { initialData?: MaintenanceData }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preBoat = searchParams.get("boat") ?? "";
  const isEdit = !!initialData?.id;

  const [form, setForm] = useState<MaintenanceData>(() => ({
    ...(initialData ?? EMPTY),
    boat_id: initialData?.boat_id ?? preBoat,
  }));
  const [boats, setBoats] = useState<{ id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("boat_cards").select("id, name").order("name")
      .then(({ data }) => { if (data) setBoats(data); });
  }, []);

  const set = (field: keyof MaintenanceData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const totalCost = (Number(form.labor_cost) + Number(form.parts_cost)).toFixed(2);

  const handleSave = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      boat_id: form.boat_id || null,
      description: form.description,
      labor_hours: Number(form.labor_hours),
      labor_cost: Number(form.labor_cost),
      parts_cost: Number(form.parts_cost),
      status: form.status,
      date: form.date,
      notes: form.notes || null,
    };

    if (isEdit) {
      const { error } = await supabase.from("maintenance_records").update(payload).eq("id", initialData!.id!);
      if (error) { alert("Hata: " + error.message); setSaving(false); return; }
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { alert("Giriş gerekli"); setSaving(false); return; }
      const { data: profile } = await supabase.from("profiles").select("tenant_id").eq("id", user.id).single();
      if (!profile?.tenant_id) { alert("Tenant bulunamadı"); setSaving(false); return; }
      const { error } = await supabase.from("maintenance_records").insert({ ...payload, tenant_id: profile.tenant_id });
      if (error) { alert("Hata: " + error.message); setSaving(false); return; }
    }
    router.push("/marine/bakim");
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 560 }}>
        <h1 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 24, color: "#0c2340", display: "flex", alignItems: "center", gap: 10 }}>
          🔧 {isEdit ? "Bakım Kaydı Düzenle" : "Yeni Bakım Kaydı"}
        </h1>
        <form onSubmit={handleSave} style={{
          background: "white", padding: 28, borderRadius: 14,
          boxShadow: "0 2px 12px rgba(6,182,212,0.1)", border: "1px solid #e0f7fa",
          display: "flex", flexDirection: "column", gap: 14,
        }}>
          <div>
            <label style={lbl}>Tekne *</label>
            <select value={form.boat_id} onChange={(e) => set("boat_id", e.target.value)} required style={{ ...inp }}>
              <option value="">Tekne Seçin</option>
              {boats.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Yapılan İş / Açıklama *</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} required rows={3}
              placeholder="örn: Motor yağı değişimi, filtre bakımı" style={{ ...inp, resize: "vertical" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}>Durum</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)} style={{ ...inp }}>
                {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Tarih</label>
              <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} style={inp} />
            </div>
            <div>
              <label style={lbl}>İşçilik Süresi (saat)</label>
              <input type="number" step="0.5" min="0" value={form.labor_hours} onChange={(e) => set("labor_hours", e.target.value)} style={inp} />
            </div>
            <div>
              <label style={lbl}>İşçilik Maliyeti (₺)</label>
              <input type="number" step="0.01" min="0" value={form.labor_cost} onChange={(e) => set("labor_cost", e.target.value)} style={inp} />
            </div>
            <div>
              <label style={lbl}>Parça/Malzeme Maliyeti (₺)</label>
              <input type="number" step="0.01" min="0" value={form.parts_cost} onChange={(e) => set("parts_cost", e.target.value)} style={inp} />
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <div style={{ background: "#e0f7fa", borderRadius: 8, padding: "10px 16px", flex: 1 }}>
                <div style={{ fontSize: 11, color: "#0891b2", fontWeight: 700, textTransform: "uppercase" }}>Toplam</div>
                <div style={{ fontSize: 22, fontWeight: "bold", color: "#06b6d4" }}>₺{totalCost}</div>
              </div>
            </div>
          </div>
          <div>
            <label style={lbl}>Notlar</label>
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2}
              placeholder="Kullanılan parçalar, özel notlar..." style={{ ...inp, resize: "vertical" }} />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button type="submit" disabled={saving} style={{
              flex: 1, padding: "11px 0", background: "#06b6d4", color: "white",
              border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold", fontSize: 15,
            }}>
              {saving ? "Kaydediliyor..." : isEdit ? "Güncelle" : "Kaydet"}
            </button>
            <button type="button" onClick={() => router.push("/marine/bakim")} style={{
              flex: 1, padding: "11px 0", background: "#f1f5f9",
              border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600,
            }}>
              İptal
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
