import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/checkout(.*)",
  "/registration(.*)",
]);

const allowedDuringMaintenance = ["/maintenance", "/api", "/_next"];

// ------------------------------
// Edge-safe in-memory cache
// ------------------------------
let cachedMaintenanceMode: boolean | null = null;
let lastFetchTime = 0;

const CACHE_TTL = 30 * 1000; // 30s

async function getMaintenanceMode(req: NextRequest): Promise<boolean> {
  const now = Date.now();

  if (cachedMaintenanceMode !== null && now - lastFetchTime < CACHE_TTL) {
    return cachedMaintenanceMode;
  }

  try {
    const res = await fetch(`${req.nextUrl.origin}/api/settings`, {
      cache: "no-store",
    });
    const data = await res.json();

    cachedMaintenanceMode = Boolean(data?.maintenanceMode);
    lastFetchTime = now;

    return cachedMaintenanceMode;
  } catch {
    // Fail-safe: reset cache and assume system is live
    cachedMaintenanceMode = null;
    return false;
  }
}

function isAllowedPath(pathname: string) {
  return allowedDuringMaintenance.some((p) =>
    p === "/maintenance" ? pathname === p : pathname.startsWith(p)
  );
}

// ------------------------------
// Middleware pipeline
// ------------------------------
export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { pathname } = req.nextUrl;

  const host = req.headers.get("host") || "";
  const isLocalhost =
    host.includes("localhost") || host.includes("127.0.0.1");

  // 1. Fast bypass
  if (isLocalhost || isAllowedPath(pathname)) {
    if (isProtectedRoute(req)) await auth.protect();
    return NextResponse.next();
  }

  // 2. Maintenance gate
  const maintenanceMode = await getMaintenanceMode(req);

  if (maintenanceMode && pathname !== "/maintenance") {
    return NextResponse.rewrite(new URL("/maintenance", req.url));
  }

  // 3. Auth layer
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
