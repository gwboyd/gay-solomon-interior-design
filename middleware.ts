import { NextResponse, type NextRequest } from "next/server"
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-session"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  const isAuthenticated = sessionToken ? await verifyAdminSessionToken(sessionToken) : false

  if (pathname === "/admin") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url))
    }

    return NextResponse.next()
  }

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/admin", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
