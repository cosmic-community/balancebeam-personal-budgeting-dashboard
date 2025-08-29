import { NextRequest, NextResponse } from 'next/server'
import { cosmic } from '@/lib/cosmic'
import { verifyJWT, extractTokenFromHeader } from '@/lib/auth'

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

    const payload = verifyJWT(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { full_name, dark_mode } = body

    // Build update object with only provided fields
    const updateData: any = {}
    
    if (full_name) {
      updateData.title = full_name
      updateData['metadata.full_name'] = full_name
    }
    if (dark_mode !== undefined) {
      updateData['metadata.dark_mode'] = dark_mode
    }

    // Update user
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