import { SignJWT, jwtVerify } from 'jose'
import { JWTPayload } from '@/types'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}

const secret = new TextEncoder().encode(JWT_SECRET)

export async function signJWT(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as JWTPayload
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) {
    return null
  }

  // Handle Bearer token format
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Handle cookie format (auth-token=...)
  if (authHeader.includes('auth-token=')) {
    const tokenMatch = authHeader.match(/auth-token=([^;]+)/)
    return tokenMatch ? tokenMatch[1] : null
  }

  // Handle direct token (fallback)
  return authHeader
}

// Cookie utilities
export function setAuthCookie(token: string): string {
  const maxAge = 7 * 24 * 60 * 60 // 7 days in seconds
  return `auth-token=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax; Secure=${process.env.NODE_ENV === 'production'}`
}

export function clearAuthCookie(): string {
  // Fixed: Handle undefined environment variable properly
  const nodeEnv = process.env.NODE_ENV || 'development'
  return `auth-token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Secure=${nodeEnv === 'production'}`
}