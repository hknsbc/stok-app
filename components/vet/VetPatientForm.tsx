"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import { useRouter } from "next/navigation";

export type PatientData = {
  id?: string;
  pet_name: string;
  species: string;
  breed: string;
  age_years: string;
  weight_kg: string;
  allergies: string;
  owner_name: string;
  owner_phone: string;
  owner_email: string;
  notes: string;
};

const SPECIES = ["Kedi", "Köpek", "Kuş", "Tavşan", "Hamster", "Balık", "Sürüngen", "Diğer"];

const EMPTY: PatientData = { pet_name: "", species: "Kedi", breed: "", age_years: "", weight_kg: "", allergies: "", owner_name: "", owner_phone: "", owner_email: "", notes: "" };

export default function VetPatientForm({ initialData }: { initialData?: PatientData }) {
  const router = useRouter();
  const [form, setForm] = useState<PatientData>(initialData ?? EMPTY);
  const [saving, setSaving] = useState(false);

  const set = (k: keyof PatientData, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.pet_name || !form.owner_name) { alert("Pet adı ve sahip adı zorunludur."); return; }
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert("Oturum gerekli."); setSaving(false); return; }
    const { data: profile } = await supabase.from("profiles").select("tenant_id").eq("id", user.id).single();
    if (!profile?.tenant_id) { alert("Tenant bulunamadı."); setSaving(false); return; }

    const payload = {
      pet_name: form.pet_name,
      species: form.species,
      breed: form.breed,
      age_years: form.age_years ? Number(form.age_years) : null,
      weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
      allergies: form.allergies,
      owner_name: form.owner_name,
      owner_phone: form.owner_phone,
      owner_email: form.owner_email,
      notes: form.notes,
      tenant_id: profile.tenant_id,
    };

    if (form.id) {
      const { error } = await supabase.from("vet_patients").update(payload).eq("id", form.id);
      if (error) { alert(`Hata: ${error.message}`); setSaving(false); return; }
    } else {
      const { error } = await supabase.from("vet_patients").insert(payload);
      if (error) { alert(`Hata: ${error.message}`); setSaving(false); return; }
    }

    router.push("/vet/hastalar");
  };

  const inp: React.CSSProperties = { width: "100%", padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" };
  const lbl: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 4 };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <h1 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 24 }}>
          {form.id ? "🐾 Hasta Düzenle" : "🐾 Yeni Hasta Kartı"}
        </h1>

        <form onSubmit={handleSubmit}>
          <Card title="🐾 Hasta Bilgileri">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={lbl}>Pet Adı *</label>
                <input style={inp} value={form.pet_name} onChange={(e) => set("pet_name", e.target.value)} placeholder="Tekir" required />
              </div>
              <div>
                <label style={lbl}>Tür</label>
                <select style={inp} value={form.species} onChange={(e) => set("species", e.target.value)}>
                  {SPECIES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Irk</label>
                <input style={inp} value={form.breed} onChange={(e) => set("breed", e.target.value)} placeholder="Tekir" />
              </div>
              <div>
                <label style={lbl}>Yaş (yıl)</label>
                <input style={inp} type="number" min="0" value={form.age_years} onChange={(e) => set("age_years", e.target.value)} placeholder="3" />
              </div>
              <div>
                <label style={lbl}>Kilo (kg)</label>
                <input style={inp} type="number" step="0.1" min="0" value={form.weight_kg} onChange={(e) => set("weight_kg", e.target.value)} placeholder="4.5" />
              </div>
              <div>
                <label style={lbl}>Alerjiler</label>
                <input style={inp} value={form.allergies} onChange={(e) => set("allergies", e.target.value)} placeholder="Penisilin, vb." />
              </div>
            </div>
          </Card>

          <Card title="👤 Sahip Bilgileri">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={lbl}>Sahip Adı *</label>
                <input style={inp} value={form.owner_name} onChange={(e) => set("owner_name", e.target.value)} placeholder="Ali Yılmaz" required />
              </div>
              <div>
                <label style={lbl}>Telefon</label>
                <input style={inp} value={form.owner_phone} onChange={(e) => set("owner_phone", e.target.value)} placeholder="0532 111 2233" />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={lbl}>E-posta</label>
                <input style={inp} type="email" value={form.owner_email} onChange={(e) => set("owner_email", e.target.value)} placeholder="ali@ornek.com" />
              </div>
            </div>
          </Card>

          <Card title="📝 Notlar">
            <textarea style={{ ...inp, height: 80, resize: "vertical" }} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Önemli notlar..." />
          </Card>

          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: "12px 0", background: saving ? "#e5e7eb" : "#8b5cf6", color: saving ? "#aaa" : "white", border: "none", borderRadius: 8, cursor: saving ? "not-allowed" : "pointer", fontWeight: "bold", fontSize: 15 }}>
              {saving ? "Kaydediliyor..." : form.id ? "Güncelle" : "Kaydet"}
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
