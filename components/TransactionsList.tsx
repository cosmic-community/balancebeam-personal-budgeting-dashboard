'use client'

import { useState } from 'react'
import { Transaction, Category } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'

interface TransactionsListProps {
  transactions: Transaction[]
  categories: Category[]
  userId: string
}

export default function TransactionsList({ transactions, categories }: TransactionsListProps) {
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date')

  // Filter and sort transactions
  let filteredTransactions = transactions
  
  if (filter !== 'all') {
    filteredTransactions = transactions.filter(t => t.metadata.type?.key === filter)
  }

  filteredTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime()
    } else {
      return b.metadata.amount - a.metadata.amount
    }
  })

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="card-title">All Transactions</h3>
            <p className="card-subtitle">{filteredTransactions.length} transactions</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Filter */}
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value as 'all' | 'income' | 'expense')}
              className="px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md text-sm"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expenses</option>
            </select>
            
            {/* Sort */}
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
              className="px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md text-sm"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
            </select>
          </div>
        </div>
      </div>
      
      {filteredTransactions.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-text-secondary-light dark:text-text-secondary-dark">
          <p>No transactions found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => (
            <div 
              key={transaction.id} 
              className="flex items-center justify-between p-4 bg-surface-light dark:bg-surface-dark rounded-lg hover:bg-opacity-80 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${
                  transaction.metadata.type?.key === 'income' ? 'bg-success' : 'bg-error'
                }`} />
                <div>
                  <p className="font-medium text-text-primary-light dark:text-text-primary-dark">
                    {transaction.title}
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                    <span>{transaction.metadata.category?.title || 'No category'}</span>
                    <span>•</span>
                    <span>{formatDate(transaction.metadata.date)}</span>
                  </div>
                  {transaction.metadata.description && (
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
                      {transaction.metadata.description}
                    </p>
                  )}
                </div>
              </div>
              <div className={`font-semibold text-lg ${
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