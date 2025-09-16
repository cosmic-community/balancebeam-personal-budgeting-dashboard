import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { SignJWT, jwtVerify } from 'jose'
import { JWTPayload } from '@/types'

// Get JWT secret from environment
function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required')
  }
  return secret
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

// Compare password - note the correct function name
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Also export with the old name for backward compatibility
export const comparePasswords = comparePassword

// Generate JWT token using jose library
export async function generateToken(payload: JWTPayload): Promise<string> {
  const secret = new TextEncoder().encode(getJWTSecret())
  
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
  
  return token
}

// Verify JWT token using jose library
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(getJWTSecret())
    
    const { payload } = await jwtVerify(token, secret)
    
    return payload as JWTPayload
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

// Generate JWT token using legacy jsonwebtoken library (alternative implementation)
export function generateTokenLegacy(payload: JWTPayload): string {
  const secret = getJWTSecret()
  return jwt.sign(payload, secret, { expiresIn: '7d' })
}

// Verify JWT token using legacy jsonwebtoken library (alternative implementation)
export function verifyTokenLegacy(token: string): JWTPayload | null {
  try {
    const secret = getJWTSecret()
    const decoded = jwt.verify(token, secret) as JWTPayload
    return decoded
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

// Extract token from Authorization header
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7) // Remove 'Bearer ' prefix
}

// Validate email format
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate password strength
export function validatePassword(password: string): { isValid: boolean; message?: string } {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' }
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' }
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' }
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' }
  }
  
  return { isValid: true }
}

// Generate secure random string for token generation
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  const randomArray = new Uint8Array(length)
  
  if (typeof window !== 'undefined' && window.crypto) {
    // Browser environment
    window.crypto.getRandomValues(randomArray)
  } else if (typeof require !== 'undefined') {
    // Node.js environment
    const crypto = require('crypto')
    randomArray.set(crypto.randomBytes(length))
  } else {
    // Fallback to Math.random (less secure)
    for (let i = 0; i < length; i++) {
      randomArray[i] = Math.floor(Math.random() * 256)
    }
  }
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(randomArray[i] % chars.length)
  }
  
  return result
}