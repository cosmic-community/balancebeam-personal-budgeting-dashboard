import { SignJWT, jwtVerify } from 'jose'
import { JWTPayload } from '@/types'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key')

export async function createJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
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
    console.error('JWT verification error:', error)
    return null
  }
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null
  
  // Handle Bearer token format
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  // Handle cookie format
  if (authHeader.includes('auth-token=')) {
    const tokenMatch = authHeader.match(/auth-token=([^;]+)/)
    return tokenMatch ? tokenMatch[1] : null
  }
  
  return authHeader
}

export function getUserIdFromToken(token: string | null): string | null {
  // Return null for undefined token instead of string | undefined
  return token || null
}