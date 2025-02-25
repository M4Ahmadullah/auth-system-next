import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { jwtDecode } from "jwt-decode";

const JWT_SECRET = process.env.JWT_SECRET!;

interface TokenData {
  userId: number;
  email: string;
  username: string;
  role: "ADMIN" | "USER";
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const url = request.nextUrl.pathname;

  console.log("Middleware Token:", token);

  // Check if route is protected (under /protected)
  if (request.nextUrl.pathname.startsWith("/protected")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/sign-in", request.url));
    }

    try {
      const decoded = jwtDecode<TokenData>(token);

      if (decoded.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/auth/sign-in", request.url));
    }
  }

  if (!token) {
    // 🚀 If user is NOT logged in:
    if (url.startsWith("/dashboard")) {
      console.log("Unauthorized, redirecting to Sign In");
      return NextResponse.redirect(new URL("/auth/sign-in", request.url));
    }
    return NextResponse.next(); // Allow access to sign-in / sign-up pages
  }

  try {
    // ✅ Verify JWT
    await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));

    // 🚀 If user IS logged in and trying to access `/auth/sign-in` or `/auth/sign-up`, redirect them to dashboard
    if (url.startsWith("/auth/sign-in") || url.startsWith("/auth/sign-up")) {
      console.log("Already logged in, redirecting to Dashboard");
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next(); // Allow access to protected routes
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }
}

export const config = {
  matcher: [
    "/protected/:path*",
    "/dashboard/:path*",
    "/auth/sign-in",
    "/auth/sign-up",
  ],
};
