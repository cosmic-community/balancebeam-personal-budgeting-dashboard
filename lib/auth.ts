import { SignJWT, jwtVerify } from 'jose'
import { JWTPayload } from '@/types'

const secretKey = process.env.JWT_SECRET || 'your-secret-key-here'
const key = new TextEncoder().encode(secretKey)

export async function signJWT(payload: JWTPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key)
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key)
    return payload as JWTPayload
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null
  
  // Check for Bearer token format
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  // Check for cookie format
  if (authHeader.includes('auth-token=')) {
    const match = authHeader.match(/auth-token=([^;]+)/)
    return match ? match[1] : null
  }
  
  return null
}