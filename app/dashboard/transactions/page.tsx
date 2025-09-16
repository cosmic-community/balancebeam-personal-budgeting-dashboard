import { getCurrentUser } from '@/lib/auth'
import { cosmic, hasStatus } from '@/lib/cosmic'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Transaction, Category, User } from '@/types'
import DashboardLayout from '@/components/DashboardLayout'
import TransactionsPageClient from '@/components/TransactionsPageClient'

async function getTransactionsData() {
  try {
    // Get auth token from cookies
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      redirect('/login')
    }

    // Get current user
    const authUser = await getCurrentUser(token)
    if (!authUser) {
      redirect('/login')
    }

    // Get full user object for DashboardLayout
    const userResponse = await cosmic.objects.findOne({
      type: 'users',
      id: authUser.id
    }).props(['id', 'title', 'slug', 'metadata'])

    const user = userResponse.object as User

    // Get user's transactions with category data
    const transactionsResponse = await cosmic.objects
      .find({ 
        type: 'transactions',
        'metadata.user': authUser.id 
      })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)

    const transactions = transactionsResponse.objects as Transaction[]

    // Get user's categories
    const categoriesResponse = await cosmic.objects
      .find({ 
        type: 'categories',
        'metadata.user': authUser.id 
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
  const { user, transactions, categories } = await getTransactionsData()

  if (!user) {
    redirect('/login')
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-grid-gap">
        {/* Page Header */}
        <div>
          <h1 className="text-heading md:text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">
            Transactions
          </h1>
          <p className="text-body text-text-secondary-light dark:text-text-secondary-dark mt-1">
            Manage your income and expense transactions
          </p>
        </div>

        {/* Client-side transaction management */}
        <TransactionsPageClient 
          initialTransactions={transactions}
          categories={categories}
        />
      </div>
    </DashboardLayout>
  )
}