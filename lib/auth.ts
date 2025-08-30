import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { JWTPayload } from '@/types'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
)

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function signJWT(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
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
    const token = authHeader.substring(7)
    return token || null
  }
  
  // Handle cookie format
  if (authHeader.includes('auth-token=')) {
    const token = authHeader.split('auth-token=')[1]?.split(';')[0]
    return token || null
  }
  
  // Return null instead of undefined to match expected return type
  return null
}

export function setAuthCookie(token: string): string {
  return `auth-token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict`
}

export function clearAuthCookie(): string {
  return 'auth-token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict'
}