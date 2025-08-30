import { NextRequest, NextResponse } from 'next/server'
import { cosmic, hasStatus } from '@/lib/cosmic'
import { signJWT, hashPassword } from '@/lib/auth'
import { isValidEmail, isValidPassword, generateSlug } from '@/lib/utils'
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

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    if (!isValidPassword(password)) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number' },
        { status: 400 }
      )
    }

    // Check if user already exists
    try {
      const existingUserResponse = await cosmic.objects.find({
        type: 'users',
        'metadata.email': email
      }).props(['id'])

      if (existingUserResponse.objects && existingUserResponse.objects.length > 0) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 409 }
        )
      }
    } catch (error) {
      // If error is 404, no user exists, which is what we want
      if (!hasStatus(error) || error.status !== 404) {
        console.error('Error checking existing user:', error)
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        )
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
        email: email.toLowerCase(),
        password_hash,
        dark_mode: false,
        created_at: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
      }
    })

    // Generate JWT token
    const token = await signJWT({
      userId: newUser.object.id,
      email: email.toLowerCase()
    })

    // Return user data (excluding password hash)
    const userResponse = {
      id: newUser.object.id,
      email: newUser.object.metadata.email,
      full_name: newUser.object.metadata.full_name,
      dark_mode: newUser.object.metadata.dark_mode || false
    }

    return NextResponse.json({
      user: userResponse,
      token
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    )
  }
}