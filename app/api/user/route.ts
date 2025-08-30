import { NextRequest, NextResponse } from 'next/server'
import { cosmic } from '@/lib/cosmic'
import { verifyJWT, extractTokenFromHeader, hashPassword } from '@/lib/auth'

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
      id: payload.userId
    }).props(['id', 'title', 'metadata'])

    const user = userResponse.object

    // Return user data (excluding password hash)
    const userResponseClean = {
      id: user.id,
      email: user.metadata.email,
      full_name: user.metadata.full_name,
      dark_mode: user.metadata.dark_mode || false
    }

    return NextResponse.json({ user: userResponseClean })

  } catch (error) {
    console.error('User fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
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
    const { full_name, dark_mode, current_password, new_password } = body

    // Build update object
    const updateData: any = {}

    if (full_name !== undefined) {
      updateData.title = full_name
      updateData['metadata.full_name'] = full_name
    }

    if (dark_mode !== undefined) {
      updateData['metadata.dark_mode'] = dark_mode
    }

    // Handle password change
    if (new_password && current_password) {
      // Get current user to verify password
      const userResponse = await cosmic.objects.findOne({
        id: payload.userId
      }).props(['metadata'])

      const user = userResponse.object

      // Verify current password
      const { comparePasswords } = await import('@/lib/auth')
      const isCurrentPasswordValid = await comparePasswords(current_password, user.metadata.password_hash)
      
      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        )
      }

      // Hash new password
      const newPasswordHash = await hashPassword(new_password)
      updateData['metadata.password_hash'] = newPasswordHash
    }

    // Update user
    const updatedUser = await cosmic.objects.updateOne(payload.userId, updateData)

    // Return updated user data (excluding password hash)
    const userResponseClean = {
      id: updatedUser.object.id,
      email: updatedUser.object.metadata.email,
      full_name: updatedUser.object.metadata.full_name,
      dark_mode: updatedUser.object.metadata.dark_mode || false
    }

    return NextResponse.json({ user: userResponseClean })

  } catch (error) {
    console.error('User update error:', error)
    return NextResponse.json(
      { error: 'Failed to update user data' },
      { status: 500 }
    )
  }
}