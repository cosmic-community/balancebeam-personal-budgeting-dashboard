import { NextRequest, NextResponse } from 'next/server'
import { comparePasswords, signJWT } from '@/lib/auth'
import { cosmic, hasStatus } from '@/lib/cosmic'
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
    try {
      const userResponse = await cosmic.objects
        .find({ 
          type: 'users',
          'metadata.email': email 
        })
        .props(['id', 'title', 'slug', 'metadata'])
        .limit(1)

      if (!userResponse.objects || userResponse.objects.length === 0) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }

      const user = userResponse.objects[0] as User

      // Verify password
      const isValidPassword = await comparePasswords(password, user.metadata.password_hash)
      
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }

      // Generate JWT token
      const token = await signJWT({
        userId: user.id,
        email: user.metadata.email
      })

      // Return user data and token
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
      if (hasStatus(error) && error.status === 404) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }
      throw error
    }

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}