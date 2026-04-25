"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";

export type PetCardData = {
  id?: string;
  owner_name: string;
  owner_phone: string;
  pet_name: string;
  species: string;
  breed: string;
  age: string;
  preferred_food: string;
  loyalty_points: number;
  notes: string;
};

const EMPTY: PetCardData = {
  owner_name: "",
  owner_phone: "",
  pet_name: "",
  species: "",
  breed: "",
  age: "",
  preferred_food: "",
  loyalty_points: 0,
  notes: "",
};

const SPECIES_OPTIONS = ["Kedi", "Köpek", "Kuş", "Balık", "Tavşan", "Hamster", "Diğer"];

const inp: React.CSSProperties = {
  padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 8,
  width: "100%", fontSize: 14, boxSizing: "border-box", outline: "none",
};
const lbl: React.CSSProperties = {
  fontSize: 13, color: "#555", marginBottom: 4, display: "block", fontWeight: 500,
};

export default function PetCardForm({ initialData }: { initialData?: PetCardData }) {
  const router = useRouter();
  const isEdit = !!initialData?.id;
  const [form, setForm] = useState<PetCardData>(initialData ?? EMPTY);
  const [saving, setSaving] = useState(false);

  const set = (field: keyof PetCardData, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setSaving(true);

    if (isEdit) {
      const { error } = await supabase.from("pet_cards").update({
        owner_name: form.owner_name,
        owner_phone: form.owner_phone || null,
        pet_name: form.pet_name,
        species: form.species || null,
        breed: form.breed || null,
        age: form.age || null,
        preferred_food: form.preferred_food || null,
        loyalty_points: Number(form.loyalty_points),
        notes: form.notes || null,
      }).eq("id", initialData!.id!);
      if (error) { alert("Hata: " + error.message); setSaving(false); return; }
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { alert("Giriş gerekli"); setSaving(false); return; }
      const { data: profile } = await supabase
        .from("profiles").select("tenant_id").eq("id", user.id).single();
      if (!profile?.tenant_id) { alert("Tenant bulunamadı"); setSaving(false); return; }

      const { error } = await supabase.from("pet_cards").insert({
        owner_name: form.owner_name,
        owner_phone: form.owner_phone || null,
        pet_name: form.pet_name,
        species: form.species || null,
        breed: form.breed || null,
        age: form.age || null,
        preferred_food: form.preferred_food || null,
        loyalty_points: Number(form.loyalty_points),
        notes: form.notes || null,
        tenant_id: profile.tenant_id,
      });
      if (error) { alert("Hata: " + error.message); setSaving(false); return; }
    }

    router.push("/pet/kart");
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 520 }}>
        <h1 style={{ fontSize: 26, fontWeight: "bold", marginBottom: 24 }}>
          {isEdit ? "🐾 Pet Kartı Düzenle" : "🐾 Yeni Pet Kartı"}
        </h1>
        <form onSubmit={handleSave} style={{
          background: "white", padding: 28, borderRadius: 12,
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          display: "flex", flexDirection: "column", gap: 14,
        }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#f97316", margin: 0 }}>Sahip Bilgileri</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}>Ad Soyad *</label>
              <input type="text" value={form.owner_name} onChange={(e) => set("owner_name", e.target.value)} required style={inp} />
            </div>
            <div>
              <label style={lbl}>Telefon</label>
              <input type="tel" value={form.owner_phone} onChange={(e) => set("owner_phone", e.target.value)} placeholder="05xx..." style={inp} />
            </div>
          </div>

          <p style={{ fontSize: 13, fontWeight: 600, color: "#f97316", margin: "4px 0 0" }}>Hayvan Bilgileri</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}>Hayvan Adı *</label>
              <input type="text" value={form.pet_name} onChange={(e) => set("pet_name", e.target.value)} required style={inp} />
            </div>
            <div>
              <label style={lbl}>Tür</label>
              <select value={form.species} onChange={(e) => set("species", e.target.value)} style={{ ...inp }}>
                <option value="">Seçin</option>
                {SPECIES_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Irk</label>
              <input type="text" value={form.breed} onChange={(e) => set("breed", e.target.value)} placeholder="örn: British Shorthair" style={inp} />
            </div>
            <div>
              <label style={lbl}>Yaş</label>
              <input type="text" value={form.age} onChange={(e) => set("age", e.target.value)} placeholder="örn: 2 yaş" style={inp} />
            </div>
          </div>

          <div>
            <label style={lbl}>Tercih Edilen Mama</label>
            <input type="text" value={form.preferred_food} onChange={(e) => set("preferred_food", e.target.value)} placeholder="örn: Royal Canin Adult" style={inp} />
          </div>

          <div>
            <label style={lbl}>Sadakat Puanı</label>
            <input type="number" value={form.loyalty_points} onChange={(e) => set("loyalty_points", Number(e.target.value))} min="0" style={{ ...inp, width: 140 }} />
          </div>

          <div>
            <label style={lbl}>Notlar</label>
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3}
              placeholder="Alerji, özel notlar..." style={{ ...inp, resize: "vertical" }} />
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button type="submit" disabled={saving} style={{
              flex: 1, padding: "11px 0", background: "#f97316", color: "white",
              border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold",
            }}>
              {saving ? "Kaydediliyor..." : isEdit ? "Güncelle" : "Kaydet"}
            </button>
            <button type="button" onClick={() => router.push("/pet/kart")} style={{
              flex: 1, padding: "11px 0", background: "#eee",
              border: "none", borderRadius: 8, cursor: "pointer",
            }}>
              İptal
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
