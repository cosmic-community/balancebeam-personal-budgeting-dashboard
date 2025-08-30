'use client'

import { useState } from 'react'
import { Transaction, Category, TransactionFormData, getTransactionDescription } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'

interface TransactionsListProps {
  transactions: Transaction[]
  categories: Category[]
  userId: string
}

export default function TransactionsList({ 
  transactions: initialTransactions, 
  categories, 
  userId 
}: TransactionsListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<TransactionFormData>({
    type: 'expense',
    amount: 0,
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        setTransactions(prev => [data.transaction, ...prev])
        setFormData({
          type: 'expense',
          amount: 0,
          category: '',
          description: '',
          date: new Date().toISOString().split('T')[0]
        })
        setShowForm(false)
      } else {
        throw new Error('Failed to create transaction')
      }
    } catch (error) {
      console.error('Transaction creation error:', error)
      alert('Failed to create transaction. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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
      } else {
        throw new Error('Failed to delete transaction')
      }
    } catch (error) {
      console.error('Transaction deletion error:', error)
      alert('Failed to delete transaction. Please try again.')
    }
  }

  const getCategoryColor = (categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId)
    return category?.metadata?.color || '#999999'
  }

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId)
    return category?.metadata?.name || 'Unknown Category'
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="card-title">Transactions</h3>
            <p className="card-subtitle">Your recent transactions</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary text-sm px-3 py-1"
          >
            {showForm ? 'Cancel' : 'Add Transaction'}
          </button>
        </div>
      </div>
      
      {showForm && (
        <div className="border-b border-border-light dark:border-border-dark pb-4 mb-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'income' | 'expense' }))}
                  className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md text-sm"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md text-sm"
                required
              >
                <option value="">Select a category</option>
                {categories
                  .filter(cat => cat.metadata.type?.key === formData.type)
                  .map(category => (
                    <option key={category.id} value={category.id}>
                      {category.metadata.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
                Description
              </label>
              <input
                type="text"
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md text-sm"
                placeholder="Optional description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary text-sm py-2"
            >
              {loading ? 'Creating...' : 'Create Transaction'}
            </button>
          </form>
        </div>
      )}
      
      <div className="space-y-3">
        {transactions.length === 0 ? (
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-center py-8">
            No transactions yet. Create your first transaction above.
          </p>
        ) : (
          transactions.map((transaction) => {
            // Get category info safely
            let categoryColor = '#999999'
            let categoryName = 'Unknown Category'
            
            if (typeof transaction.metadata.category === 'object' && transaction.metadata.category?.metadata) {
              categoryColor = transaction.metadata.category.metadata.color || '#999999'
              categoryName = transaction.metadata.category.metadata.name || 'Unknown Category'
            } else if (typeof transaction.metadata.category === 'string') {
              const category = categories.find(c => c.id === transaction.metadata.category)
              if (category) {
                categoryColor = category.metadata.color || '#999999'
                categoryName = category.metadata.name || 'Unknown Category'
              }
            }

            // Get description safely
            const description = getTransactionDescription(transaction)
            
            return (
              <div 
                key={transaction.id} 
                className="flex items-center justify-between p-4 bg-surface-light dark:bg-surface-dark rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: categoryColor }}
                  />
                  <div>
                    <p className="font-medium text-text-primary-light dark:text-text-primary-dark">
                      {transaction.title}
                    </p>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                      {categoryName} • {formatDate(transaction.metadata.date)}
                    </p>
                    {description && description !== 'No description' && (
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
                        {description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className={`font-medium ${
                      transaction.metadata.type?.key === 'income' 
                        ? 'text-success' 
                        : 'text-error'
                    }`}>
                      {transaction.metadata.type?.key === 'income' ? '+' : '-'}
                      {formatCurrency(Math.abs(transaction.metadata.amount || 0))}
                    </p>
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                      {transaction.metadata.type?.value || 'Unknown'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(transaction.id)}
                    className="text-error hover:text-error-dark text-sm px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}