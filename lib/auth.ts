import { SignJWT, jwtVerify, type JWTPayload as BaseJWTPayload } from 'jose'
import { NextRequest } from 'next/server'
import { JWTPayload } from '@/types'
import { getJWTSecret } from '@/lib/utils'
import bcrypt from 'bcryptjs'

function getJWTSecretSafe(): TextEncoder {
  try {
    const secret = getJWTSecret()
    return new TextEncoder().encode(secret)
  } catch (error) {
    // During build time, if JWT_SECRET is not available, use a fallback
    // This prevents build failures while ensuring runtime security
    if (process.env.NODE_ENV !== 'production') {
      return new TextEncoder().encode('build-time-fallback-secret-change-in-production')
    }
    throw error
  }
}

export async function signJWT(payload: JWTPayload): Promise<string> {
  try {
    const secret = getJWTSecretSafe()
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d') // Token expires in 7 days
      .sign(secret)
    
    return token
  } catch (error) {
    console.error('JWT signing error:', error)
    throw new Error('Failed to sign JWT')
  }
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const secret = getJWTSecretSafe()
    const { payload } = await jwtVerify(token, secret)
    return payload as JWTPayload
  } catch (error) {
    console.error('JWT verification error:', error)
    return null
  }
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7) // Remove "Bearer " prefix
}

export async function hashPassword(password: string): Promise<string> {
  try {
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    return hashedPassword
  } catch (error) {
    console.error('Password hashing error:', error)
    throw new Error('Failed to hash password')
  }
}

export async function comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
  try {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword)
    return isMatch
  } catch (error) {
    console.error('Password comparison error:', error)
    return false
  }
}

export async function getUserFromRequest(request: NextRequest): Promise<JWTPayload | null> {
  const authHeader = request.headers.get('authorization')
  const token = extractTokenFromHeader(authHeader)
  
  if (!token) {
    return null
  }

  return await verifyJWT(token)
}