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

type BoatMap = Record<string, { name: string; owner_phone: string | null; owner_name: string }>;

const STATUS: Record<string, { label: string; bg: string; color: string }> = {
  open: { label: "Açık", bg: "#eff6ff", color: "#2563eb" },
  pending_parts: { label: "Parça Bekliyor", bg: "#fffbeb", color: "#d97706" },
  completed: { label: "Tamamlandı", bg: "#f0fdf4", color: "#16a34a" },
};

const th: React.CSSProperties = {
  padding: "10px 14px", textAlign: "left", fontSize: 12, color: "#64748b",
  fontWeight: 700, borderBottom: "2px solid #e2e8f0", background: "#f8fafc",
  textTransform: "uppercase", letterSpacing: 0.4,
};
const td: React.CSSProperties = { padding: "11px 14px", fontSize: 13, borderBottom: "1px solid #f1f5f9" };

export default function MaintenanceList() {
  const router = useRouter();
  const [records, setRecords] = useState<Record_[]>([]);
  const [boatMap, setBoatMap] = useState<BoatMap>({});
  const [filter, setFilter] = useState<"all" | "open" | "pending_parts" | "completed">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const [recRes, boatRes] = await Promise.all([
        supabase.from("maintenance_records").select("*").order("date", { ascending: false }),
        supabase.from("boat_cards").select("id, name, owner_name, owner_phone"),
      ]);
      if (recRes.data) setRecords(recRes.data);
      if (boatRes.data) {
        const map: BoatMap = {};
        boatRes.data.forEach((b) => { map[b.id] = { name: b.name, owner_name: b.owner_name, owner_phone: b.owner_phone }; });
        setBoatMap(map);
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  const filtered = filter === "all" ? records : records.filter((r) => r.status === filter);
  const counts = {
    open: records.filter((r) => r.status === "open").length,
    pending_parts: records.filter((r) => r.status === "pending_parts").length,
    completed: records.filter((r) => r.status === "completed").length,
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu bakım kaydını silmek istediğinizden emin misiniz?")) return;
    await supabase.from("maintenance_records").delete().eq("id", id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const filterBtn = (key: typeof filter, label: string, count: number, color: string) => (
    <button onClick={() => setFilter(key)} style={{
      padding: "7px 16px", borderRadius: 20, border: "none", cursor: "pointer",
      fontWeight: 700, fontSize: 13,
      background: filter === key ? color : "#f1f5f9",
      color: filter === key ? "white" : "#64748b",
    }}>
      {label} ({count})
    </button>
  );

  return (
    <DashboardLayout>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h1 style={{ fontSize: 26, fontWeight: "bold", color: "#0c2340" }}>🔧 Bakım Kayıtları</h1>
          <button onClick={() => router.push("/marine/bakim/ekle")}
            style={{ padding: "10px 20px", background: "#06b6d4", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
            + Yeni Bakım
          </button>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {filterBtn("all", "Tümü", records.length, "#0c2340")}
          {filterBtn("open", "Açık", counts.open, "#2563eb")}
          {filterBtn("pending_parts", "Parça Bekliyor", counts.pending_parts, "#d97706")}
          {filterBtn("completed", "Tamamlandı", counts.completed, "#16a34a")}
        </div>

        {loading ? (
          <p style={{ color: "#94a3b8" }}>Yükleniyor...</p>
        ) : (
          <div style={{ background: "white", borderRadius: 12, boxShadow: "0 2px 12px rgba(6,182,212,0.08)", overflow: "hidden", border: "1px solid #e0f7fa" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>Tarih</th>
                  <th style={th}>Tekne</th>
                  <th style={th}>İş Açıklaması</th>
                  <th style={th}>İşçilik</th>
                  <th style={th}>Malzeme</th>
                  <th style={th}>Toplam</th>
                  <th style={th}>Durum</th>
                  <th style={th}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const total = (r.labor_cost ?? 0) + (r.parts_cost ?? 0);
                  const s = STATUS[r.status] ?? STATUS.open;
                  const boat = r.boat_id ? boatMap[r.boat_id] : null;
                  const waLink = boat?.owner_phone && r.status === "completed"
                    ? maintenanceCompleteLink({ ownerName: boat.owner_name, ownerPhone: boat.owner_phone, boatName: boat.name, description: r.description, laborCost: r.labor_cost, partsCost: r.parts_cost, totalCost: total, date: r.date, status: r.status })
                    : null;
                  return (
                    <tr key={r.id} style={{ cursor: "pointer" }} onClick={() => router.push(`/marine/bakim/${r.id}`)}>
                      <td style={td}>{r.date}</td>
                      <td style={td}><span style={{ fontWeight: 600 }}>{boat?.name ?? "—"}</span></td>
                      <td style={{ ...td, maxWidth: 220 }}><span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.description}</span></td>
                      <td style={td}>₺{(r.labor_cost ?? 0).toFixed(2)}<br /><span style={{ fontSize: 11, color: "#94a3b8" }}>{r.labor_hours}s</span></td>
                      <td style={td}>₺{(r.parts_cost ?? 0).toFixed(2)}</td>
                      <td style={{ ...td, fontWeight: 700, color: "#0c2340" }}>₺{total.toFixed(2)}</td>
                      <td style={td}><span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: s.bg, color: s.color }}>{s.label}</span></td>
                      <td style={td} onClick={(e) => e.stopPropagation()}>
                        {waLink && (
                          <a href={waLink} target="_blank" rel="noopener noreferrer"
                            style={{ display: "inline-block", marginBottom: 4, padding: "4px 10px", background: "#25d366", color: "white", borderRadius: 6, textDecoration: "none", fontSize: 11, fontWeight: 700 }}>
                            📲 WA
                          </a>
                        )}<br />
                        <button onClick={() => router.push(`/marine/bakim/${r.id}/duzenle`)}
                          style={{ padding: "4px 10px", background: "#06b6d4", color: "white", borderRadius: 6, border: "none", cursor: "pointer", marginRight: 4, fontSize: 11, fontWeight: 600 }}>
                          Düzenle
                        </button>
                        <button onClick={() => handleDelete(r.id)}
                          style={{ padding: "4px 10px", background: "#fee2e2", color: "#dc2626", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                          Sil
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} style={{ padding: 28, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>Kayıt bulunamadı.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
