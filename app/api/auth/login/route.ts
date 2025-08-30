import { NextRequest, NextResponse } from 'next/server'
import { cosmic, hasStatus } from '@/lib/cosmic'
import { signJWT, verifyPassword } from '@/lib/auth'
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
    let userResponse
    try {
      userResponse = await cosmic.objects
        .find({ 
          type: 'users',
          'metadata.email': email 
        })
        .props(['id', 'title', 'slug', 'metadata'])
        .limit(1)
    } catch (error) {
      console.error('User lookup error:', error)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check if user exists
    if (!userResponse.objects || userResponse.objects.length === 0) {
      console.log('User not found for email:', email)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const user = userResponse.objects[0] as User

    // Verify password
    const isValidPassword = await verifyPassword(password, user.metadata.password_hash)
    if (!isValidPassword) {
      console.log('Invalid password for user:', email)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate JWT
    const token = await signJWT({
      userId: user.id,
      email: user.metadata.email
    })

    // Create response with token
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.metadata.email,
        full_name: user.metadata.full_name,
        dark_mode: user.metadata.dark_mode || false
      },
      token
    })

    // Set httpOnly cookie
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