import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { JWTPayload } from '@/types'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-development-only-change-in-production'
const secret = new TextEncoder().encode(JWT_SECRET)

export async function signJWT(payload: JWTPayload): Promise<string> {
  return await new SignJWT(payload)
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
  if (!authHeader) return null
  
  // Handle Bearer token format
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  // Handle cookie format
  if (authHeader.includes('auth-token=')) {
    const cookieValue = authHeader.split('auth-token=')[1]
    return cookieValue ? cookieValue.split(';')[0] : null
  }
  
  return null
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hashedPassword)
  } catch (error) {
    console.error('Password verification error:', error)
    return false
  }
}