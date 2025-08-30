'use client'

import { useState, useEffect } from 'react'
import { Category, TransactionFormData } from '@/types'
import { formatDateForInput } from '@/lib/utils'

interface TransactionFormProps {
  categories?: Category[]
  onSuccess?: () => void
}

export default function TransactionForm({ categories: initialCategories, onSuccess }: TransactionFormProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories || [])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<TransactionFormData>({
    type: 'expense',
    amount: 0,
    category: '',
    description: '',
    date: formatDateForInput(new Date())
  })

  useEffect(() => {
    if (!initialCategories) {
      fetchCategories()
    }
  }, [initialCategories])

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('auth-token')
      if (!token) return

      const response = await fetch('/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
        
        // Set default category if available and none selected
        if (data.categories && data.categories.length > 0 && !formData.category) {
          setFormData(prev => ({ 
            ...prev, 
            category: data.categories[0]?.id || ''
          }))
        }
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.category) {
      alert('Please select a category')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('auth-token')
      if (!token) {
        alert('Please log in to create transactions')
        return
      }

      const response = await fetch('/api/transactions', {
        method: 'POST',
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
        // Reset form
        setFormData({
          type: 'expense',
          amount: 0,
          category: categories[0]?.id || '',
          description: '',
          date: formatDateForInput(new Date())
        })
        
        if (onSuccess) onSuccess()
        alert('Transaction created successfully!')
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to create transaction')
      }
    } catch (error) {
      console.error('Transaction creation error:', error)
      alert('Failed to create transaction. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const filteredCategories = categories.filter(cat => 
    cat.metadata.type?.key === formData.type
  )

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Add Transaction</h3>
        <p className="card-subtitle">Record a new income or expense</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Transaction Type */}
        <div>
          <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
            Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ 
                ...prev, 
                type: 'income',
                category: categories.find(c => c.metadata.type?.key === 'income')?.id || ''
              }))}
              className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                formData.type === 'income'
                  ? 'bg-success text-white border-success'
                  : 'bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark hover:border-success'
              }`}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ 
                ...prev, 
                type: 'expense',
                category: categories.find(c => c.metadata.type?.key === 'expense')?.id || ''
              }))}
              className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                formData.type === 'expense'
                  ? 'bg-error text-white border-error'
                  : 'bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark hover:border-error'
              }`}
            >
              Expense
            </button>
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
            Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark">
              $
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
              className="w-full pl-8 pr-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:border-transparent"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:border-transparent"
            required
          >
            <option value="">Select a category</option>
            {filteredCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.metadata.name}
              </option>
            ))}
          </select>
          {filteredCategories.length === 0 && (
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
              No {formData.type} categories available. Create one first.
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
            Description (Optional)
          </label>
          <input
            type="text"
            value={formData.description || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:border-transparent"
            placeholder="Enter description"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
            Date
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:border-transparent"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || filteredCategories.length === 0}
          className="w-full btn-primary py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : `Add ${formData.type === 'income' ? 'Income' : 'Expense'}`}
        </button>
      </form>
    </div>
  )
}