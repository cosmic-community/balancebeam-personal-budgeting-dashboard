import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { JWTPayload } from '@/types'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}

const secret = new TextEncoder().encode(JWT_SECRET)

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12)
  return bcrypt.hash(password, salt)
}

export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function signJWT(payload: { userId: string; email: string }): Promise<string> {
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
  if (!authHeader) return null
  
  // Handle Bearer token format
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  // Handle cookie format (auth-token=...)
  if (authHeader.includes('auth-token=')) {
    const match = authHeader.match(/auth-token=([^;]+)/)
    return match ? match[1] : null
  }
  
  return authHeader
}

export async function getUserFromJWT(token: string): Promise<{ userId: string; email: string } | null> {
  const payload = await verifyJWT(token)
  if (!payload || !payload.userId || !payload.email) {
    return null
  }
  
  // Fix TypeScript error: handle potentially undefined userId by validating it exists
  const userId = payload.userId
  const email = payload.email
  
  if (typeof userId !== 'string' || typeof email !== 'string') {
    return null
  }
  
  return { userId, email }
}