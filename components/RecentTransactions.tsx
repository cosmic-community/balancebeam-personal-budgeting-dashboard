import Link from 'next/link'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Transaction, getTransactionCategoryName, getTransactionDescription } from '@/types'

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="card-title">Recent Transactions</h3>
              <p className="card-subtitle">Your latest financial activity</p>
            </div>
            <Link href="/dashboard/transactions" className="btn-primary btn-small">
              View All
            </Link>
          </div>
        </div>
        <div className="flex items-center justify-center h-32 text-text-secondary-light dark:text-text-secondary-dark">
          <p>No transactions yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="card-title">Recent Transactions</h3>
            <p className="card-subtitle">Your latest financial activity</p>
          </div>
          <Link href="/dashboard/transactions" className="btn-primary btn-small">
            View All
          </Link>
        </div>
      </div>
      
      <div className="space-y-3">
        {transactions.map((transaction) => {
          const isIncome = transaction.metadata.type?.key === 'income'
          const categoryName = getTransactionCategoryName(transaction)
          const description = getTransactionDescription(transaction)
          const amount = Math.abs(transaction.metadata.amount || 0)
          
          return (
            <div key={transaction.id} className="flex items-center justify-between p-3 bg-surface-light dark:bg-surface-dark rounded-lg">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-text-primary-light dark:text-text-primary-dark">
                    {transaction.title}
                  </h4>
                  <span className={`font-semibold ${
                    isIncome 
                      ? 'text-success' 
                      : 'text-error'
                  }`}>
                    {isIncome ? '+' : '-'}{formatCurrency(amount)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                    {categoryName} • {description}
                  </p>
                  <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                    {formatDate(transaction.metadata.date || transaction.created_at)}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}