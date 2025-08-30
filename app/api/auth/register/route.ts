import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { cosmic } from '@/lib/cosmic'
import { signJWT } from '@/lib/auth'
import { generateSlug } from '@/lib/utils'
import { RegisterRequest } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json()
    const { full_name, email, password, confirmPassword } = body

    // Validation
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

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists
    try {
      await cosmic.objects.findOne({
        type: 'users',
        'metadata.email': email
      })
      
      // If we get here, user exists
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    } catch (error: any) {
      // 404 means user doesn't exist, which is what we want
      if (error.status !== 404) {
        throw error
      }
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12)

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

    // Generate JWT
    const token = await signJWT({
      userId: newUser.object.id,
      email: email
    })

    // Return user data and token
    return NextResponse.json({
      user: {
        id: newUser.object.id,
        email: email,
        full_name: full_name,
        dark_mode: false
      },
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