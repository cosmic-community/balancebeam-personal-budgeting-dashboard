import { NextRequest, NextResponse } from 'next/server'
import { cosmic, hasStatus } from '@/lib/cosmic'
import { hashPassword, signJWT } from '@/lib/auth'
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

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.message },
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
      // If 404, no users exist with this email, which is what we want
      if (!hasStatus(error) || error.status !== 404) {
        throw error
      }
    }

    // Hash password
    const passwordHash = hashPassword(password)

    // Create user
    const newUser = await cosmic.objects.insertOne({
      type: 'users',
      title: full_name,
      slug: generateSlug(full_name + '-' + Date.now()),
      metadata: {
        full_name,
        email,
        password_hash: passwordHash,
        dark_mode: false,
        created_at: new Date().toISOString().split('T')[0]
      }
    })

    // Create default categories for the user
    const defaultCategories = [
      { name: 'Salary', color: '#4CAF50', type: 'income' },
      { name: 'Food & Dining', color: '#FF9800', type: 'expense' },
      { name: 'Transportation', color: '#2196F3', type: 'expense' },
      { name: 'Entertainment', color: '#9C27B0', type: 'expense' },
      { name: 'Utilities', color: '#607D8B', type: 'expense' }
    ]

    for (const category of defaultCategories) {
      try {
        await cosmic.objects.insertOne({
          type: 'categories',
          title: category.name,
          slug: generateSlug(category.name + '-' + newUser.object.id),
          metadata: {
            user: newUser.object.id,
            name: category.name,
            color: category.color,
            type: {
              key: category.type,
              value: category.type === 'income' ? 'Income' : 'Expense'
            }
          }
        })
      } catch (error) {
        console.error('Error creating default category:', error)
        // Continue creating other categories even if one fails
      }
    }

    // Generate JWT
    const token = signJWT({
      userId: newUser.object.id,
      email
    })

    // Set cookie and return user data
    const response = NextResponse.json({
      user: {
        id: newUser.object.id,
        email,
        full_name,
        dark_mode: false
      },
      token
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 7 days
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