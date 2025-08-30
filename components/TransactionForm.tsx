'use client'

import { useState, useEffect } from 'react'
import { formatDateForInput } from '@/lib/utils'
import { Category, TransactionFormData } from '@/types'

interface TransactionFormProps {
  categories: Category[]
  onSuccess?: () => void
  editTransaction?: any
}

export default function TransactionForm({ categories, onSuccess, editTransaction }: TransactionFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<TransactionFormData>({
    type: 'expense',
    amount: 0,
    category: '',
    description: '',
    date: formatDateForInput(new Date())
  })

  // Load edit data if provided
  useEffect(() => {
    if (editTransaction) {
      setFormData({
        type: editTransaction.metadata.type?.key || 'expense',
        amount: Math.abs(editTransaction.metadata.amount || 0),
        category: typeof editTransaction.metadata.category === 'object' 
          ? editTransaction.metadata.category.id 
          : editTransaction.metadata.category || '',
        description: editTransaction.metadata.description || '',
        date: formatDateForInput(editTransaction.metadata.date || new Date())
      })
    }
  }, [editTransaction])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('auth-token')
      const url = editTransaction 
        ? `/api/transactions/${editTransaction.id}`
        : '/api/transactions'
      
      const method = editTransaction ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          amount: formData.type === 'expense' ? -Math.abs(formData.amount) : Math.abs(formData.amount)
        })
      })

      if (response.ok) {
        // Reset form for new transactions
        if (!editTransaction) {
          setFormData({
            type: 'expense',
            amount: 0,
            category: '',
            description: '',
            date: formatDateForInput(new Date())
          })
        }
        
        onSuccess?.()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${editTransaction ? 'update' : 'create'} transaction`)
      }
    } catch (error) {
      console.error('Transaction error:', error)
      alert(`Failed to ${editTransaction ? 'update' : 'create'} transaction. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  const expenseCategories = categories.filter(cat => cat.metadata.type?.key === 'expense')
  const incomeCategories = categories.filter(cat => cat.metadata.type?.key === 'income')
  const availableCategories = formData.type === 'income' ? incomeCategories : expenseCategories

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">
            {editTransaction ? 'Edit Transaction' : 'Add New Transaction'}
          </h3>
          <p className="card-subtitle">
            {editTransaction ? 'Update transaction details' : 'Enter your transaction information'}
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                type: e.target.value as 'income' | 'expense',
                category: '' // Reset category when type changes
              }))}
              className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md"
              required
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
              value={formData.amount || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md"
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
            className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md"
            required
          >
            <option value="">Select a category</option>
            {availableCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.metadata.name}
              </option>
            ))}
          </select>
          {availableCategories.length === 0 && (
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
              No {formData.type} categories available. Create one first in Settings.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
            Date
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
            Description (optional)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md resize-none"
            placeholder="Enter transaction description..."
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || !formData.category}
            className="flex-1 btn-primary"
          >
            {loading ? 'Processing...' : (editTransaction ? 'Update Transaction' : 'Add Transaction')}
          </button>
          {editTransaction && (
            <button
              type="button"
              onClick={() => onSuccess?.()}
              className="px-6 btn-secondary"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}