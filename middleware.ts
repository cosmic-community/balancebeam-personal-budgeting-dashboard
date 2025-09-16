import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isAuthenticated } from '@/lib/auth'

export function middleware(request: NextRequest) {
  // Check if the request is for a protected route
  const protectedPaths = ['/dashboard']
  const pathname = request.nextUrl.pathname

  // Check if the current path starts with any protected path
  const isProtectedRoute = protectedPaths.some(path => 
    pathname.startsWith(path)
  )

  if (isProtectedRoute) {
    // Check authentication
    if (!isAuthenticated(request)) {
      // Redirect to login page
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Continue with the request
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes - they handle their own auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}