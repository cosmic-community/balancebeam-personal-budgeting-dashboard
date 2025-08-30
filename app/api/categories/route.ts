import { NextRequest, NextResponse } from 'next/server'
import { cosmic, hasStatus } from '@/lib/cosmic'
import { generateSlug } from '@/lib/utils'
import { CategoryFormData } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body: CategoryFormData = await request.json()
    const { name, color, type } = body

    // Validate input
    if (!name || !color || !type) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Get the first user to associate the category with
    const userResponse = await cosmic.objects
      .find({ type: 'users' })
      .props(['id'])
      .limit(1)
    
    const userId = userResponse.objects[0]?.id || 'demo-user'

    // Create category
    const newCategory = await cosmic.objects.insertOne({
      type: 'categories',
      title: name,
      slug: generateSlug(name + '-' + userId + '-' + Date.now()),
      metadata: {
        user: userId,
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
    // Get the first user
    const userResponse = await cosmic.objects
      .find({ type: 'users' })
      .props(['id'])
      .limit(1)
    
    const userId = userResponse.objects[0]?.id

    if (!userId) {
      return NextResponse.json({ categories: [] })
    }

    // Get categories for the user
    const categoriesResponse = await cosmic.objects
      .find({ 
        type: 'categories',
        'metadata.user': userId 
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