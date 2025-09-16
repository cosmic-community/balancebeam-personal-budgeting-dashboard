import { NextRequest } from 'next/server'
import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { cosmic } from './cosmic'
import { JWTPayload, AuthUser, User } from '@/types'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Convert string secret to Uint8Array for jose library
const secret = new TextEncoder().encode(JWT_SECRET)

// Sign JWT using jose library (compatible with Edge Runtime)
export async function signJWT(payload: JWTPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // 7 days expiration
    .sign(secret)
}

// Verify JWT using jose library
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as JWTPayload
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12)
}

// Compare password
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

// Get authenticated user from request
export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.split(' ')[1]
    const payload = await verifyJWT(token)
    
    if (!payload || !payload.userId) {
      return null
    }

    // Fetch user from Cosmic
    const { object: user } = await cosmic.objects
      .findOne({ 
        type: 'users',
        id: payload.userId 
      })
      .props(['id', 'metadata'])

    const typedUser = user as User

    return {
      id: typedUser.id,
      email: typedUser.metadata.email,
      full_name: typedUser.metadata.full_name,
      dark_mode: typedUser.metadata.dark_mode || false
    }
  } catch (error) {
    console.error('Auth user fetch error:', error)
    return null
  }
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate password strength
export function isValidPassword(password: string): boolean {
  return password.length >= 6
}