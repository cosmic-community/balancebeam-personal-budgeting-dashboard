import { formatCurrency } from '@/lib/utils'

interface StatsCardsProps {
  totalIncome: number
  totalExpenses: number
  netBalance: number
}

export default function StatsCards({ totalIncome, totalExpenses, netBalance }: StatsCardsProps) {
  const stats = [
    {
      label: 'Total Income',
      value: totalIncome,
      icon: '💰',
      color: 'text-success'
    },
    {
      label: 'Total Expenses',
      value: totalExpenses,
      icon: '💸',
      color: 'text-error'
    },
    {
      label: 'Net Balance',
      value: netBalance,
      icon: netBalance >= 0 ? '📈' : '📉',
      color: netBalance >= 0 ? 'text-success' : 'text-error'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-grid-gap">
      {stats.map((stat, index) => (
        <div key={index} className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">
                {stat.label}
              </p>
              <p className={`text-number ${stat.color}`}>
                {formatCurrency(stat.value)}
              </p>
            </div>
            <div className="text-3xl">
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}