'use client'

import { Transaction } from '@/types'
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
            className="text-primary-light dark:text-primary-dark hover:underline text-sm"
          >
            View all
          </Link>
        </div>
      </div>
      
      {transactions.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-text-secondary-light dark:text-text-secondary-dark">
          <p>No transactions yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div 
              key={transaction.id} 
              className="flex items-center justify-between p-3 bg-surface-light dark:bg-surface-dark rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-8 rounded-full ${
                  transaction.metadata.type?.key === 'income' ? 'bg-success' : 'bg-error'
                }`} />
                <div>
                  <p className="font-medium text-text-primary-light dark:text-text-primary-dark">
                    {transaction.title}
                  </p>
                  <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                    {transaction.metadata.category?.title || 'No category'} • {formatDate(transaction.metadata.date)}
                  </p>
                </div>
              </div>
              <div className={`font-medium ${
                transaction.metadata.type?.key === 'income' ? 'text-success' : 'text-error'
              }`}>
                {transaction.metadata.type?.key === 'income' ? '+' : '-'}
                {formatCurrency(Math.abs(transaction.metadata.amount))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}