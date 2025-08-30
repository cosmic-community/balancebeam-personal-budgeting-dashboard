'use client'

import { useState } from 'react'
import { Transaction, Category, TransactionFormData, TransactionType } from '@/types'
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
    category: categories.length > 0 ? categories[0].id : '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  })

  const resetForm = () => {
    setFormData({
      type: 'expense',
      amount: 0,
      category: categories.length > 0 ? categories[0].id : '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    })
    setEditingTransaction(null)
    setShowForm(false)
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
          'Authorization': `Bearer ${token}`
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
          setTransactions(prev => [data.transaction, ...prev])
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

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      type: transaction.metadata.type?.key || 'expense',
      amount: transaction.metadata.amount || 0,
      category: typeof transaction.metadata.category === 'string' 
        ? transaction.metadata.category 
        : transaction.metadata.category?.id || '',
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
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setTransactions(prev => prev.filter(t => t.id !== transactionId))
      } else {
        throw new Error('Failed to delete transaction')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete transaction. Please try again.')
    }
  }

  // Safe helper functions to handle potentially undefined values
  const getCategoryName = (transaction: Transaction): string => {
    if (typeof transaction.metadata.category === 'object' && transaction.metadata.category?.metadata?.name) {
      return transaction.metadata.category.metadata.name
    }
    return 'Unknown Category'
  }

  const getCategoryColor = (transaction: Transaction): string => {
    if (typeof transaction.metadata.category === 'object' && transaction.metadata.category?.metadata?.color) {
      return transaction.metadata.category.metadata.color
    }
    return '#999999'
  }

  const getTransactionDescription = (transaction: Transaction): string => {
    return transaction.metadata.description || 'No description'
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
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as TransactionType }))}
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
                        {category.metadata.name || category.title}
                      </option>
                    ))
                )}
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
              disabled={loading || categories.length === 0}
              className="w-full btn-primary text-sm py-2 disabled:opacity-50"
            >
              {loading 
                ? (editingTransaction ? 'Updating...' : 'Creating...') 
                : (editingTransaction ? 'Update Transaction' : 'Create Transaction')
              }
            </button>
            
            {categories.length === 0 && (
              <p className="text-sm text-error text-center">
                Please create at least one category in Settings before adding transactions.
              </p>
            )}
          </form>
        </div>
      )}
      
      <div className="space-y-3">
        {transactions.length === 0 ? (
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-center py-8">
            No transactions yet. Create your first transaction above.
          </p>
        ) : (
          transactions.map((transaction) => (
            <div 
              key={transaction.id} 
              className="flex items-center justify-between p-4 bg-surface-light dark:bg-surface-dark rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getCategoryColor(transaction) }}
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-text-primary-light dark:text-text-primary-dark">
                      {transaction.title}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      transaction.metadata.type?.key === 'income' 
                        ? 'bg-success bg-opacity-20 text-success' 
                        : 'bg-error bg-opacity-20 text-error'
                    }`}>
                      {transaction.metadata.type?.value || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                    <span>{getCategoryName(transaction)}</span>
                    <span>•</span>
                    <span>{formatDate(transaction.metadata.date)}</span>
                  </div>
                  <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                    {getTransactionDescription(transaction)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className={`font-bold ${
                    transaction.metadata.type?.key === 'income' 
                      ? 'text-success' 
                      : 'text-error'
                  }`}>
                    {transaction.metadata.type?.key === 'income' ? '+' : '-'}
                    {formatCurrency(Math.abs(transaction.metadata.amount || 0))}
                  </p>
                </div>
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
          ))
        )}
      </div>
    </div>
  )
}