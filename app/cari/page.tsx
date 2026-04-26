"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import { useLang } from "@/lib/LangContext";

type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
};

export default function Cari() {
  const { t } = useLang();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setCustomers(data);
  };

  const resetForm = () => {
    setName(""); setPhone(""); setEmail(""); setAddress("");
    setEditing(null); setShowForm(false);
  };

  const handleSave = async (e: any) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase
      .from("profiles").select("tenant_id").eq("id", user.id).single();
    if (!profile?.tenant_id) return;

    if (editing) {
      await supabase.from("customers")
        .update({ name, phone, email, address })
        .eq("id", editing.id);
    } else {
      await supabase.from("customers")
        .insert({ name, phone, email, address, tenant_id: profile.tenant_id });
    }
    fetchCustomers();
    resetForm();
  };

  const handleEdit = (c: Customer) => {
    setEditing(c);
    setName(c.name); setPhone(c.phone || "");
    setEmail(c.email || ""); setAddress(c.address || "");
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("customers").delete().eq("id", id);
    setCustomers(customers.filter((c) => c.id !== id));
  };

  return (
    <DashboardLayout>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: "bold" }}>{t.cariTitle}</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{ padding: "10px 20px", background: "#6366f1", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}
          >
            {showForm ? t.cancel : t.newCari}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSave} style={{ background: "white", padding: 24, borderRadius: 12, marginBottom: 24, display: "flex", flexDirection: "column", gap: 12, maxWidth: 500 }}>
            <h2 style={{ fontSize: 18, fontWeight: "bold" }}>{editing ? t.editCari : t.newCariForm}</h2>
            <input placeholder={t.name} value={name} onChange={(e) => setName(e.target.value)} required
              style={{ padding: 10, border: "1px solid #ccc", borderRadius: 6 }} />
            <input placeholder={t.phone} value={phone} onChange={(e) => setPhone(e.target.value)}
              style={{ padding: 10, border: "1px solid #ccc", borderRadius: 6 }} />
            <input placeholder={t.email} value={email} onChange={(e) => setEmail(e.target.value)}
              style={{ padding: 10, border: "1px solid #ccc", borderRadius: 6 }} />
            <input placeholder={t.address} value={address} onChange={(e) => setAddress(e.target.value)}
              style={{ padding: 10, border: "1px solid #ccc", borderRadius: 6 }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" style={{ padding: "10px 20px", background: "black", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}>
                {editing ? t.update : t.save}
              </button>
              <button type="button" onClick={resetForm} style={{ padding: "10px 20px", background: "#eee", border: "none", borderRadius: 6, cursor: "pointer" }}>
                {t.cancel}
              </button>
            </div>
          </form>
        )}

        <table style={{ width: "100%", borderCollapse: "collapse", background: "white", borderRadius: 12 }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #eee", padding: 12, textAlign: "left" }}>{t.name}</th>
              <th style={{ borderBottom: "1px solid #eee", padding: 12, textAlign: "left" }}>{t.phone}</th>
              <th style={{ borderBottom: "1px solid #eee", padding: 12, textAlign: "left" }}>{t.email}</th>
              <th style={{ borderBottom: "1px solid #eee", padding: 12, textAlign: "left" }}>{t.address}</th>
              <th style={{ borderBottom: "1px solid #eee", padding: 12, textAlign: "left" }}>{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td style={{ padding: 12 }}>{c.name}</td>
                <td style={{ padding: 12 }}>{c.phone}</td>
                <td style={{ padding: 12 }}>{c.email}</td>
                <td style={{ padding: 12 }}>{c.address}</td>
                <td style={{ padding: 12 }}>
                  <button onClick={() => handleEdit(c)} style={{ padding: "6px 12px", background: "blue", color: "white", borderRadius: 6, border: "none", cursor: "pointer", marginRight: 8 }}>{t.edit}</button>
                  <button onClick={() => handleDelete(c.id)} style={{ padding: "6px 12px", background: "red", color: "white", borderRadius: 6, border: "none", cursor: "pointer" }}>{t.delete}</button>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "52px 24px" }}>
                    <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>👥</div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: "#374151", margin: 0 }}>Henüz kayıt bulunmuyor.</p>
                    <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>Kullanıma hazır.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
