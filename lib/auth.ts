import { SignJWT, jwtVerify } from 'jose'
import { JWTPayload } from '@/types'
import bcrypt from 'bcryptjs'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key')

export async function createJWT(payload: JWTPayload): Promise<string> {
  return await new SignJWT(payload as any) // Cast to any to resolve type conflict with jose
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret)
}

export async function signJWT(payload: JWTPayload): Promise<string> {
  return createJWT(payload)
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    
    // Ensure the payload has the required properties
    if (typeof payload.userId === 'string' && typeof payload.email === 'string') {
      return {
        userId: payload.userId,
        email: payload.email,
        iat: payload.iat,
        exp: payload.exp
      }
    }
    
    return null
  } catch (error) {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null
  
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  return null
}