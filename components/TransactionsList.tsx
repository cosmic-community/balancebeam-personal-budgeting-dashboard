'use client'

import { useState } from 'react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Transaction, Category, getTransactionCategoryName, getTransactionCategoryColor, getTransactionDescription } from '@/types'

interface TransactionsListProps {
  transactions: Transaction[]
  categories: Category[]
  onEdit?: (transaction: Transaction) => void
  onRefresh?: () => void
}

export default function TransactionsList({ 
  transactions: initialTransactions, 
  categories, 
  onEdit,
  onRefresh 
}: TransactionsListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date')

  const handleDelete = async (transactionId: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return

    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setTransactions(prev => prev.filter(t => t.id !== transactionId))
        onRefresh?.()
      } else {
        throw new Error('Failed to delete transaction')
      }
    } catch (error) {
      console.error('Transaction deletion error:', error)
      alert('Failed to delete transaction. Please try again.')
    }
  }

  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter(transaction => {
      if (filter === 'all') return true
      return transaction.metadata.type?.key === filter
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.metadata.date || b.created_at).getTime() - 
               new Date(a.metadata.date || a.created_at).getTime()
      } else {
        return Math.abs(b.metadata.amount || 0) - Math.abs(a.metadata.amount || 0)
      }
    })

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="card-title">Transactions</h3>
            <p className="card-subtitle">Manage your financial transactions</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'income' | 'expense')}
              className="px-3 py-1 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded text-sm"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
              className="px-3 py-1 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded text-sm"
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
          {filteredTransactions.map((transaction) => {
            const isIncome = transaction.metadata.type?.key === 'income'
            const categoryName = getTransactionCategoryName(transaction)
            const categoryColor = getTransactionCategoryColor(transaction)
            const description = getTransactionDescription(transaction)
            const amount = Math.abs(transaction.metadata.amount || 0)
            
            return (
              <div key={transaction.id} className="flex items-center justify-between p-4 bg-surface-light dark:bg-surface-dark rounded-lg hover:bg-background-light dark:hover:bg-background-dark transition-colors">
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: categoryColor }}
                  />
                  <div>
                    <h4 className="font-medium text-text-primary-light dark:text-text-primary-dark">
                      {transaction.title}
                    </h4>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                      {categoryName} • {description}
                    </p>
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                      {formatDate(transaction.metadata.date || transaction.created_at)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`font-semibold ${
                    isIncome 
                      ? 'text-success' 
                      : 'text-error'
                  }`}>
                    {isIncome ? '+' : '-'}{formatCurrency(amount)}
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(transaction)}
                        className="text-primary hover:text-primary-dark text-sm px-2 py-1 rounded"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="text-error hover:text-error-dark text-sm px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}