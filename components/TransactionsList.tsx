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
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [formData, setFormData] = useState<TransactionFormData>({
    type: 'expense',
    amount: 0,
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  })

  const resetForm = () => {
    setFormData({
      type: 'expense',
      amount: 0,
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    })
    setEditingTransaction(null)
    setShowForm(false)
  }

  const handleEdit = (transaction: Transaction) => {
    setFormData({
      type: transaction.metadata.type?.key || 'expense',
      amount: transaction.metadata.amount || 0,
      category: transaction.metadata.category?.id || '',
      description: transaction.metadata.description || '',
      date: transaction.metadata.date || new Date().toISOString().split('T')[0]
    })
    setEditingTransaction(transaction)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('auth-token')
      const url = editingTransaction 
        ? `/api/transactions/${editingTransaction.id}`
        : '/api/transactions'
      const method = editingTransaction ? 'PUT' : 'POST'

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
        if (editingTransaction) {
          setTransactions(prev => prev.map(t => 
            t.id === editingTransaction.id ? data.transaction : t
          ))
        } else {
          setTransactions(prev => [...prev, data.transaction])
        }
        resetForm()
      } else {
        throw new Error(`Failed to ${editingTransaction ? 'update' : 'create'} transaction`)
      }
    } catch (error) {
      console.error('Transaction error:', error)
      alert(`Failed to ${editingTransaction ? 'update' : 'create'} transaction. Please try again.`)
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

  const getTransactionIcon = (type: string | undefined) => {
    return type === 'income' ? '📈' : '📉'
  }

  const getTransactionColor = (type: string | undefined) => {
    return type === 'income' ? 'text-success' : 'text-error'
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
                  min="0"
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
                      {category.metadata.name || category.title}
                    </option>
                  ))
                }
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
              {loading 
                ? (editingTransaction ? 'Updating...' : 'Creating...') 
                : (editingTransaction ? 'Update Transaction' : 'Create Transaction')
              }
            </button>
          </form>
        </div>
      )}
      
      <div className="space-y-3">
        {transactions.length === 0 ? (
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-center py-4">
            No transactions yet. Add your first transaction above.
          </p>
        ) : (
          transactions
            .sort((a, b) => new Date(b.metadata.date || '').getTime() - new Date(a.metadata.date || '').getTime())
            .map((transaction) => (
              <div 
                key={transaction.id} 
                className="flex items-center justify-between p-4 bg-surface-light dark:bg-surface-dark rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">
                    {getTransactionIcon(transaction.metadata.type?.key)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-text-primary-light dark:text-text-primary-dark">
                        {transaction.title || 'Untitled Transaction'}
                      </h4>
                      <span 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: transaction.metadata.category?.metadata?.color || '#6B7280' }}
                      />
                    </div>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                      {transaction.metadata.category?.metadata?.name || 'No Category'} • {formatDate(transaction.metadata.date || '')}
                    </p>
                    {transaction.metadata.description && (
                      <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        {transaction.metadata.description}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`font-bold ${getTransactionColor(transaction.metadata.type?.key)}`}>
                    {transaction.metadata.type?.key === 'expense' ? '-' : '+'}
                    {formatCurrency(Math.abs(transaction.metadata.amount || 0))}
                  </span>
                  
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEdit(transaction)}
                      className="text-accent hover:text-accent-dark text-sm px-2 py-1 rounded"
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
            ))
        )}
      </div>
    </div>
  )
}