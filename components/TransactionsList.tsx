'use client'

import { Transaction } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { 
  getTransactionCategoryName, 
  getTransactionCategoryColor,
  getTransactionDescription 
} from '@/types'

interface TransactionsListProps {
  transactions: Transaction[]
  onEdit?: (transaction: Transaction) => void
  onDelete?: (transactionId: string) => void
}

export default function TransactionsList({ transactions, onEdit, onDelete }: TransactionsListProps) {
  // Sort transactions by date (newest first)
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime()
  )

  if (transactions.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Transaction History</h3>
          <p className="card-subtitle">Your recent transactions will appear here</p>
        </div>
        <div className="flex items-center justify-center h-32 text-text-secondary-light dark:text-text-secondary-dark">
          <p>No transactions yet. Add your first transaction above.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">Transaction History</h3>
          <p className="card-subtitle">
            {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} total
          </p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-light dark:border-border-dark">
              <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                Date
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                Description
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                Category
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                Amount
              </th>
              {(onEdit || onDelete) && (
                <th className="text-right py-3 px-4 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {sortedTransactions.map((transaction) => {
              const isIncome = transaction.metadata.type?.key === 'income'
              const amount = transaction.metadata.amount || 0
              const categoryName = getTransactionCategoryName(transaction)
              const categoryColor = getTransactionCategoryColor(transaction)
              const description = getTransactionDescription(transaction)

              return (
                <tr 
                  key={transaction.id}
                  className="border-b border-border-light dark:border-border-dark hover:bg-background-light dark:hover:bg-background-dark transition-colors"
                >
                  <td className="py-3 px-4 text-sm text-text-primary-light dark:text-text-primary-dark">
                    {formatDate(transaction.metadata.date)}
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                        {transaction.title}
                      </p>
                      {description && description !== 'No description' && (
                        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
                          {description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: categoryColor }}
                      />
                      <span className="text-sm text-text-primary-light dark:text-text-primary-dark">
                        {categoryName}
                      </span>
                    </div>
                  </td>
                  <td className={`py-3 px-4 text-right text-sm font-medium ${
                    isIncome 
                      ? 'text-success' 
                      : 'text-error'
                  }`}>
                    {isIncome ? '+' : ''}
                    {formatCurrency(amount)}
                  </td>
                  {(onEdit || onDelete) && (
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(transaction)}
                            className="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary text-sm px-2 py-1 rounded transition-colors"
                          >
                            Edit
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(transaction.id)}
                            className="text-error hover:text-error-dark text-sm px-2 py-1 rounded transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}