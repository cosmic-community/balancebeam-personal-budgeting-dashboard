// app/api/categories/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cosmic } from '@/lib/cosmic'
import { verifyJWT, extractTokenFromHeader } from '@/lib/auth'
import { CategoryFormData } from '@/types'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // IMPORTANT: In Next.js 15+, params are now Promises and MUST be awaited
    const { id } = await params

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

    const body: Partial<CategoryFormData> = await request.json()
    const { name, color, type } = body

    // Build update object with only provided fields
    const updateData: any = {}
    
    if (name) {
      updateData.title = name
      updateData['metadata.name'] = name
    }
    if (color) updateData['metadata.color'] = color
    if (type) updateData['metadata.type'] = {
      key: type,
      value: type === 'income' ? 'Income' : 'Expense'
    }

    // Update category
    const updatedCategory = await cosmic.objects.updateOne(id, updateData)

    return NextResponse.json({ category: updatedCategory.object })
  } catch (error) {
    console.error('Category update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // IMPORTANT: In Next.js 15+, params are now Promises and MUST be awaited
    const { id } = await params

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

    // Delete category
    await cosmic.objects.deleteOne(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Category delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}