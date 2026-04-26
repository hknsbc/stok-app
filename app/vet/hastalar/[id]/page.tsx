"use client";
import { use } from "react";
import VetPatientDetail from "@/components/vet/VetPatientDetail";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <VetPatientDetail id={id} />;
}
