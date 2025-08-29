import jwt, { JwtPayload } from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { JWTPayload } from '@/types'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 12)
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash)
}

export function signJWT(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
    
    // Type guard to ensure we have the expected payload structure
    if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded && 'email' in decoded) {
      return decoded as JWTPayload
    }
    
    return null
  } catch (error) {
    return null
  }
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null
  
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }
  
  return authHeader
}