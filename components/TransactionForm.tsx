'use client'

import { useState } from 'react'
import { Category, TransactionFormData } from '@/types'

interface TransactionFormProps {
  categories: Category[]
  onSuccess?: () => void
}

export default function TransactionForm({ categories, onSuccess }: TransactionFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<TransactionFormData>({
    type: 'expense',
    amount: 0,
    category: categories.length > 0 && categories[0] ? categories[0].id : '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('auth-token')
      if (!token) {
        throw new Error('Authentication required')
      }

      // Validate category is selected
      if (!formData.category) {
        throw new Error('Please select a category')
      }

      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        // Reset form - safely handle empty categories array
        setFormData({
          type: 'expense',
          amount: 0,
          category: categories.length > 0 && categories[0] ? categories[0].id : '',
          description: '',
          date: new Date().toISOString().split('T')[0]
        })
        onSuccess?.()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create transaction')
      }
    } catch (error) {
      console.error('Transaction creation error:', error)
      alert(error instanceof Error ? error.message : 'Failed to create transaction. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // If no categories available, show message
  if (categories.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Add Transaction</h3>
          <p className="card-subtitle">Record your income and expenses</p>
        </div>
        <div className="p-4 text-center text-text-secondary-light dark:text-text-secondary-dark">
          <p>No categories available. Please create a category first.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Add Transaction</h3>
        <p className="card-subtitle">Record your income and expenses</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                type: e.target.value as 'income' | 'expense' 
              }))}
              className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                amount: parseFloat(e.target.value) || 0 
              }))}
              className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              category: e.target.value 
            }))}
            className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md"
            required
          >
            <option value="">Select a category</option>
            {categories
              .filter(cat => cat.metadata.type?.key === formData.type)
              .map((category) => (
                <option key={category.id} value={category.id}>
                  {category.metadata.name}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
            Description (optional)
          </label>
          <input
            type="text"
            value={formData.description || ''}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              description: e.target.value 
            }))}
            className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md"
            placeholder="Enter description..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
            Date
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              date: e.target.value 
            }))}
            className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || !formData.category}
          className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Create Transaction'}
        </button>
      </form>
    </div>
  )
}