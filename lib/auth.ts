import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'
import { cosmic } from './cosmic'
import { User, AuthUser, JWTPayload } from '@/types'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function signJWT(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

export function extractTokenFromHeader(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const token = extractTokenFromHeader(request)
    if (!token) {
      return null
    }

    const payload = verifyJWT(token)
    if (!payload || !payload.userId) {
      return null
    }

    // Get user from Cosmic
    const { object: user } = await cosmic.objects
      .findOne({
        type: 'users',
        id: payload.userId
      })
      .props(['id', 'metadata'])

    if (!user) {
      return null
    }

    return {
      id: user.id,
      email: user.metadata.email,
      full_name: user.metadata.full_name,
      dark_mode: user.metadata.dark_mode || false
    }
  } catch (error) {
    console.error('Auth user fetch error:', error)
    return null
  }
}

export async function getCurrentUser(request: NextRequest): Promise<User | null> {
  try {
    const token = extractTokenFromHeader(request)
    if (!token) {
      return null
    }

    const payload = verifyJWT(token)
    if (!payload || !payload.userId) {
      return null
    }

    // Get full user object from Cosmic
    const { object: user } = await cosmic.objects
      .findOne({
        type: 'users',
        id: payload.userId
      })
      .props(['id', 'title', 'slug', 'metadata', 'created_at', 'modified_at'])

    return user as User || null
  } catch (error) {
    console.error('Current user fetch error:', error)
    return null
  }
}

// Helper function to convert User to AuthUser
export function userToAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.metadata.email,
    full_name: user.metadata.full_name,
    dark_mode: user.metadata.dark_mode || false
  }
}