import { NextRequest, NextResponse } from 'next/server'
import { cosmic } from '@/lib/cosmic'
import { verifyJWT, extractTokenFromHeader } from '@/lib/auth'
import { isValidEmail } from '@/lib/utils'
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

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.metadata.email,
        full_name: user.metadata.full_name,
        dark_mode: user.metadata.dark_mode || false
      }
    })
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
    const { full_name, email, dark_mode } = body

    // Validate input
    if (email && !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Update user
    const updateData: any = {}
    if (full_name) updateData.full_name = full_name
    if (email) updateData.email = email
    if (typeof dark_mode === 'boolean') updateData.dark_mode = dark_mode

    const updatedUser = await cosmic.objects.updateOne(payload.userId, {
      metadata: updateData
    })

    return NextResponse.json({
      user: {
        id: updatedUser.object.id,
        email: updatedUser.object.metadata.email,
        full_name: updatedUser.object.metadata.full_name,
        dark_mode: updatedUser.object.metadata.dark_mode || false
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