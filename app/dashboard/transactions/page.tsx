import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { cosmic, hasStatus } from '@/lib/cosmic'
import TransactionsPageClient from '@/components/TransactionsPageClient'
import { Transaction, Category, AuthUser } from '@/types'

export default async function TransactionsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value

  if (!token) {
    redirect('/login')
  }

  const payload = await verifyToken(token)
  if (!payload) {
    redirect('/login')
  }

  let initialTransactions: Transaction[] = []
  let categories: Category[] = []
  let user: AuthUser

  try {
    // Get user data
    const userResponse = await cosmic.objects
      .findOne({
        type: 'users',
        id: payload.userId
      })
      .props(['id', 'title', 'slug', 'metadata'])

    if (!userResponse.object) {
      redirect('/login')
    }

    user = {
      id: userResponse.object.id,
      email: userResponse.object.metadata.email,
      full_name: userResponse.object.metadata.full_name,
      dark_mode: userResponse.object.metadata.dark_mode || false
    }

    // Get transactions for the user
    try {
      const transactionsResponse = await cosmic.objects
        .find({ 
          type: 'transactions',
          'metadata.user': payload.userId 
        })
        .props(['id', 'title', 'slug', 'metadata'])
        .depth(1)

      initialTransactions = (transactionsResponse.objects as Transaction[]).sort((a, b) => {
        const dateA = new Date(a.metadata.date || '').getTime()
        const dateB = new Date(b.metadata.date || '').getTime()
        return dateB - dateA
      })
    } catch (error) {
      if (hasStatus(error) && error.status === 404) {
        initialTransactions = []
      } else {
        throw error
      }
    }

    // Get categories for the user
    try {
      const categoriesResponse = await cosmic.objects
        .find({ 
          type: 'categories',
          'metadata.user': payload.userId 
        })
        .props(['id', 'title', 'slug', 'metadata'])
        .depth(1)

      categories = categoriesResponse.objects as Category[]
    } catch (error) {
      if (hasStatus(error) && error.status === 404) {
        categories = []
      } else {
        throw error
      }
    }

  } catch (error) {
    console.error('Transactions page error:', error)
    redirect('/login')
  }

  return <TransactionsPageClient initialTransactions={initialTransactions} categories={categories} />
}