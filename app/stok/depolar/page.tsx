"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";

type Warehouse = {
  id: string;
  name: string;
  is_default: boolean;
};

export default function DepolarPage() {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Warehouse | null>(null);
  const [name, setName] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase.from("profiles").select("tenant_id").eq("id", user.id).single();
    if (!profile?.tenant_id) return;
    setTenantId(profile.tenant_id);
    await fetchWarehouses(profile.tenant_id);
  };

  const fetchWarehouses = async (tid: string) => {
    const { data } = await supabase.from("warehouses").select("*").eq("tenant_id", tid).order("created_at");
    if (data) setWarehouses(data);
  };

  const resetForm = () => {
    setEditing(null);
    setShowForm(false);
    setName("");
    setIsDefault(false);
  };

  const handleEdit = (w: Warehouse) => {
    setEditing(w);
    setName(w.name);
    setIsDefault(w.is_default);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;

    // Bir depo varsayılan yapılıyorsa, önce diğerlerini varsayılan olmaktan çıkar
    if (isDefault) {
      await supabase.from("warehouses").update({ is_default: false }).eq("tenant_id", tenantId);
    }

    if (editing) {
      await supabase.from("warehouses").update({ name, is_default: isDefault }).eq("id", editing.id);
    } else {
      await supabase.from("warehouses").insert({ tenant_id: tenantId, name, is_default: isDefault });
    }
    await fetchWarehouses(tenantId);
    resetForm();
  };

  const handleDelete = async (w: Warehouse) => {
    if (w.is_default) {
      alert("Varsayılan depo silinemez. Önce başka bir depoyu varsayılan yapın.");
      return;
    }
    if (!confirm(`"${w.name}" deposunu silmek istediğinize emin misiniz? Bu depodaki stok kayıtları da silinir.`)) return;
    await supabase.from("warehouses").delete().eq("id", w.id);
    if (tenantId) await fetchWarehouses(tenantId);
  };

  return (
    <DashboardLayout>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: "bold" }}>Depolar</h1>
            <Link href="/stok/depolar/transfer" style={{ fontSize: 13, color: "#6366f1", textDecoration: "none", fontWeight: 600 }}>
              ⇄ Depolar arası transfer
            </Link>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            style={{ padding: "10px 20px", background: "#6366f1", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}
          >
            + Yeni Depo
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSave} style={{
            background: "white", padding: 24, borderRadius: 12, marginBottom: 24,
            display: "flex", flexDirection: "column", gap: 12, maxWidth: 420,
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          }}>
            <h2 style={{ fontSize: 18, fontWeight: "bold", margin: 0 }}>
              {editing ? "Depoyu Düzenle" : "Yeni Depo"}
            </h2>
            <input
              placeholder="Depo adı (ör. Merkez Depo, Şube 2 Deposu)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ padding: 10, border: "1px solid #ccc", borderRadius: 6, fontSize: 14 }}
            />
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#555", cursor: "pointer" }}>
              <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
              Varsayılan depo (yeni ürünler ve satış/alışlarda ön seçili olur)
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" style={{ padding: "10px 20px", background: "#6366f1", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>
                {editing ? "Güncelle" : "Kaydet"}
              </button>
              <button type="button" onClick={resetForm} style={{ padding: "10px 20px", background: "#eee", border: "none", borderRadius: 6, cursor: "pointer" }}>
                İptal
              </button>
            </div>
          </form>
        )}

        <div style={{ background: "white", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ borderBottom: "1px solid #eee", padding: 12, textAlign: "left" }}>Depo Adı</th>
                <th style={{ borderBottom: "1px solid #eee", padding: 12, textAlign: "left" }}>Durum</th>
                <th style={{ borderBottom: "1px solid #eee", padding: 12, textAlign: "left" }}>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {warehouses.map((w) => (
                <tr key={w.id}>
                  <td style={{ padding: 12, fontWeight: 500 }}>{w.name}</td>
                  <td style={{ padding: 12 }}>
                    {w.is_default && (
                      <span style={{ background: "#ede9fe", color: "#6366f1", padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                        Varsayılan
                      </span>
                    )}
                  </td>
                  <td style={{ padding: 12 }}>
                    <button onClick={() => handleEdit(w)} style={{ padding: "5px 12px", background: "#6366f1", color: "white", borderRadius: 6, border: "none", cursor: "pointer", marginRight: 8, fontSize: 12 }}>
                      Düzenle
                    </button>
                    <button onClick={() => handleDelete(w)} style={{ padding: "5px 12px", background: "#fee2e2", color: "#dc2626", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12 }}>
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
              {warehouses.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ padding: 28, textAlign: "center", color: "#aaa" }}>
                    Henüz depo yok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
