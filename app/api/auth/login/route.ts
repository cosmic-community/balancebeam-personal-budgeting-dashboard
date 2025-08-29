import { NextRequest, NextResponse } from 'next/server'
import { cosmic, hasStatus } from '@/lib/cosmic'
import { verifyPassword, signJWT } from '@/lib/auth'
import { validateEmail } from '@/lib/utils'
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

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Find user by email
    const response = await cosmic.objects
      .find({ 
        type: 'users',
        'metadata.email': email 
      })
      .props(['id', 'title', 'metadata'])

    const users = response.objects as User[]
    const user = users[0]

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = verifyPassword(password, user.metadata.password_hash)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate JWT
    const token = signJWT({
      userId: user.id,
      email: user.metadata.email
    })

    // Set cookie and return user data
    const response_obj = NextResponse.json({
      user: {
        id: user.id,
        email: user.metadata.email,
        full_name: user.metadata.full_name,
        dark_mode: user.metadata.dark_mode || false
      },
      token
    })

    response_obj.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response_obj
  } catch (error) {
    console.error('Login error:', error)
    
    if (hasStatus(error) && error.status === 404) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}