import Link from 'next/link'
import { Transaction } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { getTransactionCategoryName, getTransactionDescription } from '@/types'

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
            <Link 
              href="/dashboard/transactions" 
              className="text-primary hover:text-primary-dark text-sm font-medium"
            >
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
          <Link 
            href="/dashboard/transactions" 
            className="text-primary hover:text-primary-dark text-sm font-medium"
          >
            View All
          </Link>
        </div>
      </div>
      
      <div className="space-y-3">
        {transactions.map((transaction) => {
          const isIncome = transaction.metadata.type?.key === 'income'
          const categoryName = getTransactionCategoryName(transaction)
          const description = getTransactionDescription(transaction)
          
          return (
            <div 
              key={transaction.id} 
              className="flex items-center justify-between p-3 bg-surface-light dark:bg-surface-dark rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-8 rounded-full ${isIncome ? 'bg-success' : 'bg-error'}`} />
                <div>
                  <p className="font-medium text-text-primary-light dark:text-text-primary-dark">
                    {transaction.title}
                  </p>
                  <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                    {categoryName} • {formatDate(transaction.metadata.date)}
                  </p>
                  {description !== 'No description' && (
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
                      {description}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className={`font-medium ${isIncome ? 'text-success' : 'text-error'}`}>
                  {isIncome ? '+' : '-'}{formatCurrency(Math.abs(transaction.metadata.amount || 0))}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}