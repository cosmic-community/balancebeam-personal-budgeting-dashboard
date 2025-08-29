import { NextRequest, NextResponse } from 'next/server'
import { cosmic } from '@/lib/cosmic'
import { verifyJWT, extractTokenFromHeader } from '@/lib/auth'

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

    const payload = verifyJWT(token)
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

    const user = userResponse.object

    // Return user data without password hash
    const { password_hash, ...userData } = user.metadata
    
    return NextResponse.json({ 
      user: {
        id: user.id,
        email: userData.email,
        full_name: userData.full_name,
        dark_mode: userData.dark_mode || false
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