import { SignJWT, jwtVerify } from 'jose'
import { JWTPayload } from '@/types'
import bcrypt from 'bcryptjs'

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key-for-development'
)

export async function signJWT(payload: JWTPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
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
  if (!authHeader) return null
  
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  return null
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12)
}

// Fixed: Export the missing comparePasswords function
export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

export function getJWTSecret(): string | null {
  // Fixed: Handle undefined by converting to null
  const secret = process.env.JWT_SECRET
  return secret !== undefined ? secret : null
}