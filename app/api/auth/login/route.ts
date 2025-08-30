import { NextRequest, NextResponse } from 'next/server'
import { cosmic, hasStatus } from '@/lib/cosmic'
import { verifyPassword, signJWT } from '@/lib/auth'
import { LoginRequest, User } from '@/types'

export async function POST(request: NextRequest) {
  // Handle build-time execution
  if (!process.env.JWT_SECRET) {
    if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      )
    }
    return NextResponse.json(
      { error: 'JWT_SECRET environment variable is not set' },
      { status: 500 }
    )
  }

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
    let userResponse
    try {
      userResponse = await cosmic.objects.findOne({
        type: 'users',
        'metadata.email': email
      })
    } catch (error) {
      if (hasStatus(error) && error.status === 404) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }
      throw error
    }

    const user = userResponse.object as User

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.metadata.password_hash)
    if (!isPasswordValid) {
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

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.metadata.email,
        full_name: user.metadata.full_name,
        dark_mode: user.metadata.dark_mode || false
      },
      token
    })

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
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