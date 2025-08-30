import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { cosmic, hasStatus } from '@/lib/cosmic'
import { signJWT } from '@/lib/auth'
import { validateEmail } from '@/lib/utils'
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

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Find user by email
    const usersResponse = await cosmic.objects
      .find({ 
        type: 'users',
        'metadata.email': email 
      })
      .props(['id', 'title', 'slug', 'metadata'])

    const users = usersResponse.objects as User[]
    
    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const user = users[0]

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.metadata.password_hash)
    
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

    // Return success response with token and user data
    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.metadata.email,
        full_name: user.metadata.full_name,
        dark_mode: user.metadata.dark_mode || false
      }
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