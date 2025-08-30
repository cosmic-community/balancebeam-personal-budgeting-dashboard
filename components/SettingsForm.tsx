'use client'

import { useState, useEffect } from 'react'
import { User } from '@/types'
import { isValidEmail } from '@/lib/utils'

interface SettingsFormProps {
  user: User
}

export default function SettingsForm({ user: initialUser }: SettingsFormProps) {
  const [user, setUser] = useState(initialUser)
  const [formData, setFormData] = useState({
    full_name: initialUser.metadata.full_name,
    email: initialUser.metadata.email,
    dark_mode: initialUser.metadata.dark_mode || false
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    setSuccess('')

    // Validation
    const newErrors: Record<string, string> = {}
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setLoading(false)
      return
    }

    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Settings updated successfully!')
        // Update user state
        setUser(prev => ({
          ...prev,
          metadata: {
            ...prev.metadata,
            ...formData
          }
        }))

        // Apply theme change immediately
        if (formData.dark_mode !== initialUser.metadata.dark_mode) {
          document.documentElement.classList.toggle('dark', formData.dark_mode)
        }
      } else {
        setErrors({ form: data.error || 'Update failed' })
      }
    } catch (error) {
      console.error('Settings update error:', error)
      setErrors({ form: 'An error occurred. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Account Settings</h3>
        <p className="card-subtitle">Update your personal information and preferences</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && (
          <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-md text-sm">
            {errors.form}
          </div>
        )}
        
        {success && (
          <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-md text-sm">
            {success}
          </div>
        )}

        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
            Full Name
          </label>
          <input
            id="full_name"
            type="text"
            value={formData.full_name}
            onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
            className={`w-full px-4 py-3 bg-surface-light dark:bg-surface-dark border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.full_name ? 'border-error' : 'border-border-light dark:border-border-dark'
            }`}
            required
          />
          {errors.full_name && (
            <p className="mt-1 text-sm text-error">{errors.full_name}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className={`w-full px-4 py-3 bg-surface-light dark:bg-surface-dark border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.email ? 'border-error' : 'border-border-light dark:border-border-dark'
            }`}
            required
          />
          {errors.email && (
            <p className="mt-1 text-sm text-error">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.dark_mode}
              onChange={(e) => setFormData(prev => ({ ...prev, dark_mode: e.target.checked }))}
              className="w-4 h-4 text-primary bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark rounded focus:ring-primary focus:ring-2"
            />
            <span className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
              Enable dark mode
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Updating...' : 'Update Settings'}
        </button>
      </form>
    </div>
  )
}