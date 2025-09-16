import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'
import { JWTPayload, User } from '@/types'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here'

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 12)
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
  return bcrypt.compareSync(password, hashedPassword)
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: '7d' // Extended expiration for better UX
  })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

export async function getAuthUser(request: NextRequest): Promise<User | null> {
  try {
    // Try to get token from multiple sources
    let token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      // Fallback to cookie
      token = request.cookies.get('auth-token')?.value
    }

    if (!token) {
      return null
    }

    const payload = verifyToken(token)
    if (!payload || !payload.userId) {
      return null
    }

    // Get user from Cosmic CMS
    const { cosmic } = await import('@/lib/cosmic')
    
    try {
      const { object } = await cosmic.objects
        .findOne({ 
          type: 'users', 
          id: payload.userId 
        })
        .props(['id', 'title', 'slug', 'metadata'])

      return object as User
    } catch (error) {
      console.error('User fetch error:', error)
      return null
    }
  } catch (error) {
    console.error('Auth user error:', error)
    return null
  }
}

export function isAuthenticated(request: NextRequest): boolean {
  try {
    // Check Authorization header first
    let token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      // Fallback to cookie
      token = request.cookies.get('auth-token')?.value
    }

    if (!token) {
      return false
    }

    const payload = verifyToken(token)
    return payload !== null && !!payload.userId
  } catch (error) {
    console.error('Authentication check failed:', error)
    return false
  }
}