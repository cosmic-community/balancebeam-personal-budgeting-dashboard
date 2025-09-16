import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { JWTPayload, AuthUser } from '@/types'
import { cosmic } from './cosmic'

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key'

// Export comparePasswords function (was missing export)
export async function comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword)
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function generateToken(payload: JWTPayload): Promise<string> {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

// Export verifyToken function (was missing export)
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const payload = await verifyToken(token)
    
    if (!payload || !payload.userId) {
      return null
    }

    // Fetch user from Cosmic
    const { object: user } = await cosmic.objects.findOne({
      type: 'users',
      id: payload.userId
    })

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

export async function authenticateUser(email: string, password: string): Promise<AuthUser | null> {
  try {
    // Find user by email
    const response = await cosmic.objects.find({
      type: 'users',
      'metadata.email': email
    }).props(['id', 'title', 'metadata'])

    if (!response.objects || response.objects.length === 0) {
      return null
    }

    const user = response.objects[0]
    
    // Compare password
    const isValid = await comparePasswords(password, user.metadata.password_hash)
    
    if (!isValid) {
      return null
    }

    return {
      id: user.id,
      email: user.metadata.email,
      full_name: user.metadata.full_name,
      dark_mode: user.metadata.dark_mode || false
    }
  } catch (error) {
    console.error('User authentication error:', error)
    return null
  }
}

export async function createUser(fullName: string, email: string, password: string): Promise<AuthUser | null> {
  try {
    // Check if user already exists
    const existingResponse = await cosmic.objects.find({
      type: 'users',
      'metadata.email': email
    }).props(['id'])

    if (existingResponse.objects && existingResponse.objects.length > 0) {
      throw new Error('User already exists')
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user
    const newUser = await cosmic.objects.insertOne({
      type: 'users',
      title: fullName,
      slug: `${fullName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      metadata: {
        full_name: fullName,
        email,
        password_hash: passwordHash,
        dark_mode: false,
        created_at: new Date().toISOString().split('T')[0]
      }
    })

    return {
      id: newUser.object.id,
      email: newUser.object.metadata.email,
      full_name: newUser.object.metadata.full_name,
      dark_mode: newUser.object.metadata.dark_mode || false
    }
  } catch (error) {
    console.error('User creation error:', error)
    return null
  }
}

// Fixed: Handle Next.js 15+ cookies Promise properly
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies() // Await the Promise in Next.js 15+
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  })
}

// Fixed: Handle Next.js 15+ cookies Promise properly  
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies() // Await the Promise in Next.js 15+
  cookieStore.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0
  })
}

export async function getTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies() // Await the Promise in Next.js 15+
  return cookieStore.get('auth-token')?.value || null
}