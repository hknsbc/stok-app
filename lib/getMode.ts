import { headers } from "next/headers";

export type AppMode = "stok" | "pet" | "vet";

// Server-only: reads the x-app-mode header injected by middleware.
// Falls back to "stok" so stok.marssoft.com.tr always works as before.
export async function getMode(): Promise<AppMode> {
  const headersList = await headers();
  const mode = headersList.get("x-app-mode") as AppMode | null;
  return mode ?? "stok";
}
