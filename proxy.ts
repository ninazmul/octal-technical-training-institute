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
      pathname.startsWith("/public") ||
      pathname === "/favicon.ico" ||
      pathname === "/robots.txt" ||
      pathname === "/sitemap.xml";

    // Redirect homepage → maintenance
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/maintenance", req.url));
    }

    // Block everything else except allowed paths
    if (!isAllowed) {
      return NextResponse.redirect(new URL("/maintenance", req.url));
    }

    // Protect dashboard routes
    if (pathname.startsWith("/dashboard") && isProtectedRoute(req)) {
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
    "/((?!_next|static|public|favicon.ico|robots.txt|sitemap.xml|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|woff2?|ico)).*)",
    "/(api|trpc)(.*)",
  ],
};