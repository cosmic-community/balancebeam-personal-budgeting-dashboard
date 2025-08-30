import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { cosmic, hasStatus } from '@/lib/cosmic'
import { signJWT } from '@/lib/auth'
import { LoginRequest, User } from '@/types'

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
      const userResponse = await cosmic.objects
        .find({ 
          type: 'users',
          'metadata.email': email.toLowerCase() 
        })
        .props(['id', 'title', 'slug', 'metadata'])

      if (userResponse.objects && userResponse.objects.length > 0) {
        user = userResponse.objects[0] as User
      }
    } catch (error) {
      if (hasStatus(error) && error.status === 404) {
        user = null
      } else {
        throw error
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password - add null check for user
    if (!user || !user.metadata?.password_hash) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const isValidPassword = await bcrypt.compare(password, user.metadata.password_hash)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Create JWT token with null checks
    const tokenPayload = {
      userId: user.id,
      email: user.metadata.email,
      full_name: user.metadata.full_name,
      dark_mode: user.metadata.dark_mode || false
    }

    const token = await signJWT(tokenPayload)

    // Return user data without password hash
    const userData = {
      id: user.id,
      email: user.metadata.email,
      full_name: user.metadata.full_name,
      dark_mode: user.metadata.dark_mode || false
    }

    return NextResponse.json({
      user: userData,
      token
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}