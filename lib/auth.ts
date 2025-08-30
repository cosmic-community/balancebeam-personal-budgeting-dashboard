import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { JWTPayload } from '@/types'

const JWT_SECRET = process.env.JWT_SECRET
const secret = JWT_SECRET ? new TextEncoder().encode(JWT_SECRET) : null

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function signJWT(payload: JWTPayload): Promise<string> {
  if (!secret || !JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set')
  }

  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret)
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  if (!secret || !JWT_SECRET) {
    // During build time, return null instead of throwing error
    if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
      return null
    }
    throw new Error('JWT_SECRET environment variable is not set')
  }

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