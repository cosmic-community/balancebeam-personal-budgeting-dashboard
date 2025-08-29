import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { JWTPayload } from '@/types'

const JWT_SECRET = process.env.JWT_SECRET as string

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function signJWT(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyJWT(token: string | null | undefined): JWTPayload | null {
  if (!token) return null
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    return null
  }
}

export function extractTokenFromHeader(authHeader: string | null | undefined): string | null {
  if (!authHeader) return null
  
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  return null
}