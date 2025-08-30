import { NextRequest, NextResponse } from 'next/server'
import { cosmic } from '@/lib/cosmic'
import { hashPassword, signJWT } from '@/lib/auth'
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

    // Check if user already exists
    try {
      const existingUserResponse = await cosmic.objects
        .find({ 
          type: 'users',
          'metadata.email': email 
        })
        .props(['id'])

      if (existingUserResponse.objects.length > 0) {
        return NextResponse.json(
          { error: 'User already exists' },
          { status: 409 }
        )
      }
    } catch (error) {
      // If 404, user doesn't exist which is what we want
      if (!error || typeof error !== 'object' || !('status' in error) || error.status !== 404) {
        throw error
      }
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

    // Generate JWT token
    const token = await signJWT({
      userId: newUser.object.id,
      email,
      full_name,
      dark_mode: false
    })

    // Set HTTP-only cookie
    const response = NextResponse.json({
      user: {
        id: newUser.object.id,
        email,
        full_name,
        dark_mode: false
      },
      token
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 7 days
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