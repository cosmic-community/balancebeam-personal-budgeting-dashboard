import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { cosmic, hasStatus } from '@/lib/cosmic'
import { signJWT } from '@/lib/auth'
import { generateSlug } from '@/lib/utils'
import { RegisterRequest } from '@/types'

export async function POST(request: NextRequest) {
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

    const emailLower = email.toLowerCase()

    // Check if user already exists
    try {
      await cosmic.objects.findOne({
        type: 'users',
        'metadata.email': emailLower
      })
      
      // If we reach here, user exists
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    } catch (error) {
      // 404 is expected - user doesn't exist, so we can proceed
      if (!hasStatus(error) || error.status !== 404) {
        throw error
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    // Create user
    const newUser = await cosmic.objects.insertOne({
      type: 'users',
      title: full_name,
      slug: generateSlug(`${full_name}-${Date.now()}`),
      metadata: {
        full_name,
        email: emailLower,
        password_hash: passwordHash,
        dark_mode: false,
        created_at: new Date().toISOString().split('T')[0]
      }
    })

    // Create JWT token
    const token = await signJWT({
      userId: newUser.object.id,
      email: emailLower
    })

    // Create response with token
    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: newUser.object.id,
        email: emailLower,
        full_name,
        dark_mode: false
      }
    })

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
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