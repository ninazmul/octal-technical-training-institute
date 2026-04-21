import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/checkout(.*)",
  "/registration(.*)",
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { pathname } = req.nextUrl;

  const host = req.headers.get("host") || "";
  const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");

  // ✅ Read from ENV (edge-safe)
  const maintenanceMode = process.env.MAINTENANCE_MODE === "true";

  // 1. Localhost bypass
  if (isLocalhost) {
    if (isProtectedRoute(req)) await auth.protect();
    return NextResponse.next();
  }

  // 2. Maintenance logic
  if (maintenanceMode) {
    const isAllowed =
      pathname === "/maintenance" ||
      pathname.startsWith("/api") ||
      pathname.startsWith("/_next") ||
      pathname.startsWith("/static") ||
      pathname.startsWith("/public");

    // Force homepage → maintenance
    if (pathname === "/") {
      return NextResponse.rewrite(new URL("/maintenance", req.url));
    }

    // Block everything else
    if (!isAllowed) {
      return NextResponse.rewrite(new URL("/maintenance", req.url));
    }

    // Still protect dashboard
    if (
      (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) &&
      isProtectedRoute(req)
    ) {
      await auth.protect();
    }

    return NextResponse.next();
  }

  // 3. Normal auth
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|woff2?|ico)).*)",
    "/(api|trpc)(.*)",
  ],
};
