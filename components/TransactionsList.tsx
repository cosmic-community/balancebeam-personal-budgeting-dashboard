'use client'

import { useState, useEffect } from 'react'
import { Transaction, Category } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'

interface TransactionsListProps {
  transactions: Transaction[]
  categories: Category[]
}

export default function TransactionsList({ 
  transactions: initialTransactions, 
  categories 
}: TransactionsListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [loading, setLoading] = useState(false)

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

  const handleDelete = async (transactionId: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return

    setLoading(true)
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
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete transaction')
      }
    } catch (error) {
      console.error('Transaction deletion error:', error)
      alert('Failed to delete transaction. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (transactions.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">All Transactions</h3>
          <p className="card-subtitle">Your transaction history</p>
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
          <p className="text-text-secondary-light dark:text-text-secondary-dark mb-6">
            Start by adding your first transaction to track your finances.
          </p>
          <a
            href="/dashboard/transactions"
            className="btn-primary"
          >
            Add Transaction
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="card-title">All Transactions</h3>
            <p className="card-subtitle">{transactions.length} transactions</p>
          </div>
          <a
            href="/dashboard/transactions"
            className="btn-primary text-sm px-3 py-1"
          >
            Add Transaction
          </a>
        </div>
      </div>
      
      <div className="divide-y divide-border-light dark:divide-border-dark">
        {transactions.map((transaction) => (
          <div 
            key={transaction.id}
            className="p-4 flex items-center justify-between hover:bg-surface-light dark:hover:bg-surface-dark transition-colors"
          >
            <div className="flex items-center space-x-4">
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
                {transaction.metadata.description && (
                  <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
                    {transaction.metadata.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
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
              <button
                onClick={() => handleDelete(transaction.id)}
                disabled={loading}
                className="text-error hover:text-error-dark disabled:opacity-50 p-1 rounded"
                title="Delete transaction"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}