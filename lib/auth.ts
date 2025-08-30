import * as jose from 'jose'
import { JWTPayload } from '@/types'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-development-only-not-for-production'

// Convert string secret to Uint8Array for jose library
function getSecretKey(): Uint8Array {
  return new TextEncoder().encode(JWT_SECRET)
}

export async function signJWT(payload: JWTPayload): Promise<string> {
  const secret = getSecretKey()
  
  const jwt = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret)
    
  return jwt
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const secret = getSecretKey()
    const { payload } = await jose.jwtVerify(token, secret)
    
    return payload as JWTPayload
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null
  
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  return null
}