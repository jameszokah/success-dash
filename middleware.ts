import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === "/login" || path === "/forgot-password"

  // Get the session token from cookies
  const token = request.cookies.get("token")?.value || ""

  // Redirect logic
  if (isPublicPath && token) {
    // If user is logged in and tries to access login page, redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  if (!isPublicPath && !token) {
    // If user is not logged in and tries to access protected route, redirect to login
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/podcasts/:path*",
    "/devotionals/:path*",
    "/users/:path*",
    "/analytics/:path*",
    "/courses/:path*",
    "/settings/:path*",
    "/login",
    "/forgot-password",
  ],
}
