"use client";
import { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PetCardForm from "@/components/pet/PetCardForm";
import DashboardLayout from "@/components/DashboardLayout";
import type { PetCardData } from "@/components/pet/PetCardForm";

export default function PetKartDuzenlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<PetCardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: row, error } = await supabase
        .from("pet_cards")
        .select("id, owner_name, owner_phone, pet_name, species, breed, age, preferred_food, loyalty_points, notes")
        .eq("id", id)
        .single();
      if (error || !row) { alert("Pet kartı bulunamadı."); return; }
      setData({
        id: row.id,
        owner_name: row.owner_name ?? "",
        owner_phone: row.owner_phone ?? "",
        pet_name: row.pet_name ?? "",
        species: row.species ?? "",
        breed: row.breed ?? "",
        age: row.age ?? "",
        preferred_food: row.preferred_food ?? "",
        loyalty_points: row.loyalty_points ?? 0,
        notes: row.notes ?? "",
      });
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) return <DashboardLayout><p style={{ color: "#888" }}>Yükleniyor...</p></DashboardLayout>;
  if (!data) return null;

  return <PetCardForm initialData={data} />;
}
