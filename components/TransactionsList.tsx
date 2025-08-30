'use client'

import { useState } from 'react'
import { Transaction, Category, TransactionFormData, getTransactionCategoryName, getTransactionCategoryColor } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'

interface TransactionsListProps {
  transactions: Transaction[]
  categories: Category[]
  userId: string
}

export default function TransactionsList({ transactions: initialTransactions, categories, userId }: TransactionsListProps) {
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

  // Filter categories by type
  const availableCategories = categories.filter(cat => cat.metadata.type?.key === formData.type)

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="card-title">All Transactions</h3>
            <p className="card-subtitle">Track your income and expenses</p>
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
        <div className="border-b border-border-light dark:border-border-dark pb-4 mb-4 px-6">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    type: e.target.value as 'income' | 'expense',
                    category: '' // Reset category when type changes
                  }))}
                  className="form-input"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>

              <div>
                <label className="form-label">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="form-input"
                  required
                >
                  <option value="">Select a category</option>
                  {availableCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.metadata.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label">Description (Optional)</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="form-input"
                placeholder="Enter a description"
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
      
      <div className="p-6 pt-0">
        {transactions.length === 0 ? (
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-center py-8">
            No transactions yet. Create your first transaction above.
          </p>
        ) : (
          <div className="space-y-3">
            {transactions
              .sort((a, b) => new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime())
              .map((transaction) => (
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
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.metadata.type?.key === 'income' ? 'text-income' : 'text-expense'
                      }`}>
                        {transaction.metadata.type?.key === 'income' ? '+' : '-'}
                        {formatCurrency(Math.abs(transaction.metadata.amount))}
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
              ))
            }
          </div>
        )}
      </div>
    </div>
  )
}