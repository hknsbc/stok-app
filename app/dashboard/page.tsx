import { getMode } from "@/lib/getMode";
import StokDashboard from "@/components/dashboard/StokDashboard";
import PetDashboard from "@/components/dashboard/PetDashboard";
import VetDashboard from "@/components/dashboard/VetDashboard";

export default async function DashboardPage() {
  const mode = await getMode();

  if (mode === "pet") return <PetDashboard />;
  if (mode === "vet") return <VetDashboard />;
  return <StokDashboard />;
}
