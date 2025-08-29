import { NextRequest, NextResponse } from 'next/server'
import { cosmic, hasStatus } from '@/lib/cosmic'
import { createJWT } from '@/lib/auth'
import { User } from '@/types'
import bcrypt from 'bcrypt'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

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
      const userResponse = await cosmic.objects.find({
        type: 'users',
        'metadata.email': email
      }).props(['id', 'title', 'slug', 'metadata'])
      
      if (userResponse.objects && userResponse.objects.length > 0) {
        user = userResponse.objects[0] as User
      }
    } catch (error) {
      if (hasStatus(error) && error.status === 404) {
        // User not found, continue to return error below
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

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.metadata.password_hash)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Create JWT token - user is guaranteed to exist here
    const token = await createJWT({
      userId: user.id,
      email: user.metadata.email,
    })

    // Return user data and token - user is guaranteed to exist here
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.metadata.email,
        full_name: user.metadata.full_name,
        dark_mode: user.metadata.dark_mode || false
      },
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