import Link from 'next/link'
import { Transaction } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { 
  getTransactionCategoryName, 
  getTransactionCategoryColor,
  getTransactionDescription 
} from '@/types'

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
            className="text-sm text-primary hover:text-primary-dark transition-colors"
          >
            View All
          </Link>
        </div>
      </div>
      
      {transactions.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-text-secondary-light dark:text-text-secondary-dark">
          <div className="text-center">
            <p className="mb-2">No transactions yet</p>
            <Link href="/dashboard/transactions" className="btn-primary btn-small">
              Add Your First Transaction
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction) => {
            const isIncome = transaction.metadata.type?.key === 'income'
            const amount = transaction.metadata.amount || 0
            const categoryName = getTransactionCategoryName(transaction)
            const categoryColor = getTransactionCategoryColor(transaction)
            const description = getTransactionDescription(transaction)

            return (
              <div 
                key={transaction.id}
                className="flex items-center justify-between p-3 bg-surface-light dark:bg-surface-dark rounded-lg hover:bg-background-light dark:hover:bg-background-dark transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: categoryColor }}
                  >
                    {isIncome ? '+' : '-'}
                  </div>
                  <div>
                    <p className="font-medium text-text-primary-light dark:text-text-primary-dark">
                      {transaction.title}
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                      <span>{categoryName}</span>
                      <span>•</span>
                      <span>{formatDate(transaction.metadata.date)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${
                    isIncome ? 'text-success' : 'text-error'
                  }`}>
                    {isIncome ? '+' : ''}
                    {formatCurrency(amount)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}