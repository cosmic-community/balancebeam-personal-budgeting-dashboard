import { NextRequest, NextResponse } from 'next/server'
import { cosmic, hasStatus } from '@/lib/cosmic'
import { signJWT, comparePasswords } from '@/lib/auth'
import { isValidEmail } from '@/lib/utils'
import { LoginRequest } from '@/types'

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

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Find user by email
    try {
      const userResponse = await cosmic.objects.find({
        type: 'users',
        'metadata.email': email.toLowerCase()
      }).props(['id', 'title', 'metadata'])

      if (!userResponse.objects || userResponse.objects.length === 0) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }

      const user = userResponse.objects[0]

      // Verify password
      const isPasswordValid = await comparePasswords(password, user.metadata.password_hash)
      
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }

      // Generate JWT token
      const token = await signJWT({
        userId: user.id,
        email: user.metadata.email
      })

      // Return user data (excluding password hash)
      const userResponse_clean = {
        id: user.id,
        email: user.metadata.email,
        full_name: user.metadata.full_name,
        dark_mode: user.metadata.dark_mode || false
      }

      return NextResponse.json({
        user: userResponse_clean,
        token
      })

    } catch (error) {
      if (hasStatus(error) && error.status === 404) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }
      throw error
    }

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    )
  }
}