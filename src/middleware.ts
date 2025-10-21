import { type NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  console.log("=== MIDDLEWARE START ===");
  console.log("Path:", request.nextUrl.pathname);
  console.log("APP_PASSWORD exists?", !!process.env.APP_PASSWORD);

  const session = request.cookies.get("expense_session")?.value;
  console.log("Session cookie:", session);

  // Skip middleware for login page and auth API
  if (
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/api/auth")
  ) {
    console.log("→ Allowing:", request.nextUrl.pathname);
    return NextResponse.next();
  }

  // If no valid session, redirect to login
  if (session !== process.env.APP_PASSWORD) {
    console.log("→ Redirecting to /login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  console.log("→ Allowing with valid session");
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
