import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { cosmic } from './cosmic'
import { User, AuthUser, JWTPayload } from '@/types'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-development'

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function signJWT(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d'
  })
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    return null
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const response = await cosmic.objects
      .find({ 
        type: 'users',
        'metadata.email': email
      })
      .props(['id', 'title', 'slug', 'metadata'])
      .limit(1)

    const user = response.objects[0] as User
    return user || null
  } catch (error) {
    console.error('Error fetching user by email:', error)
    return null
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const response = await cosmic.objects
      .findOne({ 
        type: 'users',
        id: id
      })
      .props(['id', 'title', 'slug', 'metadata'])

    return response.object as User
  } catch (error) {
    console.error('Error fetching user by ID:', error)
    return null
  }
}

export async function createUser(userData: {
  full_name: string
  email: string
  password: string
}): Promise<User> {
  const hashedPassword = await hashPassword(userData.password)
  
  const response = await cosmic.objects.insertOne({
    type: 'users',
    title: userData.full_name,
    slug: `${userData.full_name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
    metadata: {
      full_name: userData.full_name,
      email: userData.email,
      password_hash: hashedPassword,
      dark_mode: false,
      created_at: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    }
  })

  return response.object as User
}

export async function authenticateUser(email: string, password: string): Promise<AuthUser | null> {
  const user = await getUserByEmail(email)
  
  if (!user || !user.metadata) {
    return null
  }

  const isValidPassword = await verifyPassword(password, user.metadata.password_hash)
  
  if (!isValidPassword) {
    return null
  }

  return {
    id: user.id,
    email: user.metadata.email,
    full_name: user.metadata.full_name,
    dark_mode: user.metadata.dark_mode || false
  }
}

export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    const payload = verifyJWT(token)
    
    if (!payload || !payload.userId) {
      return null
    }

    const user = await getUserById(payload.userId)
    
    if (!user || !user.metadata) {
      return null
    }

    return {
      id: user.id,
      email: user.metadata.email,
      full_name: user.metadata.full_name,
      dark_mode: user.metadata.dark_mode || false
    }
  } catch (error) {
    console.error('Error getting auth user:', error)
    return null
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  return authHeader.substring(7)
}

export async function validateAuthToken(token: string): Promise<AuthUser | null> {
  try {
    const payload = verifyJWT(token)
    
    if (!payload || !payload.userId) {
      return null
    }

    const user = await getUserById(payload.userId)
    
    // Fixed: Added proper null check for user and user.metadata
    if (!user || !user.metadata) {
      return null
    }

    return {
      id: user.id,
      email: user.metadata.email,
      full_name: user.metadata.full_name,
      dark_mode: user.metadata.dark_mode || false
    }
  } catch (error) {
    console.error('Error validating auth token:', error)
    return null
  }
}