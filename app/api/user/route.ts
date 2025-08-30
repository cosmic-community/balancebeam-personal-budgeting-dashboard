import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT, extractTokenFromHeader } from '@/lib/auth'
import { cosmic, hasStatus } from '@/lib/cosmic'

export async function GET(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader)
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify JWT token
    const payload = await verifyJWT(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Get user from Cosmic
    try {
      const { object: user } = await cosmic.objects
        .findOne({ 
          type: 'users', 
          id: payload.userId 
        })
        .props(['id', 'title', 'metadata'])

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      // Return user data (excluding sensitive information)
      return NextResponse.json({
        user: {
          id: user.id,
          email: user.metadata.email,
          full_name: user.metadata.full_name,
          dark_mode: user.metadata.dark_mode ?? false
        }
      })
    } catch (error) {
      if (hasStatus(error) && error.status === 404) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }
      throw error
    }
  } catch (error) {
    console.error('User fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader)
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify JWT token
    const payload = await verifyJWT(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Get update data from request body
    const body = await request.json()
    const { full_name, dark_mode } = body

    // Build update object with only provided fields
    const updateData: any = {}
    
    if (full_name !== undefined) {
      updateData.title = full_name
      updateData['metadata.full_name'] = full_name
    }
    
    if (dark_mode !== undefined) {
      updateData['metadata.dark_mode'] = Boolean(dark_mode)
    }

    // Update user in Cosmic
    const { object: updatedUser } = await cosmic.objects.updateOne(
      payload.userId,
      updateData
    )

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        email: updatedUser.metadata.email,
        full_name: updatedUser.metadata.full_name,
        dark_mode: updatedUser.metadata.dark_mode ?? false
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