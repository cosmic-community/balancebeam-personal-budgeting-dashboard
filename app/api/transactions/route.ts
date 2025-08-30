import { NextRequest, NextResponse } from 'next/server'
import { cosmic, hasStatus } from '@/lib/cosmic'
import { verifyJWT, extractTokenFromHeader } from '@/lib/auth'
import { generateSlug } from '@/lib/utils'
import { TransactionFormData } from '@/types'

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

    const body: TransactionFormData = await request.json()
    const { type, amount, category, description, date } = body

    // Validate input
    if (!type || !amount || !category || !date) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      )
    }

    // Create transaction
    const newTransaction = await cosmic.objects.insertOne({
      type: 'transactions',
      title: description || `${type} transaction`,
      slug: generateSlug(`${type}-${payload.userId}-${Date.now()}`),
      metadata: {
        user: payload.userId,
        type: {
          key: type,
          value: type === 'income' ? 'Income' : 'Expense'
        },
        amount: Number(amount),
        category,
        description,
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

    // Get transactions with category data
    const transactionsResponse = await cosmic.objects
      .find({ 
        type: 'transactions',
        'metadata.user': payload.userId 
      })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)

    const transactions = transactionsResponse.objects

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error('Transactions fetch error:', error)
    
    if (hasStatus(error) && error.status === 404) {
      return NextResponse.json({ transactions: [] })
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}