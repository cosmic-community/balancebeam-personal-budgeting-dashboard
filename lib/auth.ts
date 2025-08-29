import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { JWTPayload } from '@/types'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set')
}

const secret = new TextEncoder().encode(JWT_SECRET)

export async function createJWT(payload: { userId: string; email: string }): Promise<string> {
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

export function hashPassword(password: string): string {
  if (!password) {
    throw new Error('Password is required')
  }
  return bcrypt.hashSync(password, 12)
}

export function comparePassword(password: string, hash: string): boolean {
  if (!password || !hash) {
    return false
  }
  return bcrypt.compareSync(password, hash)
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) {
    return null
  }
  
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  // Handle cookie format
  if (authHeader.includes('auth-token=')) {
    const match = authHeader.match(/auth-token=([^;]+)/)
    return match ? match[1] : null
  }
  
  return null
}