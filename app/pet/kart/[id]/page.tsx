"use client";
import { use } from "react";
import PetCardDetail from "@/components/pet/PetCardDetail";

export default function PetKartDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <PetCardDetail id={id} />;
}
