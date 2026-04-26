"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Patient = {
  id: string;
  pet_name: string;
  species: string;
  breed: string;
  age_years: number | null;
  weight_kg: number | null;
  owner_name: string;
  owner_phone: string;
  created_at: string;
};

export default function VetPatientList() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchPatients = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase.from("profiles").select("tenant_id").eq("id", user.id).single();
    if (!profile?.tenant_id) return;
    const { data } = await supabase.from("vet_patients").select("*").eq("tenant_id", profile.tenant_id).order("created_at", { ascending: false });
    setPatients(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchPatients(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" hastasını silmek istiyor musunuz?`)) return;
    await supabase.from("vet_patients").delete().eq("id", id);
    setPatients((prev) => prev.filter((p) => p.id !== id));
  };

  const filtered = patients.filter((p) =>
    p.pet_name.toLowerCase().includes(search.toLowerCase()) ||
    p.owner_name.toLowerCase().includes(search.toLowerCase()) ||
    (p.species ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h1 style={{ fontSize: 24, fontWeight: "bold" }}>🐾 Hasta Kartları</h1>
          <Link href="/vet/hastalar/yeni" style={{ padding: "10px 20px", background: "#8b5cf6", color: "white", borderRadius: 8, textDecoration: "none", fontWeight: "bold", fontSize: 14 }}>
            + Yeni Hasta
          </Link>
        </div>

        <div style={{ background: "white", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #f3f4f6" }}>
            <input
              type="text"
              placeholder="Hasta adı, sahip adı veya tür ile ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#888" }}>Yükleniyor...</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  {["Pet Adı", "Tür / Irk", "Yaş / Kilo", "Sahip", "Telefon", ""].map((h) => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, color: "#555", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 600, fontSize: 14 }}>{p.pet_name}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#555" }}>{p.species}{p.breed ? ` / ${p.breed}` : ""}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#555" }}>
                      {p.age_years != null ? `${p.age_years} yaş` : "—"}{p.weight_kg != null ? ` · ${p.weight_kg} kg` : ""}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13 }}>{p.owner_name}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#888" }}>{p.owner_phone || "—"}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => router.push(`/vet/hastalar/${p.id}`)} style={{ padding: "5px 12px", background: "#f0f9ff", color: "#0ea5e9", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Detay</button>
                        <button onClick={() => router.push(`/vet/hastalar/${p.id}/duzenle`)} style={{ padding: "5px 12px", background: "#f5f3ff", color: "#8b5cf6", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Düzenle</button>
                        <button onClick={() => handleDelete(p.id, p.pet_name)} style={{ padding: "5px 12px", background: "#fef2f2", color: "#ef4444", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Sil</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "52px 24px" }}>
                        <div style={{ fontSize: 40 }}>🐾</div>
                        <p style={{ fontSize: 15, fontWeight: 600, color: "#374151", margin: 0 }}>Henüz hasta kaydı yok.</p>
                        <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>Kullanıma hazır.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
