import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { verifyJWT, extractTokenFromHeader } from '@/lib/auth'
import { cosmic, hasStatus } from '@/lib/cosmic'
import { Transaction, Category, User } from '@/types'
import DashboardLayout from '@/components/DashboardLayout'
import TransactionsList from '@/components/TransactionsList'
import TransactionForm from '@/components/TransactionForm'

async function getTransactionsData(userId: string) {
  try {
    // Get user data
    const userResponse = await cosmic.objects.findOne({
      type: 'users',
      id: userId
    })
    const user = userResponse.object as User

    // Get transactions with categories populated
    const transactionsResponse = await cosmic.objects
      .find({ 
        type: 'transactions',
        'metadata.user': userId 
      })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)

    const transactions = transactionsResponse.objects as Transaction[]

    // Sort transactions by date (newest first)
    transactions.sort((a, b) => {
      const dateA = new Date(a.metadata.date).getTime()
      const dateB = new Date(b.metadata.date).getTime()
      return dateB - dateA
    })

    // Get categories for the form
    const categoriesResponse = await cosmic.objects
      .find({ 
        type: 'categories',
        'metadata.user': userId 
      })
      .props(['id', 'title', 'slug', 'metadata'])
    
    const categories = categoriesResponse.objects as Category[]

    return {
      user,
      transactions,
      categories
    }
  } catch (error) {
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
  const headersList = await headers()
  const authHeader = headersList.get('authorization') || headersList.get('cookie')
  
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
        <div>
          <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
            Transactions
          </h1>
          <p className="text-text-secondary-light dark:text-text-secondary-dark">
            Add and manage your income and expenses
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-grid-gap">
          <div className="lg:col-span-1">
            <TransactionForm categories={data.categories} />
          </div>
          <div className="lg:col-span-2">
            <TransactionsList 
              transactions={data.transactions} 
              categories={data.categories}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}