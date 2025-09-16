import { getCurrentUser, userToAuthUser } from '@/lib/auth'
import { cosmic, hasStatus } from '@/lib/cosmic'
import { Transaction, Category } from '@/types'
import DashboardLayout from '@/components/DashboardLayout'
import TransactionsPageClient from '@/components/TransactionsPageClient'
import { NextRequest } from 'next/server'
import { headers } from 'next/headers'

async function getTransactionsData(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getCurrentUser(request)
    if (!user) {
      return {
        user: null,
        transactions: [],
        categories: []
      }
    }

    // Get transactions for the user
    const transactionsResponse = await cosmic.objects
      .find({ 
        type: 'transactions',
        'metadata.user': user.id 
      })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)

    const transactions = transactionsResponse.objects as Transaction[]

    // Get categories for the user
    const categoriesResponse = await cosmic.objects
      .find({ 
        type: 'categories',
        'metadata.user': user.id 
      })
      .props(['id', 'title', 'slug', 'metadata'])

    const categories = categoriesResponse.objects as Category[]

    return {
      user,
      transactions,
      categories
    }
  } catch (error) {
    console.error('Transactions data error:', error)
    
    if (hasStatus(error) && error.status === 404) {
      return {
        user: null,
        transactions: [],
        categories: []
      }
    }
    
    throw error
  }
}

export default async function TransactionsPage() {
  // Create a mock NextRequest from headers
  const headersList = headers()
  const request = new NextRequest('http://localhost:3000/dashboard/transactions', {
    headers: headersList
  })
  
  const data = await getTransactionsData(request)
  
  if (!data.user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
            Authentication Required
          </h1>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mb-4">
            Please log in to access your transactions.
          </p>
        </div>
      </div>
    )
  }

  const authUser = userToAuthUser(data.user)

  return (
    <DashboardLayout user={authUser}>
      <TransactionsPageClient
        initialTransactions={data.transactions}
        categories={data.categories}
        user={authUser}
      />
    </DashboardLayout>
  )
}