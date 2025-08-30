import { Transaction, getTransactionCategoryName, getTransactionCategoryColor } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
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
            className="text-accent hover:text-accent-hover text-sm font-medium"
          >
            View All
          </Link>
        </div>
      </div>
      
      {transactions.length === 0 ? (
        <div className="p-6 pt-0">
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-center py-8">
            No transactions yet. Start by adding your first transaction.
          </p>
        </div>
      ) : (
        <div className="p-6 pt-0 space-y-4">
          {transactions.map((transaction) => (
            <div 
              key={transaction.id} 
              className="flex items-center justify-between p-4 bg-surface-light dark:bg-surface-dark rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getTransactionCategoryColor(transaction) }}
                />
                <div>
                  <p className="font-medium text-text-primary-light dark:text-text-primary-dark">
                    {transaction.title}
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                    <span>{getTransactionCategoryName(transaction)}</span>
                    <span>•</span>
                    <span>{formatDate(transaction.metadata.date)}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className={`font-semibold ${
                  transaction.metadata.type?.key === 'income' ? 'text-income' : 'text-expense'
                }`}>
                  {transaction.metadata.type?.key === 'income' ? '+' : '-'}
                  {formatCurrency(Math.abs(transaction.metadata.amount))}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}