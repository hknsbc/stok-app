"use client";
import { use } from "react";
import MaintenanceDetail from "@/components/marine/MaintenanceDetail";
export default function MarineBakimDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <MaintenanceDetail id={id} />;
}
