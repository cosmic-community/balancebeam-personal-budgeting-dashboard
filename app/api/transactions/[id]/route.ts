// app/api/transactions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cosmic } from '@/lib/cosmic'
import { verifyJWT, extractTokenFromHeader } from '@/lib/auth'
import { TransactionFormData } from '@/types'

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

    const payload = verifyJWT(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const body: Partial<TransactionFormData> & { title?: string } = await request.json()
    const { type, amount, category, description, date, title } = body

    // Build update object with only provided fields
    const updateData: any = {}
    
    if (title) updateData.title = title
    if (type) updateData['metadata.type'] = {
      key: type,
      value: type === 'income' ? 'Income' : 'Expense'
    }
    if (amount !== undefined) updateData['metadata.amount'] = amount
    if (category) updateData['metadata.category'] = category
    if (description !== undefined) updateData['metadata.description'] = description
    if (date) updateData['metadata.date'] = date

    // Update transaction
    const updatedTransaction = await cosmic.objects.updateOne(id, updateData)

    return NextResponse.json({ transaction: updatedTransaction.object })
  } catch (error) {
    console.error('Transaction update error:', error)
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

    const payload = verifyJWT(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Delete transaction
    await cosmic.objects.deleteOne(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Transaction delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}