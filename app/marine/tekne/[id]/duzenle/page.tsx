"use client";
import { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import BoatCardForm from "@/components/marine/BoatCardForm";
import DashboardLayout from "@/components/DashboardLayout";
import type { BoatCardData } from "@/components/marine/BoatCardForm";

export default function MarineTekneEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<BoatCardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("boat_cards").select("id, name, model, engine_type, serial_number, owner_name, owner_phone, marina, notes")
      .eq("id", id).single()
      .then(({ data: row, error }) => {
        if (error || !row) { alert("Tekne kartı bulunamadı."); return; }
        setData({ id: row.id, name: row.name ?? "", model: row.model ?? "", engine_type: row.engine_type ?? "", serial_number: row.serial_number ?? "", owner_name: row.owner_name ?? "", owner_phone: row.owner_phone ?? "", marina: row.marina ?? "", notes: row.notes ?? "" });
        setLoading(false);
      });
  }, [id]);

  if (loading) return <DashboardLayout><p style={{ color: "#94a3b8" }}>Yükleniyor...</p></DashboardLayout>;
  if (!data) return null;
  return <BoatCardForm initialData={data} />;
}
