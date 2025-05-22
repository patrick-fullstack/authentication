import { NextRequest, NextResponse } from "next/server";

// Define which paths are protected and which are public
const protectedPaths = ["/dashboard"];
const authPaths = [
  "/login",
  "/register",
  "/verify-otp",
  "/forgot-password",
  "/reset-password",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  // For debugging (remove in production)
  // if (process.env.NODE_ENV === "development") {
  //   console.log(`[Middleware] Path: ${pathname}, Auth: ${!!token}`);
  // }

  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  const isAuthPath = authPaths.some(
    (path) => pathname === path || pathname.startsWith(path)
  );

  if (pathname.startsWith("/verify-otp")) {
    return NextResponse.next();
  }

  if (isProtectedPath && !token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPath && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // For all other routes, proceed normally
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg).*)",
  ],
};
