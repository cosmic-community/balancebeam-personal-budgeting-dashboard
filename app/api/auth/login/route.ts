import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { cosmic, hasStatus } from '@/lib/cosmic'
import { generateJWT } from '@/lib/auth'
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
    const userResponse = await cosmic.objects.findOne({
      type: 'users',
      'metadata.email': email
    }).props(['id', 'title', 'metadata'])

    const user = userResponse.object as User

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.metadata.password_hash)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = await generateJWT({
      userId: user.id,
      email: user.metadata.email
    })

    // Return user data and token
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
    
    if (hasStatus(error) && error.status === 404) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}