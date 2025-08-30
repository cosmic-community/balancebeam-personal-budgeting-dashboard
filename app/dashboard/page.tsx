import Link from 'next/link'
import { cosmic, hasStatus } from '@/lib/cosmic'
import { Transaction, User } from '@/types'
import DashboardLayout from '@/components/DashboardLayout'
import StatsCards from '@/components/StatsCards'
import CashFlowChart from '@/components/CashFlowChart'
import CategoryPieChart from '@/components/CategoryPieChart'
import RecentTransactions from '@/components/RecentTransactions'
import { calculateCategoryBreakdown, calculateMonthlyData } from '@/lib/utils'

async function getDashboardData() {
  try {
    // Get the first user from the system (demo user)
    const userResponse = await cosmic.objects
      .find({ type: 'users' })
      .props(['id', 'title', 'slug', 'metadata'])
      .limit(1)
    
    const user = userResponse.objects[0] as User

    if (!user) {
      // Return empty data if no user exists
      return {
        user: null,
        transactions: [],
        stats: {
          totalIncome: 0,
          totalExpenses: 0,
          netBalance: 0,
          recentTransactions: [],
          categoryBreakdown: [],
          monthlyData: []
        }
      }
    }

    // Get all transactions for the demo user with category data
    const transactionsResponse = await cosmic.objects
      .find({ 
        type: 'transactions',
        'metadata.user': user.id 
      })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)
    
    const transactions = transactionsResponse.objects as Transaction[]

    // Calculate stats
    const totalIncome = transactions
      .filter(t => t.metadata.type?.key === 'income')
      .reduce((sum, t) => sum + (t.metadata.amount || 0), 0)

    const totalExpenses = transactions
      .filter(t => t.metadata.type?.key === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.metadata.amount || 0), 0)

    const netBalance = totalIncome - totalExpenses

    // Get recent transactions (last 5)
    const recentTransactions = transactions
      .sort((a, b) => new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime())
      .slice(0, 5)

    // Calculate category breakdown
    const categoryBreakdown = calculateCategoryBreakdown(transactions.filter(t => t.metadata.type?.key === 'expense'))

    // Calculate monthly data
    const monthlyData = calculateMonthlyData(transactions)

    return {
      user,
      transactions,
      stats: {
        totalIncome,
        totalExpenses,
        netBalance,
        recentTransactions,
        categoryBreakdown,
        monthlyData
      }
    }
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return {
        user: null,
        transactions: [],
        stats: {
          totalIncome: 0,
          totalExpenses: 0,
          netBalance: 0,
          recentTransactions: [],
          categoryBreakdown: [],
          monthlyData: []
        }
      }
    }
    throw error
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()
  
  // Create a default user if none exists
  const defaultUser: User = data.user || {
    id: 'demo-user',
    slug: 'demo-user',
    title: 'Demo User',
    type: 'users',
    created_at: new Date().toISOString(),
    modified_at: new Date().toISOString(),
    metadata: {
      full_name: 'Demo User',
      email: 'demo@example.com',
      password_hash: '',
      dark_mode: false,
      created_at: '2025-01-01'
    }
  }

  return (
    <DashboardLayout user={defaultUser}>
      <div className="space-y-grid-gap">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-heading md:text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">
              Hello, {defaultUser.metadata.full_name}
            </h1>
            <p className="text-body text-text-secondary-light dark:text-text-secondary-dark mt-1">
              It's {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard/transactions" className="btn-secondary btn-small">
              View Transactions
            </Link>
            <Link href="/dashboard/transactions" className="btn-primary btn-small">
              New Transaction
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards 
          totalIncome={data.stats.totalIncome}
          totalExpenses={data.stats.totalExpenses}
          netBalance={data.stats.netBalance}
        />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-grid-gap">
          <CashFlowChart data={data.stats.monthlyData} />
          <CategoryPieChart data={data.stats.categoryBreakdown} />
        </div>

        {/* Recent Transactions */}
        <RecentTransactions transactions={data.stats.recentTransactions} />
      </div>
    </DashboardLayout>
  )
}