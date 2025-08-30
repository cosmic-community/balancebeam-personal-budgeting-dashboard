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
        <div className="p-card-padding">
          <div className="flex items-center justify-between">
            <div>
              <p className="stats-label">
                Total Income
              </p>
              <p className="stats-value text-income mt-2">
                {formatCurrency(totalIncome)}
              </p>
            </div>
            <div className="stats-card-icon bg-green-100 dark:bg-green-900">
              <span className="text-2xl">📈</span>
            </div>
          </div>
        </div>
      </div>

      {/* Total Expenses */}
      <div className="card">
        <div className="p-card-padding">
          <div className="flex items-center justify-between">
            <div>
              <p className="stats-label">
                Total Expenses
              </p>
              <p className="stats-value text-expense mt-2">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
            <div className="stats-card-icon bg-red-100 dark:bg-red-900">
              <span className="text-2xl">📉</span>
            </div>
          </div>
        </div>
      </div>

      {/* Net Balance */}
      <div className="card">
        <div className="p-card-padding">
          <div className="flex items-center justify-between">
            <div>
              <p className="stats-label">
                Net Balance
              </p>
              <p className={`stats-value mt-2 ${
                netBalance >= 0 ? 'text-income' : 'text-expense'
              }`}>
                {formatCurrency(netBalance)}
              </p>
            </div>
            <div className={`stats-card-icon ${
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