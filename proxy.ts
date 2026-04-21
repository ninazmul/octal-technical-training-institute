import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Protected routes
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/checkout(.*)",
  "/registration(.*)",
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { pathname } = req.nextUrl;

  const host = req.headers.get("host") || "";
  const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");

  const maintenanceMode = process.env.MAINTENANCE_MODE === "true";

  // ---------------------------------------------------
  // 0. HARD SAFETY: NEVER BLOCK MAINTENANCE ROUTE
  // ---------------------------------------------------
  if (pathname.startsWith("/maintenance")) {
    return NextResponse.next();
  }

  // ---------------------------------------------------
  // 1. LOCAL DEV BYPASS
  // ---------------------------------------------------
  if (isLocalhost) {
    if (isProtectedRoute(req)) {
      await auth.protect();
    }
    return NextResponse.next();
  }

  // ---------------------------------------------------
  // 2. MAINTENANCE MODE (SAFE REDIRECT ONLY)
  // ---------------------------------------------------
  if (maintenanceMode) {
    const isPublicInternalRoute =
      pathname.startsWith("/api") || pathname.startsWith("/_next");

    // Redirect homepage → maintenance
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/maintenance", req.url));
    }

    // Block everything except internal assets
    if (!isPublicInternalRoute) {
      return NextResponse.redirect(new URL("/maintenance", req.url));
    }

    return NextResponse.next();
  }

  // ---------------------------------------------------
  // 3. AUTH PROTECTION (NORMAL MODE)
  // ---------------------------------------------------
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next internals + static assets + maintenance page
    "/((?!_next|maintenance|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:css|js|jpg|jpeg|png|gif|svg|woff2?|ico)).*)",
    "/(api|trpc)(.*)",
  ],
};
