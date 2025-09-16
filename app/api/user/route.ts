import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { cosmic, hasStatus } from '@/lib/cosmic'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      )
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Get user from Cosmic
    const userResponse = await cosmic.objects
      .findOne({
        type: 'users',
        id: payload.userId
      })
      .props(['id', 'title', 'slug', 'metadata'])

    if (!userResponse.object) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const user = userResponse.object
    
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
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      )
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { full_name, dark_mode } = body

    // Update user in Cosmic
    const updateData: any = {}
    if (full_name !== undefined) updateData['metadata.full_name'] = full_name
    if (dark_mode !== undefined) updateData['metadata.dark_mode'] = dark_mode

    const updatedUser = await cosmic.objects.updateOne(payload.userId, updateData)

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