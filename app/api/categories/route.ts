import { NextRequest, NextResponse } from 'next/server'
import { cosmic, hasStatus } from '@/lib/cosmic'
import { verifyJWT, extractTokenFromHeader } from '@/lib/auth'
import { generateSlug } from '@/lib/utils'
import { CategoryFormData } from '@/types'

export async function POST(request: NextRequest) {
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

    const body: CategoryFormData = await request.json()
    const { name, color, type } = body

    // Validate input
    if (!name || !color || !type) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Create category
    const newCategory = await cosmic.objects.insertOne({
      type: 'categories',
      title: name,
      slug: generateSlug(name + '-' + payload.userId + '-' + Date.now()),
      metadata: {
        user: payload.userId,
        name,
        color,
        type: {
          key: type,
          value: type === 'income' ? 'Income' : 'Expense'
        }
      }
    })

    return NextResponse.json({ category: newCategory.object })
  } catch (error) {
    console.error('Category creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    // Get categories
    const categoriesResponse = await cosmic.objects
      .find({ 
        type: 'categories',
        'metadata.user': payload.userId 
      })
      .props(['id', 'title', 'slug', 'metadata'])

    const categories = categoriesResponse.objects

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Categories fetch error:', error)
    
    if (hasStatus(error) && error.status === 404) {
      return NextResponse.json({ categories: [] })
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}