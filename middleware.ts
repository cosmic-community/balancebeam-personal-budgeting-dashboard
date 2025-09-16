import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  // Check if the path starts with /dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      const payload = await verifyToken(token)
      if (!payload) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Redirect authenticated users away from login/signup pages
  if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup') {
    const token = request.cookies.get('auth-token')?.value

    if (token) {
      try {
        const payload = await verifyToken(token)
        if (payload) {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      } catch (error) {
        // Token is invalid, allow access to login/signup
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup']
}