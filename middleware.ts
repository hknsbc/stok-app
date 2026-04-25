import { NextRequest, NextResponse } from "next/server";

export type AppMode = "stok" | "pet" | "vet" | "marine";

const DOMAIN_MODE_MAP: Record<string, AppMode> = {
  "stok.marssoft.com.tr": "stok",
  "pet.marssoft.com.tr": "pet",
  "vet.marssoft.com.tr": "vet",
  "marine.marssoft.com.tr": "marine",
};

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const hostname = host.split(":")[0];

  const mode: AppMode = DOMAIN_MODE_MAP[hostname] ?? "stok";

  // Inject into request headers so server components can read via headers()
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-app-mode", mode);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Also set as cookie so client components can read it without a server round-trip
  response.cookies.set("x-app-mode", mode, {
    path: "/",
    sameSite: "lax",
    httpOnly: false,
  });

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
