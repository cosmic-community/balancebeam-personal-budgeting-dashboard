import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { JWTPayload } from '@/types'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function signJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as JWTPayload
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

export async function getCurrentUser(request: Request): Promise<JWTPayload | null> {
  try {
    // Try to get token from Authorization header
    const authHeader = request.headers.get('authorization')
    let token = extractTokenFromHeader(authHeader)
    
    // If no bearer token, try cookie
    if (!token) {
      const cookieHeader = request.headers.get('cookie')
      if (cookieHeader) {
        const cookies = Object.fromEntries(
          cookieHeader.split('; ').map(c => {
            const [name, ...rest] = c.split('=')
            return [name, rest.join('=')]
          })
        )
        token = cookies['auth-token'] || null
      }
    }
    
    if (!token) {
      return null
    }
    
    return await verifyJWT(token)
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}