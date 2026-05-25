import { NextRequest, NextResponse } from "next/server";

const PROD_COOKIE = "__Host-staff_session";
const DEV_COOKIE = "staff_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login" || pathname.startsWith("/admin/api/")) {
    return NextResponse.next();
  }

  const cookieName =
    process.env.NODE_ENV === "production" ? PROD_COOKIE : DEV_COOKIE;
  const token = request.cookies.get(cookieName)?.value;

  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
