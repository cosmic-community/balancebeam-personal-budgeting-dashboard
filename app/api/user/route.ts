import { NextRequest, NextResponse } from 'next/server'
import { cosmic, hasStatus } from '@/lib/cosmic'
import { verifyJWT, extractTokenFromHeader, comparePasswords, hashPassword } from '@/lib/auth'
import { User } from '@/types'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader)
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Get user data
    const userResponse = await cosmic.objects.findOne({
      type: 'users',
      id: payload.userId
    })

    const user = userResponse.object as User

    // Return user data without password hash
    const { password_hash, ...userWithoutPassword } = user.metadata
    
    return NextResponse.json({
      user: {
        ...user,
        metadata: userWithoutPassword
      }
    })
  } catch (error) {
    console.error('User fetch error:', error)
    
    if (hasStatus(error) && error.status === 404) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader)
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { full_name, email, current_password, new_password, dark_mode } = body

    // Get current user data
    const userResponse = await cosmic.objects.findOne({
      type: 'users',
      id: payload.userId
    })

    const user = userResponse.object as User

    // Build update object
    const updateData: any = {}

    if (full_name) {
      updateData.title = full_name
      updateData['metadata.full_name'] = full_name
    }

    if (email && email !== user.metadata.email) {
      // Check if email is already taken
      try {
        await cosmic.objects.findOne({
          type: 'users',
          'metadata.email': email
        })
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        )
      } catch (error) {
        if (hasStatus(error) && error.status === 404) {
          // Email not taken, safe to update
          updateData['metadata.email'] = email
        } else {
          throw error
        }
      }
    }

    if (typeof dark_mode === 'boolean') {
      updateData['metadata.dark_mode'] = dark_mode
    }

    // Handle password change
    if (current_password && new_password) {
      // Verify current password
      const isCurrentPasswordValid = await comparePasswords(current_password, user.metadata.password_hash)
      
      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        )
      }

      // Hash new password
      const hashedNewPassword = await hashPassword(new_password)
      updateData['metadata.password_hash'] = hashedNewPassword
    }

    // Update user
    const updatedUserResponse = await cosmic.objects.updateOne(payload.userId, updateData)
    const updatedUser = updatedUserResponse.object as User

    // Return updated user data without password hash
    const { password_hash, ...userWithoutPassword } = updatedUser.metadata

    return NextResponse.json({
      user: {
        ...updatedUser,
        metadata: userWithoutPassword
      }
    })
  } catch (error) {
    console.error('User update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}