"use client";
import { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PartsStockForm from "@/components/marine/PartsStockForm";
import DashboardLayout from "@/components/DashboardLayout";
import type { PartData } from "@/components/marine/PartsStockForm";

export default function MarineParcaEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<PartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("products").select("id, name, barcode, category, stock, price, selling_price")
      .eq("id", id).single()
      .then(({ data: row, error }) => {
        if (error || !row) { alert("Parça bulunamadı."); return; }
        setData({ id: row.id, name: row.name ?? "", barcode: row.barcode ?? "", category: row.category ?? "", stock: String(row.stock ?? 0), price: String(row.price ?? 0), selling_price: String(row.selling_price ?? 0) });
        setLoading(false);
      });
  }, [id]);

  if (loading) return <DashboardLayout><p style={{ color: "#94a3b8" }}>Yükleniyor...</p></DashboardLayout>;
  if (!data) return null;
  return <PartsStockForm initialData={data} />;
}
