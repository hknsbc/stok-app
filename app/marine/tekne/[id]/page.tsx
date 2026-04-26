"use client";
import { use } from "react";
import BoatCardDetail from "@/components/marine/BoatCardDetail";
export default function MarineTekneDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <BoatCardDetail id={id} />;
}
