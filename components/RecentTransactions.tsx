'use client'

import { formatDate, formatCurrency } from '@/lib/utils'
import { Transaction } from '@/types'

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  // Helper function to safely get category name
  const getCategoryName = (transaction: Transaction): string => {
    if (typeof transaction.metadata.category === 'object' && transaction.metadata.category?.metadata?.name) {
      return transaction.metadata.category.metadata.name
    }
    return 'Unknown Category'
  }

  // Helper function to safely get category color  
  const getCategoryColor = (transaction: Transaction): string => {
    if (typeof transaction.metadata.category === 'object' && transaction.metadata.category?.metadata?.color) {
      return transaction.metadata.category.metadata.color
    }
    return '#999999'
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Transactions</h3>
          <p className="card-subtitle">Your latest financial activity</p>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-surface-light dark:bg-surface-dark rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-text-secondary-light dark:text-text-secondary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
            No transactions yet
          </h3>
          <p className="text-text-secondary-light dark:text-text-secondary-dark">
            Start by adding your first transaction to see it here.
          </p>
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
            <p className="card-subtitle">{transactions.length} recent transactions</p>
          </div>
          <a
            href="/dashboard/transactions"
            className="text-sm text-primary hover:text-primary-dark font-medium"
          >
            View All
          </a>
        </div>
      </div>
      
      <div className="divide-y divide-border-light dark:divide-border-dark">
        {transactions.slice(0, 5).map((transaction) => (
          <div 
            key={transaction.id}
            className="p-4 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getCategoryColor(transaction) }}
              />
              <div>
                <p className="font-medium text-text-primary-light dark:text-text-primary-dark">
                  {transaction.title}
                </p>
                <div className="flex items-center space-x-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  <span>{getCategoryName(transaction)}</span>
                  <span>•</span>
                  <span>{formatDate(transaction.metadata.date)}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className={`font-semibold ${
                transaction.metadata.type?.key === 'income' 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {transaction.metadata.type?.key === 'income' ? '+' : '-'}
                {formatCurrency(Math.abs(transaction.metadata.amount || 0))}
              </p>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                {transaction.metadata.type?.value || 'Unknown'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}