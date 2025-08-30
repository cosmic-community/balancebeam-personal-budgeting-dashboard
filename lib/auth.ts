import { SignJWT, jwtVerify } from 'jose'
import { JWTPayload } from '@/types'

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key-for-development-only-please-change-in-production'
)

export async function generateJWT(payload: { userId: string; email: string }): Promise<string> {
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
  
  return jwt
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    
    // Type guard to ensure payload has required properties
    if (
      payload &&
      typeof payload === 'object' &&
      'userId' in payload &&
      'email' in payload &&
      typeof payload.userId === 'string' &&
      typeof payload.email === 'string'
    ) {
      return payload as JWTPayload
    }
    
    return null
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null
  
  // Handle both "Bearer token" and direct token formats
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