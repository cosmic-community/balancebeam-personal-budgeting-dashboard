// app/api/transactions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cosmic } from '@/lib/cosmic'
import { getAuthUser } from '@/lib/auth'
import { TransactionFormData } from '@/types'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // IMPORTANT: In Next.js 15+, params are now Promises and MUST be awaited
    const { id } = await params

    // Get authenticated user
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    const body: Partial<TransactionFormData> = await request.json()
    const { type, amount, category, description, date } = body

    // Verify transaction belongs to user
    try {
      const { object: existingTransaction } = await cosmic.objects
        .findOne({
          type: 'transactions',
          id
        })
        .props(['id', 'metadata'])

      if (existingTransaction.metadata.user !== user.id) {
        return NextResponse.json(
          { error: 'Transaction does not belong to current user' },
          { status: 403 }
        )
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Build update object with only provided fields
    const updateData: any = {}
    
    if (type !== undefined && amount !== undefined) {
      updateData['metadata.type'] = {
        key: type,
        value: type === 'income' ? 'Income' : 'Expense'
      }
      updateData['metadata.amount'] = Number(amount)
      
      // Update title based on new values
      const transactionTitle = `${type === 'income' ? '+' : '-'}$${Math.abs(amount)} - ${description || 'Transaction'}`
      updateData.title = transactionTitle
    }
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

    // Get authenticated user
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    // Verify transaction belongs to user
    try {
      const { object: existingTransaction } = await cosmic.objects
        .findOne({
          type: 'transactions',
          id
        })
        .props(['id', 'metadata'])

      if (existingTransaction.metadata.user !== user.id) {
        return NextResponse.json(
          { error: 'Transaction does not belong to current user' },
          { status: 403 }
        )
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
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