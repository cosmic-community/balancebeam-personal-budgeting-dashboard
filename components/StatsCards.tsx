import { formatCurrency } from '@/lib/utils'

interface StatsCardsProps {
  totalIncome: number
  totalExpenses: number
  netBalance: number
}

export default function StatsCards({ totalIncome, totalExpenses, netBalance }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-grid-gap">
      {/* Total Income */}
      <div className="card">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                Total Income
              </p>
              <p className="text-2xl font-bold text-income mt-2">
                {formatCurrency(totalIncome)}
              </p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg">
              <span className="text-2xl">📈</span>
            </div>
          </div>
        </div>
      </div>

      {/* Total Expenses */}
      <div className="card">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                Total Expenses
              </p>
              <p className="text-2xl font-bold text-expense mt-2">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg">
              <span className="text-2xl">📉</span>
            </div>
          </div>
        </div>
      </div>

      {/* Net Balance */}
      <div className="card">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                Net Balance
              </p>
              <p className={`text-2xl font-bold mt-2 ${
                netBalance >= 0 ? 'text-income' : 'text-expense'
              }`}>
                {formatCurrency(netBalance)}
              </p>
            </div>
            <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${
              netBalance >= 0 
                ? 'bg-green-100 dark:bg-green-900' 
                : 'bg-red-100 dark:bg-red-900'
            }`}>
              <span className="text-2xl">
                {netBalance >= 0 ? '💰' : '⚠️'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}