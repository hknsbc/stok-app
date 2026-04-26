"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Exam = { id: string; pet_name: string; owner_name: string; diagnosis: string; treatment_plan: string; date: string; total_cost: number; status: string };

export default function ExaminationList() {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from("profiles").select("tenant_id").eq("id", user.id).single();
      if (!profile?.tenant_id) return;
      const { data } = await supabase.from("vet_examinations").select("id,pet_name,owner_name,diagnosis,treatment_plan,date,total_cost,status").eq("tenant_id", profile.tenant_id).order("date", { ascending: false });
      setExams(data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Bu muayene kaydını silmek istiyor musunuz?")) return;
    await supabase.from("vet_examinations").delete().eq("id", id);
    setExams((prev) => prev.filter((e) => e.id !== id));
  };

  const filtered = exams.filter((e) =>
    e.pet_name.toLowerCase().includes(search.toLowerCase()) ||
    e.owner_name.toLowerCase().includes(search.toLowerCase()) ||
    (e.diagnosis ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h1 style={{ fontSize: 24, fontWeight: "bold" }}>🩺 Muayene Kayıtları</h1>
          <Link href="/vet/muayene/yeni" style={{ padding: "10px 20px", background: "#0ea5e9", color: "white", borderRadius: 8, textDecoration: "none", fontWeight: "bold", fontSize: 14 }}>
            + Yeni Muayene
          </Link>
        </div>

        <div style={{ background: "white", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #f3f4f6" }}>
            <input type="text" placeholder="Hasta adı, sahip veya tanı ile ara..." value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#888" }}>Yükleniyor...</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  {["Tarih", "Hasta", "Sahip", "Tanı", "Tedavi", "Tutar", ""].map((h) => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, color: "#555", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "11px 14px", fontSize: 13, color: "#888" }}>{e.date}</td>
                    <td style={{ padding: "11px 14px", fontWeight: 600, fontSize: 14 }}>{e.pet_name}</td>
                    <td style={{ padding: "11px 14px", fontSize: 13, color: "#555" }}>{e.owner_name}</td>
                    <td style={{ padding: "11px 14px", fontSize: 13 }}>{e.diagnosis || "—"}</td>
                    <td style={{ padding: "11px 14px", fontSize: 12, color: "#555", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.treatment_plan || "—"}</td>
                    <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 600, color: "#10b981" }}>{Number(e.total_cost || 0).toLocaleString("tr-TR")} TL</td>
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => router.push(`/vet/muayene/${e.id}`)} style={{ padding: "5px 12px", background: "#f0f9ff", color: "#0ea5e9", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Detay</button>
                        <button onClick={() => handleDelete(e.id)} style={{ padding: "5px 12px", background: "#fef2f2", color: "#ef4444", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Sil</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "52px 24px" }}>
                      <div style={{ fontSize: 36 }}>🩺</div>
                      <p style={{ fontSize: 15, fontWeight: 600, color: "#374151", margin: 0 }}>Henüz muayene kaydı yok.</p>
                      <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>Kullanıma hazır.</p>
                    </div>
                  </td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
