import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt, encrypt } from "@/lib/session";

// Session refresh threshold: refresh if less than 5 minutes remaining
const SESSION_DURATION_MS = 10 * 60 * 1000;
const REFRESH_THRESHOLD_MS = 5 * 60 * 1000;

// Routes that require login
const protectedRoutes = ["/profile", "/admin", "/npp"];
// Routes only for guests (redirect to home if logged in)
const authRoutes = ["/login"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // HTTP→HTTPS redirect (trên production, loại trừ localhost)
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const isHttp = forwardedProto === "http" || (!forwardedProto && request.nextUrl.protocol === "http:");
  if (isHttp) {
    const host = request.headers.get("host") || request.nextUrl.host;
    if (!host.includes("localhost") && !host.includes("127.0.0.1")) {
      const httpsUrl = `https://${host}${pathname}${request.nextUrl.search}`;
      return NextResponse.redirect(httpsUrl, 301);
    }
  }

  // API routes: chỉ cần HTTP→HTTPS redirect, không xử lý session
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("session")?.value;
  const session = await decrypt(sessionCookie);
  const now = new Date();
  const isLoggedIn = !!session && new Date(session.expiresAt) > now;

  // If session exists but is expired, delete cookie
  if (sessionCookie && !isLoggedIn) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("session");
    return response;
  }

  // Auto-refresh session if logged in and less than 5 min remaining
  if (isLoggedIn && session) {
    const expiresAt = new Date(session.expiresAt);
    const msRemaining = expiresAt.getTime() - now.getTime();
    if (msRemaining < REFRESH_THRESHOLD_MS) {
      const newExpiresAt = new Date(now.getTime() + SESSION_DURATION_MS);
      const newSession = await encrypt({
        userId: session.userId,
        username: session.username,
        displayName: session.displayName,
        role: session.role,
        expiresAt: newExpiresAt,
      });
      const response = NextResponse.next();
      response.cookies.set("session", newSession, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: newExpiresAt,
        sameSite: "lax",
        path: "/",
      });
      return response;
    }
  }

  // Redirect unauthenticated users from protected routes
  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect logged-in users away from auth pages
  if (authRoutes.some((route) => pathname.startsWith(route)) && isLoggedIn) {
    // Redirect based on role
    const role = session?.role;
    const redirectTo = role === "admin" ? "/admin" : role === "npp" ? "/npp" : "/";
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png).*)",
  ],
};
