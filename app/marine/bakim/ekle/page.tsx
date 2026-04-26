"use client";
import { Suspense } from "react";
import MaintenanceForm from "@/components/marine/MaintenanceForm";
export default function MarineBakimEkle() {
  return <Suspense fallback={null}><MaintenanceForm /></Suspense>;
}
