import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/checkout(.*)",
  "/registration(.*)",
]);

// Public routes that should remain accessible even in maintenance mode
const allowedDuringMaintenance = [
  "/maintenance",
  "/api",
  "/_next",
];

let cachedMaintenanceMode: boolean | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 30 * 1000; // 30s

async function getMaintenanceMode(req: NextRequest): Promise<boolean> {
  const now = Date.now();

  // Fast cache hit
  if (cachedMaintenanceMode !== null && now - lastFetchTime < CACHE_TTL) {
    return cachedMaintenanceMode;
  }

  try {
    const res = await fetch(`${req.nextUrl.origin}/api/settings`, {
      cache: "no-store",
    });

    if (!res.ok) {
      cachedMaintenanceMode = null;
      return false;
    }

    const data = await res.json();
    cachedMaintenanceMode = Boolean(data?.maintenanceMode);
    lastFetchTime = now;

    return cachedMaintenanceMode;
  } catch {
    cachedMaintenanceMode = null;
    return false;
  }
}

function isAllowedPath(pathname: string) {
  return allowedDuringMaintenance.some((p) =>
    p === "/maintenance" ? pathname === p : pathname.startsWith(p)
  );
}

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { pathname } = req.nextUrl;

  const host = req.headers.get("host") || "";
  const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");

  // 1. Fast bypass (no async work if possible)
  if (isLocalhost || isAllowedPath(pathname)) {
    // Only enforce auth if system is live
    if (!cachedMaintenanceMode && isProtectedRoute(req)) {
      await auth.protect();
    }
    return NextResponse.next();
  }

  // 2. Maintenance gate (cached, avoids per-request fetch)
  const maintenanceMode = await getMaintenanceMode(req);

  if (maintenanceMode) {
    // Allow whitelisted paths (like /events) without login
    if (!isAllowedPath(pathname) && pathname !== "/maintenance") {
      return NextResponse.rewrite(new URL("/maintenance", req.url));
    }
    return NextResponse.next();
  }

  // 3. Auth layer (only if system is live)
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
