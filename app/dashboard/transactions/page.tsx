import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { cosmic, hasStatus } from '@/lib/cosmic'
import { Transaction, Category, User } from '@/types'
import DashboardLayout from '@/components/DashboardLayout'
import TransactionForm from '@/components/TransactionForm'
import TransactionsList from '@/components/TransactionsList'

async function getTransactionsData() {
  try {
    const authUser = await getCurrentUser()
    
    if (!authUser) {
      redirect('/login')
    }

    // Create User object from AuthUser
    const user: User = {
      id: authUser.id,
      slug: `user-${authUser.id}`,
      title: authUser.full_name,
      type: 'users',
      created_at: new Date().toISOString(),
      modified_at: new Date().toISOString(),
      metadata: {
        full_name: authUser.full_name,
        email: authUser.email,
        password_hash: '',
        dark_mode: authUser.dark_mode,
        created_at: '2025-01-01'
      }
    }

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
      const authUser = await getCurrentUser()
      
      if (!authUser) {
        redirect('/login')
      }

      // Create User object from AuthUser
      const user: User = {
        id: authUser.id,
        slug: `user-${authUser.id}`,
        title: authUser.full_name,
        type: 'users',
        created_at: new Date().toISOString(),
        modified_at: new Date().toISOString(),
        metadata: {
          full_name: authUser.full_name,
          email: authUser.email,
          password_hash: '',
          dark_mode: authUser.dark_mode,
          created_at: '2025-01-01'
        }
      }

      return {
        user,
        transactions: [],
        categories: []
      }
    }
    throw error
  }
}

export default async function TransactionsPage() {
  const data = await getTransactionsData()

  return (
    <DashboardLayout user={data.user}>
      <div className="space-y-grid-gap">
        {/* Page Header */}
        <div>
          <h1 className="text-heading md:text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">
            Transactions
          </h1>
          <p className="text-body text-text-secondary-light dark:text-text-secondary-dark mt-1">
            Add new transactions and view your transaction history
          </p>
        </div>

        {/* Transaction Form */}
        <TransactionForm categories={data.categories} />

        {/* Transactions List */}
        <TransactionsList 
          transactions={data.transactions}
          categories={data.categories}
        />
      </div>
    </DashboardLayout>
  )
}