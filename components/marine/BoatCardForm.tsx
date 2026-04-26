"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";

export type BoatCardData = {
  id?: string;
  name: string;
  model: string;
  engine_type: string;
  serial_number: string;
  owner_name: string;
  owner_phone: string;
  marina: string;
  notes: string;
};

const EMPTY: BoatCardData = {
  name: "", model: "", engine_type: "", serial_number: "",
  owner_name: "", owner_phone: "", marina: "", notes: "",
};

const ENGINE_TYPES = ["Dizel İçten Takma", "Benzin İçten Takma", "Dıştan Takma", "Elektrik", "Hybrid", "Yelkenli"];

const inp: React.CSSProperties = {
  padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: 8,
  width: "100%", fontSize: 14, boxSizing: "border-box", outline: "none",
  background: "white",
};
const lbl: React.CSSProperties = {
  fontSize: 12, color: "#64748b", marginBottom: 4, display: "block", fontWeight: 600,
  textTransform: "uppercase", letterSpacing: 0.4,
};
const section: React.CSSProperties = {
  fontSize: 13, fontWeight: 700, color: "#06b6d4",
  margin: "4px 0 10px", paddingBottom: 6,
  borderBottom: "2px solid #e0f7fa",
};

export default function BoatCardForm({ initialData }: { initialData?: BoatCardData }) {
  const router = useRouter();
  const isEdit = !!initialData?.id;
  const [form, setForm] = useState<BoatCardData>(initialData ?? EMPTY);
  const [saving, setSaving] = useState(false);

  const set = (field: keyof BoatCardData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name,
      model: form.model || null,
      engine_type: form.engine_type || null,
      serial_number: form.serial_number || null,
      owner_name: form.owner_name,
      owner_phone: form.owner_phone || null,
      marina: form.marina || null,
      notes: form.notes || null,
    };

    if (isEdit) {
      const { error } = await supabase.from("boat_cards").update(payload).eq("id", initialData!.id!);
      if (error) { alert("Hata: " + error.message); setSaving(false); return; }
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { alert("Giriş gerekli"); setSaving(false); return; }
      const { data: profile } = await supabase
        .from("profiles").select("tenant_id").eq("id", user.id).single();
      if (!profile?.tenant_id) { alert("Tenant bulunamadı"); setSaving(false); return; }
      const { error } = await supabase.from("boat_cards").insert({ ...payload, tenant_id: profile.tenant_id });
      if (error) { alert("Hata: " + error.message); setSaving(false); return; }
    }
    router.push("/marine/tekne");
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 580 }}>
        <h1 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 24, color: "#0c2340", display: "flex", alignItems: "center", gap: 10 }}>
          ⚓ {isEdit ? "Tekne Kartı Düzenle" : "Yeni Tekne Kartı"}
        </h1>
        <form onSubmit={handleSave} style={{
          background: "white", padding: 28, borderRadius: 14,
          boxShadow: "0 2px 12px rgba(6,182,212,0.1)",
          border: "1px solid #e0f7fa",
          display: "flex", flexDirection: "column", gap: 14,
        }}>
          <p style={section}>🚢 Tekne Bilgileri</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}>Tekne Adı *</label>
              <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} required style={inp} />
            </div>
            <div>
              <label style={lbl}>Model</label>
              <input type="text" value={form.model} onChange={(e) => set("model", e.target.value)} placeholder="örn: Beneteau 35" style={inp} />
            </div>
            <div>
              <label style={lbl}>Motor Tipi</label>
              <select value={form.engine_type} onChange={(e) => set("engine_type", e.target.value)} style={{ ...inp }}>
                <option value="">Seçin</option>
                {ENGINE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Seri / Motor No</label>
              <input type="text" value={form.serial_number} onChange={(e) => set("serial_number", e.target.value)} placeholder="SN-xxxx" style={inp} />
            </div>
          </div>

          <p style={section}>👤 Sahip Bilgileri</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}>Sahip Adı *</label>
              <input type="text" value={form.owner_name} onChange={(e) => set("owner_name", e.target.value)} required style={inp} />
            </div>
            <div>
              <label style={lbl}>WhatsApp / Telefon</label>
              <input type="tel" value={form.owner_phone} onChange={(e) => set("owner_phone", e.target.value)} placeholder="05xx..." style={inp} />
            </div>
          </div>

          <div>
            <label style={lbl}>Marina / Bağlama Yeri</label>
            <input type="text" value={form.marina} onChange={(e) => set("marina", e.target.value)} placeholder="örn: Kalamış Marina D-14" style={inp} />
          </div>

          <div>
            <label style={lbl}>Notlar</label>
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3}
              placeholder="Özel notlar, alerji, tercihler..." style={{ ...inp, resize: "vertical" }} />
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button type="submit" disabled={saving} style={{
              flex: 1, padding: "11px 0", background: "#06b6d4", color: "white",
              border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold", fontSize: 15,
            }}>
              {saving ? "Kaydediliyor..." : isEdit ? "Güncelle" : "Kaydet"}
            </button>
            <button type="button" onClick={() => router.push("/marine/tekne")} style={{
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
