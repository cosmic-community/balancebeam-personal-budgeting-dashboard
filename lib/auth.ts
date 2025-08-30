import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcrypt'
import { JWTPayload } from '@/types'
import { getJWTSecret } from './utils'

const secret = new TextEncoder().encode(getJWTSecret())

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function signJWT(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload)
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

// User session management
export interface UserSession {
  id: string
  email: string
  full_name: string
  dark_mode: boolean
}

export function createUserSession(user: {
  id: string
  metadata: {
    email: string
    full_name: string
    dark_mode?: boolean
  }
}): UserSession {
  return {
    id: user.id,
    email: user.metadata.email,
    full_name: user.metadata.full_name,
    dark_mode: user.metadata.dark_mode ?? false
  }
}

// Get user ID from token for database queries
export function getUserIdFromToken(authHeader: string | null): string | null {
  const token = extractTokenFromHeader(authHeader)
  if (!token) return null
  
  // Note: This is a synchronous helper, for async verification use verifyJWT
  try {
    // For production use, always use verifyJWT for security
    const payload = JSON.parse(atob(token.split('.')[1])) as JWTPayload
    return payload.userId || null
  } catch {
    return null
  }
}