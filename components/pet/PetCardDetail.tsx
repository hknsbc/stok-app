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
  last_purchase_at: string | null;
  notes: string | null;
  created_at: string;
};

const SPECIES_EMOJI: Record<string, string> = {
  Kedi: "🐱", Köpek: "🐶", Kuş: "🐦", Balık: "🐠", Tavşan: "🐰", Hamster: "🐹", Diğer: "🐾",
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
      <span style={{ minWidth: 160, fontSize: 13, color: "#888", fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 13, color: "#1f2937", flex: 1 }}>{value ?? "—"}</span>
    </div>
  );
}

export default function PetCardDetail({ id }: { id: string }) {
  const router = useRouter();
  const [card, setCard] = useState<PetCard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from("pet_cards").select("*").eq("id", id).single();
      if (error || !data) { alert("Pet kartı bulunamadı."); router.push("/pet/kart"); return; }
      setCard(data);
      setLoading(false);
    };
    fetch();
  }, [id, router]);

  const handleDelete = async () => {
    if (!confirm("Bu pet kartını silmek istediğinizden emin misiniz?")) return;
    await supabase.from("pet_cards").delete().eq("id", id);
    router.push("/pet/kart");
  };

  if (loading) return <DashboardLayout><p style={{ color: "#888" }}>Yükleniyor...</p></DashboardLayout>;
  if (!card) return null;

  const emoji = SPECIES_EMOJI[card.species ?? ""] ?? "🐾";

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 600 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "linear-gradient(135deg, #fff7ed, #fed7aa)",
              border: "2px solid #f97316",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32,
            }}>
              {emoji}
            </div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: "bold", margin: 0 }}>{card.pet_name}</h1>
              <p style={{ color: "#888", margin: "4px 0 0", fontSize: 14 }}>
                {card.species}{card.breed ? ` · ${card.breed}` : ""}
              </p>
            </div>
          </div>
          <div style={{
            background: "#fff7ed", border: "1px solid #fed7aa",
            borderRadius: 12, padding: "10px 18px", textAlign: "center",
          }}>
            <div style={{ fontSize: 22, fontWeight: "bold", color: "#f97316" }}>{card.loyalty_points}</div>
            <div style={{ fontSize: 12, color: "#888" }}>puan</div>
          </div>
        </div>

        <div style={{ background: "white", borderRadius: 12, padding: "8px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", marginBottom: 20 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#f97316", margin: "16px 0 4px", textTransform: "uppercase", letterSpacing: 0.5 }}>Sahip Bilgileri</p>
          <Row label="Ad Soyad" value={card.owner_name} />
          <Row label="Telefon" value={card.owner_phone} />

          <p style={{ fontSize: 12, fontWeight: 600, color: "#f97316", margin: "16px 0 4px", textTransform: "uppercase", letterSpacing: 0.5 }}>Hayvan Bilgileri</p>
          <Row label="Tür" value={card.species} />
          <Row label="Irk" value={card.breed} />
          <Row label="Yaş" value={card.age} />
          <Row label="Tercih Edilen Mama" value={card.preferred_food} />

          {card.last_purchase_at && (
            <>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#f97316", margin: "16px 0 4px", textTransform: "uppercase", letterSpacing: 0.5 }}>Son İşlem</p>
              <Row label="Son Alışveriş" value={card.last_purchase_at} />
            </>
          )}

          {card.notes && (
            <>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#f97316", margin: "16px 0 4px", textTransform: "uppercase", letterSpacing: 0.5 }}>Notlar</p>
              <div style={{ padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
                <p style={{ fontSize: 13, color: "#1f2937", margin: 0, whiteSpace: "pre-wrap" }}>{card.notes}</p>
              </div>
            </>
          )}

          <p style={{ fontSize: 11, color: "#ccc", margin: "12px 0 8px" }}>
            Oluşturulma: {new Date(card.created_at).toLocaleDateString("tr-TR")}
          </p>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => router.push(`/pet/kart/${id}/duzenle`)}
            style={{ flex: 1, padding: "11px 0", background: "#f97316", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold" }}
          >
            Düzenle
          </button>
          <button
            onClick={handleDelete}
            style={{ flex: 1, padding: "11px 0", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold" }}
          >
            Sil
          </button>
          <button
            onClick={() => router.push("/pet/kart")}
            style={{ flex: 1, padding: "11px 0", background: "#eee", border: "none", borderRadius: 8, cursor: "pointer" }}
          >
            Geri
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
