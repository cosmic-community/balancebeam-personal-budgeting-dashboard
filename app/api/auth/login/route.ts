import { NextRequest, NextResponse } from 'next/server'
import { signJWT, verifyPassword } from '@/lib/auth'
import { cosmic, hasStatus } from '@/lib/cosmic'
import { User, LoginRequest } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user by email
    let user: User | null = null
    try {
      const userResponse = await cosmic.objects.findOne({
        type: 'users',
        'metadata.email': email
      }).props(['id', 'title', 'slug', 'metadata'])
      
      user = userResponse.object as User
    } catch (error) {
      if (hasStatus(error) && error.status === 404) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }
      throw error
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.metadata.password_hash)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create JWT token
    const token = await signJWT({
      userId: user.id,
      email: user.metadata.email
    })

    // Create response with user data (exclude password hash)
    const userData = {
      id: user.id,
      email: user.metadata.email,
      full_name: user.metadata.full_name,
      dark_mode: user.metadata.dark_mode || false
    }

    const response = NextResponse.json({
      user: userData,
      token
    })

    // Set HTTP-only cookie for additional security
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}