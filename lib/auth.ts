import { SignJWT, jwtVerify } from 'jose'
import { cosmic, hasStatus } from './cosmic'
import { User, AuthUser, JWTPayload } from '@/types'

const jwtSecret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

export async function signJWT(payload: JWTPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(jwtSecret)
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, jwtSecret)
    return payload as JWTPayload
  } catch (error) {
    return null
  }
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcryptjs')
  return bcrypt.hash(password, 12)
}

export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  const bcrypt = await import('bcryptjs')
  return bcrypt.compare(password, hashedPassword)
}

// Add the missing getCurrentUser function
export async function getCurrentUser(token?: string): Promise<AuthUser | null> {
  try {
    if (!token) {
      return null
    }

    const payload = await verifyJWT(token)
    if (!payload || !payload.userId) {
      return null
    }

    // Get user from Cosmic
    const userResponse = await cosmic.objects.findOne({
      type: 'users',
      id: payload.userId
    }).props(['id', 'title', 'slug', 'metadata'])

    const user = userResponse.object as User

    if (!user) {
      return null
    }

    // Convert User to AuthUser format
    return {
      id: user.id,
      email: user.metadata.email,
      full_name: user.metadata.full_name,
      dark_mode: user.metadata.dark_mode || false
    }
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return null
    }
    console.error('Get current user error:', error)
    return null
  }
}

// Helper function to convert User to AuthUser
export function userToAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.metadata.email,
    full_name: user.metadata.full_name,
    dark_mode: user.metadata.dark_mode || false
  }
}