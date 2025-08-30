import { SignJWT, jwtVerify, JWTPayload as JoseJWTPayload } from 'jose'
import bcrypt from 'bcryptjs'
import { JWTPayload } from '@/types'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'

// Convert string secret to Uint8Array for jose
function getSecretKey(): Uint8Array {
  return new TextEncoder().encode(JWT_SECRET)
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function signJWT(payload: JWTPayload): Promise<string> {
  try {
    const jwt = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d') // Token expires in 7 days
      .sign(getSecretKey())
    
    return jwt
  } catch (error) {
    console.error('Error signing JWT:', error)
    throw new Error('Failed to sign JWT')
  }
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey())
    
    // Validate the payload structure
    if (!payload.userId || !payload.email) {
      console.error('Invalid JWT payload structure')
      return null
    }
    
    return payload as JWTPayload
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null
  
  // Handle "Bearer TOKEN" format
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  // Handle direct token format
  return authHeader
}

// Middleware helper to verify authentication in API routes
export async function requireAuth(authHeader: string | null): Promise<JWTPayload> {
  const token = extractTokenFromHeader(authHeader)
  
  if (!token) {
    throw new Error('Authentication token is required')
  }

  const payload = await verifyJWT(token)
  
  if (!payload) {
    throw new Error('Invalid or expired authentication token')
  }

  return payload
}

// Client-side token management helpers
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  
  try {
    return localStorage.getItem('auth-token')
  } catch (error) {
    console.error('Error reading auth token:', error)
    return null
  }
}

export function setAuthToken(token: string): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    localStorage.setItem('auth-token', token)
    return true
  } catch (error) {
    console.error('Error storing auth token:', error)
    return false
  }
}

export function removeAuthToken(): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    localStorage.removeItem('auth-token')
    return true
  } catch (error) {
    console.error('Error removing auth token:', error)
    return false
  }
}

// Generate secure random password for development/testing
export function generateSecurePassword(length: number = 12): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'
  
  const allChars = lowercase + uppercase + numbers + symbols
  let password = ''
  
  // Ensure at least one character from each category
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}