import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcrypt'
import { JWTPayload } from '@/types'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

export async function createJWT(payload: JWTPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET)
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as JWTPayload
  } catch (error) {
    return null
  }
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) {
    return null
  }

  // Handle Bearer token format
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }

  // Handle cookie format (extract from cookie string)
  if (authHeader.includes('auth-token=')) {
    const tokenMatch = authHeader.match(/auth-token=([^;]+)/)
    return tokenMatch ? tokenMatch[1] : null
  }

  return authHeader
}