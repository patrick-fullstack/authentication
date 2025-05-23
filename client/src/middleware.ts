import { NextRequest, NextResponse } from "next/server";

// Define which paths are protected and which are auth paths
const protectedPaths = ["/dashboard", "/edit-profile", "/posts"];
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

  // Check if path is exactly an auth path (not including sub-paths)
  // This prevents redirects from sub-paths like /posts/123
  const isExactAuthPath = authPaths.some((path) => pathname === path);

  // Check if path is a protected path or starts with a protected path
  const isProtectedPath = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(path)
  );

  // If user is not logged in and tries to access protected route, redirect to login
  if (isProtectedPath && !token) {
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url);
  }

  // Only redirect from exact auth paths (not sub-paths)
  // This allows you to stay on pages like /posts/123 when reloading
  if (isExactAuthPath && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

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
