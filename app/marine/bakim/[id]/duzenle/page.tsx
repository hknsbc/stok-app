"use client";
import { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import MaintenanceForm from "@/components/marine/MaintenanceForm";
import DashboardLayout from "@/components/DashboardLayout";
import { Suspense } from "react";
import type { MaintenanceData } from "@/components/marine/MaintenanceForm";

function EditInner({ id }: { id: string }) {
  const [data, setData] = useState<MaintenanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("maintenance_records")
      .select("id, boat_id, description, labor_hours, labor_cost, parts_cost, status, date, notes")
      .eq("id", id).single()
      .then(({ data: row, error }) => {
        if (error || !row) { alert("Kayıt bulunamadı."); return; }
        setData({ id: row.id, boat_id: row.boat_id ?? "", description: row.description ?? "", labor_hours: String(row.labor_hours ?? 0), labor_cost: String(row.labor_cost ?? 0), parts_cost: String(row.parts_cost ?? 0), status: row.status ?? "open", date: row.date ?? "", notes: row.notes ?? "" });
        setLoading(false);
      });
  }, [id]);

  if (loading) return <DashboardLayout><p style={{ color: "#94a3b8" }}>Yükleniyor...</p></DashboardLayout>;
  if (!data) return null;
  return <MaintenanceForm initialData={data} />;
}

export default function MarineBakimEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <Suspense fallback={null}><EditInner id={id} /></Suspense>;
}
