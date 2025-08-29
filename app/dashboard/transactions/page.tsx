import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { verifyJWT, extractTokenFromHeader } from '@/lib/auth'
import { cosmic, hasStatus } from '@/lib/cosmic'
import { Transaction, User, Category } from '@/types'
import DashboardLayout from '@/components/DashboardLayout'
import TransactionsList from '@/components/TransactionsList'

async function getTransactionsData(userId: string) {
  try {
    // Get user data
    const userResponse = await cosmic.objects.findOne({
      type: 'users',
      id: userId
    })
    const user = userResponse.object as User

    // Get user's transactions with category data
    let transactions: Transaction[] = []
    try {
      const transactionsResponse = await cosmic.objects
        .find({ 
          type: 'transactions',
          'metadata.user': userId 
        })
        .props(['id', 'title', 'slug', 'metadata'])
        .depth(1)
      
      transactions = transactionsResponse.objects as Transaction[]
    } catch (error) {
      if (hasStatus(error) && error.status === 404) {
        transactions = []
      } else {
        throw error
      }
    }

    // Get user's categories for the transaction form
    let categories: Category[] = []
    try {
      const categoriesResponse = await cosmic.objects
        .find({ 
          type: 'categories',
          'metadata.user': userId 
        })
        .props(['id', 'title', 'slug', 'metadata'])
      
      categories = categoriesResponse.objects as Category[]
    } catch (error) {
      if (hasStatus(error) && error.status === 404) {
        categories = []
      } else {
        throw error
      }
    }

    return { user, transactions, categories }
  } catch (error) {
    return { user: null, transactions: [], categories: [] }
  }
}

export default async function TransactionsPage() {
  const headersList = await headers()
  const authHeader = headersList.get('authorization') || headersList.get('cookie')
  
  // Extract token from cookie if present
  let token: string | null = extractTokenFromHeader(authHeader)
  if (!token && authHeader?.includes('auth-token=')) {
    token = authHeader.split('auth-token=')[1]?.split(';')[0] || null
  }

  if (!token) {
    redirect('/login')
  }

  const payload = await verifyJWT(token)
  if (!payload) {
    redirect('/login')
  }

  const data = await getTransactionsData(payload.userId)
  
  if (!data.user) {
    redirect('/login')
  }

  return (
    <DashboardLayout user={data.user}>
      <div className="space-y-grid-gap">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
            Transactions
          </h1>
          <p className="text-text-secondary-light dark:text-text-secondary-dark">
            View and manage all your financial transactions
          </p>
        </div>

        {/* Transactions List Component */}
        <TransactionsList 
          transactions={data.transactions} 
          categories={data.categories}
        />
      </div>
    </DashboardLayout>
  )
}