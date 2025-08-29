import jwt from 'jsonwebtoken'
import { JWTPayload } from '@/types'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'

export function createJWT(payload: { userId: string; email: string }): string {
  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    return null
  }
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null
  
  // Handle Bearer token format
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  // Handle cookie format
  if (authHeader.includes('auth-token=')) {
    const match = authHeader.match(/auth-token=([^;]+)/)
    return match ? match[1] : null
  }
  
  return authHeader
}