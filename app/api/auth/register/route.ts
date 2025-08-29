import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { cosmic } from '@/lib/cosmic'
import { generateSlug, validateEmail, validatePassword } from '@/lib/utils'
import { createJWT } from '@/lib/auth'
import { RegisterRequest } from '@/types'

interface ValidationResult {
  isValid: boolean;
  message: string;
}

function validateRegistration(data: RegisterRequest): ValidationResult {
  if (!data.full_name || data.full_name.trim().length < 2) {
    return { isValid: false, message: 'Full name must be at least 2 characters long' }
  }

  if (!validateEmail(data.email)) {
    return { isValid: false, message: 'Please enter a valid email address' }
  }

  if (!validatePassword(data.password)) {
    return { isValid: false, message: 'Password must be at least 8 characters with letters and numbers' }
  }

  if (data.password !== data.confirmPassword) {
    return { isValid: false, message: 'Passwords do not match' }
  }

  return { isValid: true, message: '' }
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json()

    // Validate input
    const validation = validateRegistration(body)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.message },
        { status: 400 }
      )
    }

    // Check if user already exists
    try {
      const existingUserResponse = await cosmic.objects.find({
        type: 'users',
        'metadata.email': body.email
      })

      if (existingUserResponse.objects.length > 0) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 400 }
        )
      }
    } catch (error) {
      // If no users found (404), continue with registration
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 12)

    // Create user
    const newUser = await cosmic.objects.insertOne({
      type: 'users',
      title: body.full_name,
      slug: generateSlug(body.full_name + '-' + Date.now()),
      metadata: {
        full_name: body.full_name,
        email: body.email,
        password_hash: hashedPassword,
        dark_mode: false,
        created_at: new Date().toISOString().split('T')[0]
      }
    })

    // Generate JWT token
    const token = createJWT({
      userId: newUser.object.id,
      email: body.email
    })

    // Create response with user data
    const response = NextResponse.json({
      user: {
        id: newUser.object.id,
        email: body.email,
        full_name: body.full_name,
        dark_mode: false
      },
      token
    })

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
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