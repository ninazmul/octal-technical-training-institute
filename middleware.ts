import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const allowedPaths = ["/maintenance", "/api", "/_next"];

  const isAllowedPath = allowedPaths.some((path) => pathname.startsWith(path));

  const host = req.headers.get("host") || "";

  const isLocalhost =
    host.includes("localhost:3000") || host.includes("127.0.0.1");

  // Fetch setting (with caching recommended)
  const res = await fetch(`${req.nextUrl.origin}/api/settings`, {
    next: { revalidate: 60 },
  });

  const { maintenanceMode } = await res.json();

  if (maintenanceMode && !isAllowedPath && !isLocalhost) {
    return NextResponse.rewrite(new URL("/maintenance", req.url));
  }

  return NextResponse.next();
}
