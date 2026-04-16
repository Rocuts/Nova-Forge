import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PUBLIC_FILE = /\.(.+)$/
const SKIP_PATHS = ["/_next", "/api", "/opengraph-image", "/twitter-image", "/favicon", "/logo", "/robots", "/sitemap"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip static files, API routes, and Next.js internals
  if (PUBLIC_FILE.test(pathname) || SKIP_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Already has a locale prefix — let it through
  if (pathname === "/en" || pathname.startsWith("/en/") || pathname === "/es" || pathname.startsWith("/es/")) {
    return NextResponse.next()
  }

  // Default: serve Spanish content at root paths without a visible redirect
  const url = request.nextUrl.clone()
  url.pathname = `/es${pathname}`
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
