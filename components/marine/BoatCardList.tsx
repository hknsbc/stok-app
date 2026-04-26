"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import { useRouter } from "next/navigation";

type BoatCard = {
  id: string;
  name: string;
  model: string | null;
  engine_type: string | null;
  serial_number: string | null;
  owner_name: string;
  owner_phone: string | null;
  marina: string | null;
  created_at: string;
};

const th: React.CSSProperties = {
  padding: "10px 14px", textAlign: "left", fontSize: 12, color: "#64748b",
  fontWeight: 700, borderBottom: "2px solid #e2e8f0", background: "#f8fafc",
  textTransform: "uppercase", letterSpacing: 0.4,
};
const td: React.CSSProperties = { padding: "11px 14px", fontSize: 13, borderBottom: "1px solid #f1f5f9" };

export default function BoatCardList() {
  const router = useRouter();
  const [boats, setBoats] = useState<BoatCard[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("boat_cards").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setBoats(data); setLoading(false); });
  }, []);

  const filtered = boats.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.owner_name.toLowerCase().includes(search.toLowerCase()) ||
    (b.serial_number ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (b.marina ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Bu tekne kartını silmek istediğinizden emin misiniz?")) return;
    await supabase.from("boat_cards").delete().eq("id", id);
    setBoats((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <DashboardLayout>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h1 style={{ fontSize: 26, fontWeight: "bold", color: "#0c2340", display: "flex", alignItems: "center", gap: 10 }}>
            ⚓ Tekne Kartları
          </h1>
          <button
            onClick={() => router.push("/marine/tekne/ekle")}
            style={{ padding: "10px 20px", background: "#06b6d4", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14 }}
          >
            + Yeni Tekne Kartı
          </button>
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tekne adı, sahip, seri no veya marina ara..."
          style={{
            width: "100%", padding: "10px 14px", border: "1px solid #cbd5e1",
            borderRadius: 8, fontSize: 14, marginBottom: 16,
            outline: "none", boxSizing: "border-box",
          }}
        />

        {loading ? (
          <p style={{ color: "#94a3b8" }}>Yükleniyor...</p>
        ) : (
          <div style={{ background: "white", borderRadius: 12, boxShadow: "0 2px 12px rgba(6,182,212,0.08)", overflow: "hidden", border: "1px solid #e0f7fa" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>Tekne</th>
                  <th style={th}>Motor</th>
                  <th style={th}>Seri / Motor No</th>
                  <th style={th}>Sahip</th>
                  <th style={th}>Marina</th>
                  <th style={th}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id} style={{ cursor: "pointer" }} onClick={() => router.push(`/marine/tekne/${b.id}`)}>
                    <td style={td}>
                      <div style={{ fontWeight: 700, color: "#0c2340" }}>🚢 {b.name}</div>
                      {b.model && <div style={{ fontSize: 12, color: "#94a3b8" }}>{b.model}</div>}
                    </td>
                    <td style={td}>{b.engine_type ?? "—"}</td>
                    <td style={td}>
                      {b.serial_number ? (
                        <span style={{ fontFamily: "monospace", background: "#e0f7fa", color: "#0891b2", padding: "2px 8px", borderRadius: 6, fontSize: 12 }}>
                          {b.serial_number}
                        </span>
                      ) : "—"}
                    </td>
                    <td style={td}>
                      <div>{b.owner_name}</div>
                      {b.owner_phone && <div style={{ fontSize: 12, color: "#94a3b8" }}>{b.owner_phone}</div>}
                    </td>
                    <td style={td}>{b.marina ?? "—"}</td>
                    <td style={td} onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => router.push(`/marine/tekne/${b.id}/duzenle`)}
                        style={{ padding: "5px 12px", background: "#06b6d4", color: "white", borderRadius: 6, border: "none", cursor: "pointer", marginRight: 6, fontSize: 12, fontWeight: 600 }}>
                        Düzenle
                      </button>
                      <button onClick={() => handleDelete(b.id)}
                        style={{ padding: "5px 12px", background: "#fee2e2", color: "#dc2626", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: 28, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                    {search ? "Arama sonucu bulunamadı." : "Henüz tekne kartı eklenmemiş."}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
