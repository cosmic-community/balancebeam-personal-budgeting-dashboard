import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { cosmic, hasStatus } from '@/lib/cosmic'
import { signJWT } from '@/lib/auth'
import { validateEmail, validatePassword, generateSlug } from '@/lib/utils'
import { User, RegisterRequest } from '@/types'

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

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    if (!validatePassword(password)) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters and contain letters and numbers' },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      )
    }

    // Check if user already exists
    try {
      const existingUsersResponse = await cosmic.objects
        .find({ 
          type: 'users',
          'metadata.email': email 
        })
        .props(['id'])

      if (existingUsersResponse.objects.length > 0) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 409 }
        )
      }
    } catch (error) {
      if (!hasStatus(error) || error.status !== 404) {
        throw error
      }
      // 404 is expected when no users exist with this email
    }

    // Hash password
    const saltRounds = 12
    const password_hash = await bcrypt.hash(password, saltRounds)

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
      email
    })

    return NextResponse.json({
      token,
      user: {
        id: newUser.object.id,
        email,
        full_name,
        dark_mode: false
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}