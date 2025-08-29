import { NextRequest, NextResponse } from 'next/server'
import { cosmic, hasStatus } from '@/lib/cosmic'
import { createJWT, hashPassword } from '@/lib/auth'
import { generateSlug } from '@/lib/utils'
import { RegisterRequest, User } from '@/types'

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

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists
    try {
      const existingUsersResponse = await cosmic.objects
        .find({ 
          type: 'users',
          'metadata.email': email.toLowerCase()
        })
        .props(['id'])

      if (existingUsersResponse.objects.length > 0) {
        return NextResponse.json(
          { error: 'User already exists with this email' },
          { status: 409 }
        )
      }
    } catch (error) {
      // If 404, no existing user found, which is what we want
      if (hasStatus(error) && error.status === 404) {
        // Continue with user creation
      } else {
        throw error
      }
    }

    // Hash password
    const password_hash = hashPassword(password)

    // Create user
    const newUser = await cosmic.objects.insertOne({
      type: 'users',
      title: full_name,
      slug: generateSlug(full_name + '-' + Date.now()),
      metadata: {
        full_name,
        email: email.toLowerCase(),
        password_hash,
        dark_mode: false,
        created_at: new Date().toISOString().split('T')[0]
      }
    })

    const user = newUser.object as User

    // Create JWT token
    const token = await createJWT({
      userId: user.id,
      email: user.metadata.email
    })

    // Create response with user data
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
      sameSite: 'strict',
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