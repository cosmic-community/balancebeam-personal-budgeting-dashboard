import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { cosmic, hasStatus } from '@/lib/cosmic'
import { signJWT } from '@/lib/auth'
import { RegisterRequest, User } from '@/types'
import { generateSlug } from '@/lib/utils'

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
          'metadata.email': email.toLowerCase() 
        })
        .props(['id'])

      if (existingUserResponse.objects && existingUserResponse.objects.length > 0) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 400 }
        )
      }
    } catch (error) {
      if (hasStatus(error) && error.status === 404) {
        // User doesn't exist, which is what we want
      } else {
        throw error
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const newUser = await cosmic.objects.insertOne({
      type: 'users',
      title: full_name,
      slug: generateSlug(full_name + '-' + Date.now()),
      metadata: {
        full_name,
        email: email.toLowerCase(),
        password_hash: hashedPassword,
        dark_mode: false,
        created_at: new Date().toISOString().split('T')[0]
      }
    })

    const user = newUser.object as User

    // Create JWT token
    const tokenPayload = {
      userId: user.id,
      email: user.metadata.email,
      full_name: user.metadata.full_name,
      dark_mode: user.metadata.dark_mode
    }

    const token = await signJWT(tokenPayload)

    // Return user data without password hash
    const userData = {
      id: user.id,
      email: user.metadata.email,
      full_name: user.metadata.full_name,
      dark_mode: user.metadata.dark_mode
    }

    return NextResponse.json({
      user: userData,
      token
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}