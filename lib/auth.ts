import { SignJWT, jwtVerify } from 'jose'
import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { JWTPayload } from '@/types'

const jwtSecret = process.env.JWT_SECRET
if (!jwtSecret) {
  throw new Error('JWT_SECRET environment variable is required')
}

const secret = new TextEncoder().encode(jwtSecret)

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function signJWT(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as JWTPayload
  } catch (error) {
    console.error('JWT verification failed:', error)
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
    const tokenMatch = authHeader.match(/auth-token=([^;]+)/)
    return tokenMatch ? tokenMatch[1] : null
  }
  
  return null
}

export async function getAuthenticatedUser(request: NextRequest): Promise<JWTPayload | null> {
  const authHeader = request.headers.get('authorization')
  const cookieHeader = request.headers.get('cookie')
  
  let token = extractTokenFromHeader(authHeader)
  
  // If no bearer token, try to extract from cookies
  if (!token && cookieHeader) {
    token = extractTokenFromHeader(cookieHeader)
  }
  
  if (!token) return null
  
  return verifyJWT(token)
}