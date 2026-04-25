"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import { useRouter } from "next/navigation";

type PetCard = {
  id: string;
  owner_name: string;
  owner_phone: string | null;
  pet_name: string;
  species: string | null;
  breed: string | null;
  age: string | null;
  preferred_food: string | null;
  loyalty_points: number;
  notes: string | null;
  created_at: string;
};

const SPECIES_EMOJI: Record<string, string> = {
  Kedi: "🐱", Köpek: "🐶", Kuş: "🐦", Balık: "🐠", Tavşan: "🐰", Hamster: "🐹", Diğer: "🐾",
};

export default function PetCardList() {
  const router = useRouter();
  const [cards, setCards] = useState<PetCard[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("pet_cards")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setCards(data);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = cards.filter((c) =>
    c.owner_name.toLowerCase().includes(search.toLowerCase()) ||
    c.pet_name.toLowerCase().includes(search.toLowerCase()) ||
    (c.owner_phone ?? "").includes(search)
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Bu pet kartını silmek istediğinizden emin misiniz?")) return;
    await supabase.from("pet_cards").delete().eq("id", id);
    setCards((prev) => prev.filter((c) => c.id !== id));
  };

  const th: React.CSSProperties = {
    padding: "10px 14px", textAlign: "left", fontSize: 12,
    color: "#555", fontWeight: 600, borderBottom: "2px solid #eee", background: "#f9fafb",
  };
  const td: React.CSSProperties = { padding: "10px 14px", fontSize: 13, borderBottom: "1px solid #f3f4f6" };

  return (
    <DashboardLayout>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h1 style={{ fontSize: 26, fontWeight: "bold" }}>🐾 Pet Kartları</h1>
          <button
            onClick={() => router.push("/pet/kart/ekle")}
            style={{ padding: "10px 20px", background: "#f97316", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 }}
          >
            + Yeni Pet Kartı
          </button>
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Sahip adı, hayvan adı veya telefon ara..."
          style={{
            width: "100%", padding: "10px 14px", border: "1px solid #e5e7eb",
            borderRadius: 8, fontSize: 14, marginBottom: 16,
            outline: "none", boxSizing: "border-box",
          }}
        />

        {loading ? (
          <p style={{ color: "#888" }}>Yükleniyor...</p>
        ) : (
          <div style={{ background: "white", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>Hayvan</th>
                  <th style={th}>Sahip</th>
                  <th style={th}>Telefon</th>
                  <th style={th}>Irk / Yaş</th>
                  <th style={th}>Tercih Mama</th>
                  <th style={th}>Puan</th>
                  <th style={th}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} style={{ cursor: "pointer" }} onClick={() => router.push(`/pet/kart/${c.id}`)}>
                    <td style={td}>
                      <span style={{ fontSize: 18, marginRight: 6 }}>
                        {SPECIES_EMOJI[c.species ?? ""] ?? "🐾"}
                      </span>
                      <span style={{ fontWeight: 600 }}>{c.pet_name}</span>
                      {c.species && <span style={{ color: "#888", fontSize: 12, marginLeft: 4 }}>({c.species})</span>}
                    </td>
                    <td style={td}>{c.owner_name}</td>
                    <td style={td}>{c.owner_phone ?? "—"}</td>
                    <td style={td}>
                      <span style={{ color: "#555" }}>{c.breed ?? "—"}</span>
                      {c.age && <span style={{ color: "#888", fontSize: 12, marginLeft: 4 }}>· {c.age}</span>}
                    </td>
                    <td style={{ ...td, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.preferred_food ?? "—"}
                    </td>
                    <td style={td}>
                      <span style={{
                        background: "#fff7ed", color: "#f97316",
                        padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                      }}>
                        {c.loyalty_points} puan
                      </span>
                    </td>
                    <td style={td} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => router.push(`/pet/kart/${c.id}/duzenle`)}
                        style={{ padding: "5px 12px", background: "#f97316", color: "white", borderRadius: 6, border: "none", cursor: "pointer", marginRight: 6, fontSize: 12, fontWeight: 600 }}
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        style={{ padding: "5px 12px", background: "#fee2e2", color: "#dc2626", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: 24, textAlign: "center", color: "#aaa", fontSize: 13 }}>
                      {search ? "Arama sonucu bulunamadı." : "Henüz pet kartı eklenmemiş."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
