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

  // 🔥 HARD STOP (prevents infinite loop)
  if (pathname === "/maintenance") {
    return NextResponse.next();
  }

  const host = req.headers.get("host") || "";
  const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");

  const maintenanceMode = process.env.MAINTENANCE_MODE === "true";

  // Local bypass
  if (isLocalhost) {
    if (isProtectedRoute(req)) await auth.protect();
    return NextResponse.next();
  }

  if (maintenanceMode) {
    const isAllowed =
      pathname.startsWith("/_next") || pathname.startsWith("/api/public");

    if (!isAllowed) {
      return NextResponse.rewrite(new URL("/maintenance", req.url));
    }
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
