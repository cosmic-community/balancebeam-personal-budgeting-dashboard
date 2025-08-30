'use client'

import { useState } from 'react'
import { Category, TransactionFormData } from '@/types'
import { generateSlug } from '@/lib/utils'

interface TransactionFormProps {
  categories: Category[]
}

export default function TransactionForm({ categories }: TransactionFormProps) {
  const [loading, setLoading] = useState(false)
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
        // Reset form
        setFormData({
          type: 'expense',
          amount: 0,
          category: '',
          description: '',
          date: new Date().toISOString().split('T')[0]
        })
        
        // Reload page to show updated transactions
        window.location.reload()
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

  // Filter categories by type
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
        <div>
          <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
            Type
          </label>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: 'expense', category: '' }))}
              className={`px-4 py-2 rounded-md text-sm font-medium flex-1 ${
                formData.type === 'expense'
                  ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700'
                  : 'bg-surface-light dark:bg-surface-dark text-text-secondary-light dark:text-text-secondary-dark border border-border-light dark:border-border-dark'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: 'income', category: '' }))}
              className={`px-4 py-2 rounded-md text-sm font-medium flex-1 ${
                formData.type === 'income'
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700'
                  : 'bg-surface-light dark:bg-surface-dark text-text-secondary-light dark:text-text-secondary-dark border border-border-light dark:border-border-dark'
              }`}
            >
              Income
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
            Amount
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-text-secondary-light dark:text-text-secondary-dark">$</span>
            </div>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
              className="w-full pl-8 pr-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md text-text-primary-light dark:text-text-primary-dark"
              placeholder="0.00"
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
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md text-text-primary-light dark:text-text-primary-dark"
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
              No {formData.type} categories available. Create one in Settings first.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
            Description
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md text-text-primary-light dark:text-text-primary-dark"
            placeholder="What was this for?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
            Date
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md text-text-primary-light dark:text-text-primary-dark"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || !formData.category || !formData.amount}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Adding...' : `Add ${formData.type === 'income' ? 'Income' : 'Expense'}`}
        </button>
      </form>
    </div>
  )
}