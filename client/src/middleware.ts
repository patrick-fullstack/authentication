import { NextRequest, NextResponse } from "next/server";

// Define which paths are protected and which are public
// const protectedPaths = ["/dashboard"];
const authPaths = [
  "/login",
  "/register",
  "/verify-otp",
  "/forgot-password",
  "/reset-password",
  "/edit-profile",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // const token = request.cookies.get("token")?.value;

  // // Check if path is one that should be protected
  // const isProtectedPath = protectedPaths.some((path) =>
  //   pathname.startsWith(path)
  // );

  // Check if path is an auth path (login, register, etc)
  const isAuthPath = authPaths.some(
    (path) => pathname === path || pathname.startsWith(path)
  );

  // // If user is not logged in and tries to access protected route, redirect to login
  // if (isProtectedPath && !token) {
  //   const url = new URL("/login", request.url);
  //   return NextResponse.redirect(url);
  // }

  // // If user is logged in and tries to access auth route, redirect to dashboard
  // if (isAuthPath && token) {
  //   return NextResponse.redirect(new URL("/dashboard", request.url));
  // }

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
