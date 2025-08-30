import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { cosmic, hasStatus } from '@/lib/cosmic'
import { signJWT } from '@/lib/auth'
import { generateSlug } from '@/lib/utils'
import { User } from '@/types'

interface RegisterRequestBody {
  full_name: string
  email: string
  password: string
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequestBody = await request.json()
    const { full_name, email, password } = body

    // Validate input
    if (!full_name || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists
    try {
      const existingUserResponse = await cosmic.objects.find({
        type: 'users',
        'metadata.email': email.toLowerCase()
      }).props(['id', 'metadata'])

      if (existingUserResponse.objects.length > 0) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 409 }
        )
      }
    } catch (error) {
      // If 404, user doesn't exist, which is what we want
      if (!hasStatus(error) || error.status !== 404) {
        console.error('Error checking existing user:', error)
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        )
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user
    const newUser = await cosmic.objects.insertOne({
      type: 'users',
      title: full_name,
      slug: generateSlug(full_name + '-' + Date.now()),
      metadata: {
        full_name,
        email: email.toLowerCase(),
        password_hash: passwordHash,
        dark_mode: false,
        created_at: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
      }
    })

    const user = newUser.object as User

    // Generate JWT token
    const token = await signJWT({
      userId: user.id,
      email: user.metadata.email
    })

    // Set cookie
    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.metadata.email,
        full_name: user.metadata.full_name,
        dark_mode: user.metadata.dark_mode
      }
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
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