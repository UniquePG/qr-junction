import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_HOST = (process.env.NEXT_PUBLIC_ADMIN_HOST || "admin.qrjunction.in")
  .replace(/^https?:\/\//, "")
  .split(":")[0]
  .toLowerCase();

const CUSTOMER_PREFIXES = [
  "/dashboard",
  "/register",
  "/forgot-password",
  "/verify-email",
  "/reset-password",
];

function hostname(host: string) {
  return host.split(":")[0].toLowerCase();
}

function isAdminHost(host: string) {
  const name = hostname(host);
  return name === ADMIN_HOST || name === "admin.localhost" || name.startsWith("admin.");
}

function adminResponse(response: NextResponse) {
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") || "";
  if (!isAdminHost(host)) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/NewLogo") ||
    pathname.includes(".")
  ) {
    return adminResponse(NextResponse.next());
  }

  if (CUSTOMER_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return adminResponse(NextResponse.redirect(new URL("/admin", request.url)));
  }

  const url = request.nextUrl.clone();
  if (pathname === "/login") {
    url.pathname = "/admin/login";
    return adminResponse(NextResponse.rewrite(url));
  }

  url.pathname = pathname === "/" ? "/admin" : `/admin${pathname}`;
  return adminResponse(NextResponse.rewrite(url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
