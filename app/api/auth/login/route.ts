import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { cosmic, hasStatus } from '@/lib/cosmic'
import { generateJWT } from '@/lib/auth'
import { User, LoginRequest } from '@/types'
import { validateEmail } from '@/lib/utils'

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
    let userResponse
    try {
      userResponse = await cosmic.objects
        .find({ 
          type: 'users',
          'metadata.email': email 
        })
        .props(['id', 'title', 'slug', 'metadata'])
    } catch (error) {
      if (hasStatus(error) && error.status === 404) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }
      throw error
    }

    const users = userResponse.objects as User[]
    const user = users?.[0]

    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password - add null check for password_hash
    if (!user.metadata?.password_hash) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const isValidPassword = await bcrypt.compare(password, user.metadata.password_hash)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate JWT token with proper null checks
    const token = await generateJWT({
      userId: user.id,
      email: user.metadata?.email || '',
      full_name: user.metadata?.full_name || '',
      dark_mode: user.metadata?.dark_mode || false
    })

    // Create response with auth cookie
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.metadata?.email || '',
        full_name: user.metadata?.full_name || '',
        dark_mode: user.metadata?.dark_mode || false
      }
    })

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
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