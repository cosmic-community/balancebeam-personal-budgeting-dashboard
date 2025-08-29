import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { JWTPayload } from '@/types'

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key'

export function createJWT(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export function comparePasswords(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null
  
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  return null
}