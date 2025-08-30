import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { JWTPayload } from '@/types'
import { getJWTSecret } from './utils'

// Get JWT secret as Uint8Array for jose library
function getJWTSecretKey(): Uint8Array {
  const secret = getJWTSecret()
  return new TextEncoder().encode(secret)
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Create JWT token
export async function createJWT(payload: JWTPayload): Promise<string> {
  const secret = getJWTSecretKey()
  
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret)
}

// Verify JWT token
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const secret = getJWTSecretKey()
    const { payload } = await jwtVerify(token, secret)
    return payload as JWTPayload
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

// Extract token from Authorization header
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) {
    return null
  }
  
  // Handle "Bearer token" format
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  // Handle direct token or cookie format
  if (authHeader.includes('auth-token=')) {
    const tokenMatch = authHeader.match(/auth-token=([^;]+)/)
    return tokenMatch ? tokenMatch[1] : null
  }
  
  // Return as-is if it looks like a direct token
  return authHeader
}

// Validate user input
export function validateUserInput(data: {
  full_name?: string
  email?: string
  password?: string
  confirmPassword?: string
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (data.full_name !== undefined) {
    if (!data.full_name.trim()) {
      errors.push('Full name is required')
    } else if (data.full_name.trim().length < 2) {
      errors.push('Full name must be at least 2 characters')
    }
  }
  
  if (data.email !== undefined) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!data.email.trim()) {
      errors.push('Email is required')
    } else if (!emailRegex.test(data.email)) {
      errors.push('Please enter a valid email address')
    }
  }
  
  if (data.password !== undefined) {
    if (!data.password) {
      errors.push('Password is required')
    } else if (data.password.length < 8) {
      errors.push('Password must be at least 8 characters')
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
      errors.push('Password must contain at least one uppercase letter, one lowercase letter, and one number')
    }
  }
  
  if (data.confirmPassword !== undefined && data.password !== undefined) {
    if (data.password !== data.confirmPassword) {
      errors.push('Passwords do not match')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}