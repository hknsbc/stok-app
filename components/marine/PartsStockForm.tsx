"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";

export type PartData = {
  id?: string;
  name: string;
  barcode: string;
  category: string;
  stock: string;
  price: string;
  selling_price: string;
};

const EMPTY: PartData = { name: "", barcode: "", category: "", stock: "0", price: "0", selling_price: "0" };

const MARINE_CATEGORIES = [
  "Motor Parçaları",
  "Elektrik / Elektronik",
  "Fiberglass / Epoksi / Boya",
  "Sarf Malzemeleri",
  "Güverte Donanımı",
  "Emniyet Ekipmanları",
  "Hidrolik",
  "Yakıt Sistemi",
  "Diğer",
];

const inp: React.CSSProperties = {
  padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: 8,
  width: "100%", fontSize: 14, boxSizing: "border-box", outline: "none", background: "white",
};
const lbl: React.CSSProperties = {
  fontSize: 12, color: "#64748b", marginBottom: 4, display: "block",
  fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4,
};

export default function PartsStockForm({ initialData }: { initialData?: PartData }) {
  const router = useRouter();
  const isEdit = !!initialData?.id;
  const [form, setForm] = useState<PartData>(initialData ?? EMPTY);
  const [saving, setSaving] = useState(false);

  const set = (field: keyof PartData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const margin = Number(form.selling_price) - Number(form.price);

  const handleSave = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name,
      barcode: form.barcode || null,
      category: form.category || null,
      stock: Number(form.stock),
      price: Number(form.price),
      selling_price: Number(form.selling_price),
    };

    if (isEdit) {
      const { error } = await supabase.from("products").update(payload).eq("id", initialData!.id!);
      if (error) { alert("Hata: " + error.message); setSaving(false); return; }
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { alert("Giriş gerekli"); setSaving(false); return; }
      const { data: profile } = await supabase.from("profiles").select("tenant_id").eq("id", user.id).single();
      if (!profile?.tenant_id) { alert("Tenant bulunamadı"); setSaving(false); return; }
      const { error } = await supabase.from("products").insert({ ...payload, tenant_id: profile.tenant_id });
      if (error) { alert("Hata: " + error.message); setSaving(false); return; }
    }
    router.push("/marine/parca");
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 520 }}>
        <h1 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 24, color: "#0c2340", display: "flex", alignItems: "center", gap: 10 }}>
          🔩 {isEdit ? "Parça Düzenle" : "Yeni Parça Ekle"}
        </h1>
        <form onSubmit={handleSave} style={{
          background: "white", padding: 28, borderRadius: 14,
          boxShadow: "0 2px 12px rgba(6,182,212,0.1)", border: "1px solid #e0f7fa",
          display: "flex", flexDirection: "column", gap: 14,
        }}>
          <div>
            <label style={lbl}>Parça Adı *</label>
            <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} required style={inp} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}>Seri No / Barkod</label>
              <input type="text" value={form.barcode} onChange={(e) => set("barcode", e.target.value)} placeholder="SN-xxxx" style={inp} />
            </div>
            <div>
              <label style={lbl}>Kategori</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)} style={{ ...inp }}>
                <option value="">Seçin</option>
                {MARINE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Stok Adedi</label>
              <input type="number" min="0" value={form.stock} onChange={(e) => set("stock", e.target.value)} style={inp} />
            </div>
            <div>
              <label style={lbl}>Alış Fiyatı (₺)</label>
              <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => set("price", e.target.value)} required style={inp} />
            </div>
            <div>
              <label style={lbl}>Satış Fiyatı (₺)</label>
              <input type="number" step="0.01" min="0" value={form.selling_price} onChange={(e) => set("selling_price", e.target.value)} required style={inp} />
            </div>
            {Number(form.price) > 0 && (
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <div style={{ background: margin >= 0 ? "#e0f7fa" : "#fef2f2", borderRadius: 8, padding: "10px 14px", flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#0891b2", textTransform: "uppercase" }}>Kar Marjı</div>
                  <div style={{ fontSize: 18, fontWeight: "bold", color: margin >= 0 ? "#06b6d4" : "#ef4444" }}>
                    ₺{margin.toFixed(2)}
                    {Number(form.price) > 0 && <span style={{ fontSize: 12, opacity: 0.7 }}> (%{((margin / Number(form.price)) * 100).toFixed(1)})</span>}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button type="submit" disabled={saving} style={{
              flex: 1, padding: "11px 0", background: "#06b6d4", color: "white",
              border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold", fontSize: 15,
            }}>
              {saving ? "Kaydediliyor..." : isEdit ? "Güncelle" : "Kaydet"}
            </button>
            <button type="button" onClick={() => router.push("/marine/parca")} style={{
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
