"use client";
import { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import VetPatientForm, { PatientData } from "@/components/vet/VetPatientForm";
import DashboardLayout from "@/components/DashboardLayout";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<PatientData | null>(null);

  useEffect(() => {
    supabase.from("vet_patients").select("*").eq("id", id).single().then(({ data: row }) => {
      if (!row) return;
      setData({
        id: row.id, pet_name: row.pet_name ?? "", species: row.species ?? "Kedi",
        breed: row.breed ?? "", age_years: String(row.age_years ?? ""),
        weight_kg: String(row.weight_kg ?? ""), allergies: row.allergies ?? "",
        owner_name: row.owner_name ?? "", owner_phone: row.owner_phone ?? "",
        owner_email: row.owner_email ?? "", notes: row.notes ?? "",
      });
    });
  }, [id]);

  if (!data) return <DashboardLayout><p style={{ padding: 40, color: "#888" }}>Yükleniyor...</p></DashboardLayout>;
  return <VetPatientForm initialData={data} />;
}
