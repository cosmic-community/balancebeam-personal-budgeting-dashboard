'use client'

import { useState } from 'react'
import { Transaction, Category, TransactionFormData } from '@/types'
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
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<TransactionFormData>({
    type: 'expense',
    amount: 0,
    category: categories[0]?.id || '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  })

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
          'Authorization': `Bearer ${token || ''}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        
        if (editingId) {
          setTransactions(prev => 
            prev.map(t => t.id === editingId ? data.transaction : t)
          )
          setEditingId(null)
        } else {
          setTransactions(prev => [data.transaction, ...prev])
        }
        
        setFormData({
          type: 'expense',
          amount: 0,
          category: categories[0]?.id || '',
          description: '',
          date: new Date().toISOString().split('T')[0]
        })
        setShowForm(false)
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
    setFormData({
      type: transaction.metadata.type?.key || 'expense',
      amount: transaction.metadata.amount || 0,
      category: transaction.metadata.category?.id || '',
      description: transaction.metadata.description || '',
      date: transaction.metadata.date || new Date().toISOString().split('T')[0]
    })
    setEditingId(transaction.id)
    setShowForm(true)
  }

  const handleDelete = async (transactionId: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return

    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token || ''}`
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

  const resetForm = () => {
    setFormData({
      type: 'expense',
      amount: 0,
      category: categories[0]?.id || '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    })
    setEditingId(null)
    setShowForm(false)
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                  {categories
                    .filter(cat => cat.metadata.type?.key === formData.type)
                    .map(category => (
                      <option key={category.id} value={category.id}>
                        {category.metadata.name || category.title}
                      </option>
                    ))}
                </select>
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
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md text-sm"
                placeholder="Optional description"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary text-sm py-2"
              >
                {loading ? (editingId ? 'Updating...' : 'Creating...') : (editingId ? 'Update Transaction' : 'Create Transaction')}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-sm text-text-secondary-light dark:text-text-secondary-dark border border-border-light dark:border-border-dark rounded-md hover:bg-surface-light dark:hover:bg-surface-dark"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>
      )}
      
      <div className="space-y-3">
        {transactions.length === 0 ? (
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-center py-4">
            No transactions yet. Add your first transaction above.
          </p>
        ) : (
          transactions.map((transaction) => {
            // Safe property access with fallbacks
            const transactionType = transaction.metadata.type?.key || 'expense'
            const transactionValue = transaction.metadata.type?.value || 'Expense'
            const categoryName = transaction.metadata.category?.metadata?.name || transaction.metadata.category?.title || 'Unknown Category'
            const categoryColor = transaction.metadata.category?.metadata?.color || '#9CA3AF'
            const description = transaction.metadata.description || ''
            const date = transaction.metadata.date || ''
            const amount = transaction.metadata.amount || 0

            return (
              <div 
                key={transaction.id} 
                className="flex items-center justify-between p-3 bg-surface-light dark:bg-surface-dark rounded-lg"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: categoryColor }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-text-primary-light dark:text-text-primary-dark">
                        {transaction.title}
                      </p>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        transactionType === 'income' 
                          ? 'bg-success bg-opacity-20 text-success' 
                          : 'bg-error bg-opacity-20 text-error'
                      }`}>
                        {transactionValue}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                      <span>{categoryName}</span>
                      {description && (
                        <>
                          <span>•</span>
                          <span className="truncate">{description}</span>
                        </>
                      )}
                      {date && (
                        <>
                          <span>•</span>
                          <span>{formatDate(date)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className={`font-bold ${
                    transactionType === 'income' ? 'text-success' : 'text-error'
                  }`}>
                    {transactionType === 'income' ? '+' : '-'}{formatCurrency(Math.abs(amount))}
                  </p>
                  <div className="flex gap-1">
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