'use client'

import { useState, useEffect } from 'react'
import { Transaction, Category, TransactionFormData, TransactionsListProps } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function TransactionsList({ transactions: initialTransactions, categories, userId }: TransactionsListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<TransactionFormData>({
    type: 'expense',
    amount: 0,
    category: categories[0]?.id || '', // Safe access with fallback
    description: '',
    date: new Date().toISOString().split('T')[0]
  })

  // Update form data when categories change
  useEffect(() => {
    if (categories.length > 0 && !formData.category) {
      setFormData(prev => ({ ...prev, category: categories[0].id }))
    }
  }, [categories, formData.category])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('auth-token')
      const url = editingId ? `/api/transactions/${editingId}` : '/api/transactions'
      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}` // Safe string interpolation
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        
        if (editingId) {
          setTransactions(prev => prev.map(t => t.id === editingId ? data.transaction : t))
          setEditingId(null)
        } else {
          setTransactions(prev => [data.transaction, ...prev])
        }
        
        resetForm()
      } else {
        throw new Error('Failed to save transaction')
      }
    } catch (error) {
      console.error('Transaction save error:', error)
      alert('Failed to save transaction. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingId(transaction.id)
    setFormData({
      type: transaction.metadata.type?.key || 'expense',
      amount: transaction.metadata.amount || 0,
      category: transaction.metadata.category?.id || categories[0]?.id || '', // Safe access with fallback
      description: transaction.metadata.description || '',
      date: transaction.metadata.date || new Date().toISOString().split('T')[0]
    })
    setShowForm(true)
  }

  const handleDelete = async (transactionId: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return

    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token || ''}` // Safe string interpolation
        }
      })

      if (response.ok) {
        setTransactions(prev => prev.filter(t => t.id !== transactionId))
      } else {
        throw new Error('Failed to delete transaction')
      }
    } catch (error) {
      console.error('Transaction delete error:', error)
      alert('Failed to delete transaction. Please try again.')
    }
  }

  const resetForm = () => {
    setFormData({
      type: 'expense',
      amount: 0,
      category: categories[0]?.id || '', // Safe access with fallback
      description: '',
      date: new Date().toISOString().split('T')[0]
    })
    setShowForm(false)
    setEditingId(null)
  }

  const getCategoryById = (categoryId: string): Category | undefined => {
    return categories.find(cat => cat.id === categoryId)
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="card-title">Transactions</h3>
            <p className="card-subtitle">Manage your income and expenses</p>
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
                {categories.length === 0 ? (
                  <option value="">No categories available</option>
                ) : (
                  categories
                    .filter(cat => cat.metadata.type?.key === formData.type)
                    .map(category => (
                      <option key={category.id} value={category.id}>
                        {category.metadata.name}
                      </option>
                    ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
                Description (Optional)
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md text-sm"
                placeholder="Enter description..."
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
              disabled={loading || categories.length === 0}
              className="w-full btn-primary text-sm py-2 disabled:opacity-50"
            >
              {loading ? (editingId ? 'Updating...' : 'Creating...') : (editingId ? 'Update Transaction' : 'Create Transaction')}
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
            const category = transaction.metadata.category
            const isIncome = transaction.metadata.type?.key === 'income'
            
            return (
              <div 
                key={transaction.id} 
                className="flex items-center justify-between p-4 bg-surface-light dark:bg-surface-dark rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  {category && (
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.metadata.color }}
                    />
                  )}
                  <div>
                    <h4 className="font-medium text-text-primary-light dark:text-text-primary-dark">
                      {transaction.title}
                    </h4>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                      {category?.metadata.name || 'No Category'} • {formatDate(transaction.metadata.date)}
                    </p>
                    {transaction.metadata.description && (
                      <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
                        {transaction.metadata.description}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`font-semibold ${
                    isIncome 
                      ? 'text-success' 
                      : 'text-error'
                  }`}>
                    {isIncome ? '+' : '-'}{formatCurrency(Math.abs(transaction.metadata.amount || 0))}
                  </span>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(transaction)}
                      className="text-primary hover:text-primary-dark text-sm px-2 py-1 rounded"
                    >
                      Edit
                    </button>
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
          })
        )}
      </div>
    </div>
  )
}