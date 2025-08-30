import { SignJWT, jwtVerify } from 'jose'
import { JWTPayload } from '@/types'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

export async function signJWT(payload: JWTPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
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
    // FIXED: Convert undefined to null to match return type
    return token || null
  }

  // Handle cookie format
  if (authHeader.includes('auth-token=')) {
    const token = authHeader.split('auth-token=')[1]?.split(';')[0]
    // FIXED: Convert undefined to null to match return type
    return token || null
  }

  // FIXED: This was likely the line causing the error
  // The function should return string | null, but undefined was being returned
  return null
}

export async function hashPassword(password: string): Promise<string> {
  // This would typically use bcrypt, but for this example we'll use a simple hash
  const bcrypt = require('bcryptjs')
  return await bcrypt.hash(password, 12)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  const bcrypt = require('bcryptjs')
  return await bcrypt.compare(password, hash)
}