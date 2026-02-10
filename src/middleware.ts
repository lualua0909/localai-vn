import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Lightweight middleware — actual auth check happens client-side via AuthGuard.
// This middleware adds security headers and could be extended for
// server-side session verification if using Firebase Admin SDK with cookies.
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: ["/app/:path*", "/api/:path*"],
};
