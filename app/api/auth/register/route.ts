import { NextRequest, NextResponse } from 'next/server'
import { cosmic } from '@/lib/cosmic'
import { hashPassword, signJWT } from '@/lib/auth'
import { RegisterRequest, User } from '@/types'
import { generateSlug } from '@/lib/utils'

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
    const body: RegisterRequest = await request.json()
    const { full_name, email, password, confirmPassword } = body

    // Validate input
    if (!full_name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if user already exists
    try {
      const existingUser = await cosmic.objects.findOne({
        type: 'users',
        'metadata.email': email
      })

      if (existingUser.object) {
        return NextResponse.json(
          { error: 'User already exists with this email' },
          { status: 409 }
        )
      }
    } catch (error) {
      // User doesn't exist, continue with registration
    }

    // Hash password
    const password_hash = await hashPassword(password)

    // Create user
    const newUser = await cosmic.objects.insertOne({
      type: 'users',
      title: full_name,
      slug: generateSlug(full_name + '-' + Date.now()),
      metadata: {
        full_name,
        email,
        password_hash,
        dark_mode: false,
        created_at: new Date().toISOString().split('T')[0]
      }
    })

    const user = newUser.object as User

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
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}