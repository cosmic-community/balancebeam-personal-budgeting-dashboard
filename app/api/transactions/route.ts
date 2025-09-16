import { NextRequest, NextResponse } from 'next/server'
import { cosmic, hasStatus } from '@/lib/cosmic'
import { getAuthUser } from '@/lib/auth'
import { generateSlug } from '@/lib/utils'
import { TransactionFormData } from '@/types'

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    const body: TransactionFormData = await request.json()
    const { type, amount, category, description, date } = body

    // Validate input
    if (!type || amount === undefined || !category || !date) {
      return NextResponse.json(
        { error: 'Missing required fields: type, amount, category, date' },
        { status: 400 }
      )
    }

    // Validate category exists and belongs to user
    try {
      const { object: categoryObject } = await cosmic.objects
        .findOne({
          type: 'categories',
          id: category
        })
        .props(['id', 'metadata'])

      // Check if category belongs to the current user
      if (categoryObject.metadata.user !== user.id) {
        return NextResponse.json(
          { error: 'Category does not belong to current user' },
          { status: 403 }
        )
      }
    } catch (error) {
      console.error('Category validation error:', error)
      return NextResponse.json(
        { error: 'Invalid category selected' },
        { status: 400 }
      )
    }

    // Create transaction
    const transactionTitle = `${type === 'income' ? '+' : '-'}$${Math.abs(amount)} - ${description || 'Transaction'}`
    
    const newTransaction = await cosmic.objects.insertOne({
      type: 'transactions',
      title: transactionTitle,
      slug: generateSlug(`${type}-${Math.abs(amount)}-${user.id}-${Date.now()}`),
      metadata: {
        user: user.id,
        type: {
          key: type,
          value: type === 'income' ? 'Income' : 'Expense'
        },
        amount: Number(amount),
        category,
        description: description || '',
        date
      }
    })

    return NextResponse.json({ transaction: newTransaction.object })
  } catch (error) {
    console.error('Transaction creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = parseInt(searchParams.get('skip') || '0')

    // Get transactions for the user
    const transactionsResponse = await cosmic.objects
      .find({ 
        type: 'transactions',
        'metadata.user': user.id
      })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)
      .limit(limit)
      .skip(skip)

    const transactions = transactionsResponse.objects

    return NextResponse.json({ 
      transactions,
      total: transactionsResponse.total 
    })
  } catch (error) {
    console.error('Transactions fetch error:', error)
    
    if (hasStatus(error) && error.status === 404) {
      return NextResponse.json({ transactions: [], total: 0 })
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}