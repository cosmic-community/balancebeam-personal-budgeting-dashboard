import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { verifyJWT, extractTokenFromHeader } from '@/lib/auth'
import { cosmic, hasStatus } from '@/lib/cosmic'
import { Transaction, User } from '@/types'
import DashboardLayout from '@/components/DashboardLayout'
import StatsCards from '@/components/StatsCards'
import CashFlowChart from '@/components/CashFlowChart'
import CategoryPieChart from '@/components/CategoryPieChart'
import RecentTransactions from '@/components/RecentTransactions'
import { calculateCategoryBreakdown, calculateMonthlyData } from '@/lib/utils'

async function getDashboardData(userId: string) {
  try {
    // Get user data
    const userResponse = await cosmic.objects.findOne({
      type: 'users',
      id: userId
    })
    const user = userResponse.object as User

    // Get all transactions for user with category data
    const transactionsResponse = await cosmic.objects
      .find({ 
        type: 'transactions',
        'metadata.user': userId 
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

  const payload = verifyJWT(token)
  if (!payload) {
    redirect('/login')
  }

  const data = await getDashboardData(payload.userId)
  
  if (!data.user) {
    redirect('/login')
  }

  return (
    <DashboardLayout user={data.user}>
      <div className="space-y-grid-gap">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
              Welcome back, {data.user.metadata.full_name}
            </h1>
            <p className="text-text-secondary-light dark:text-text-secondary-dark">
              Here's your financial overview for today
            </p>
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