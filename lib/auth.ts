import { SignJWT, jwtVerify } from 'jose'
import { JWTPayload } from '@/types'

// Make JWT_SECRET access lazy to avoid build-time errors
function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required')
  }
  return secret
}

function getSecretKey(): Uint8Array {
  return new TextEncoder().encode(getJWTSecret())
}

export async function signJWT(payload: JWTPayload): Promise<string> {
  try {
    const secret = getSecretKey()
    const jwt = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret)
    return jwt
  } catch (error) {
    console.error('JWT signing error:', error)
    throw new Error('Failed to sign JWT token')
  }
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const secret = getSecretKey()
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
    const match = authHeader.match(/auth-token=([^;]+)/)
    return match ? match[1] : null
  }
  
  return null
}