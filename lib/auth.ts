import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { cosmic, hasStatus } from './cosmic'
import { User, JWTPayload } from '@/types'
import bcrypt from 'bcryptjs'

// JWT secret key
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
)

// Sign JWT token
export async function signJWT(payload: JWTPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET)
}

// Verify JWT token
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as JWTPayload
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

// Get authenticated user from request
export async function getAuthUser(request: NextRequest): Promise<User | null> {
  try {
    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return null
    }

    // Verify token
    const payload = await verifyJWT(token)
    if (!payload || !payload.userId) {
      return null
    }

    // Get user from Cosmic
    const userResponse = await cosmic.objects.findOne({
      type: 'users',
      id: payload.userId
    }).props(['id', 'title', 'slug', 'metadata'])

    return userResponse.object as User
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return null
    }
    console.error('Auth user fetch error:', error)
    return null
  }
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12)
  return await bcrypt.hash(password, salt)
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

// Find user by email
export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    const response = await cosmic.objects.find({
      type: 'users',
      'metadata.email': email
    }).props(['id', 'title', 'slug', 'metadata']).limit(1)

    return response.objects[0] as User || null
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return null
    }
    throw error
  }
}

// Create user
export async function createUser(userData: {
  full_name: string
  email: string
  password: string
}): Promise<User> {
  const passwordHash = await hashPassword(userData.password)
  
  const response = await cosmic.objects.insertOne({
    type: 'users',
    title: userData.full_name,
    slug: `${userData.full_name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
    metadata: {
      full_name: userData.full_name,
      email: userData.email,
      password_hash: passwordHash,
      dark_mode: false,
      created_at: new Date().toISOString().split('T')[0]
    }
  })

  return response.object as User
}

// Set auth cookie
export function setAuthCookie(token: string) {
  const cookieStore = cookies()
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 // 24 hours
  })
}

// Clear auth cookie
export function clearAuthCookie() {
  const cookieStore = cookies()
  cookieStore.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0
  })
}