'use client'

import { useState } from 'react'
import { isValidEmail } from '@/lib/utils'
import { User } from '@/types'

interface SettingsFormProps {
  user: User
}

export default function SettingsForm({ user }: SettingsFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: user.metadata.full_name || '',
    email: user.metadata.email || '',
    dark_mode: user.metadata.dark_mode || false
  })
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    // Validate email
    if (!isValidEmail(formData.email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' })
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

      if (response.ok) {
        setMessage({ type: 'success', text: 'Settings updated successfully!' })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update settings')
      }
    } catch (error) {
      console.error('Settings update error:', error)
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update settings. Please try again.' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">Profile Settings</h3>
          <p className="card-subtitle">Update your personal information</p>
        </div>
      </div>
      
      {message && (
        <div className={`p-4 rounded-md mb-4 ${
          message.type === 'success' 
            ? 'bg-success/10 text-success border border-success/20' 
            : 'bg-error/10 text-error border border-error/20'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
            className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md"
            required
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="dark_mode"
            checked={formData.dark_mode}
            onChange={(e) => setFormData(prev => ({ ...prev, dark_mode: e.target.checked }))}
            className="mr-2 h-4 w-4 text-primary-light focus:ring-primary-light border-border-light dark:border-border-dark rounded"
          />
          <label htmlFor="dark_mode" className="text-sm text-text-primary-light dark:text-text-primary-dark">
            Enable dark mode
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary"
        >
          {loading ? 'Updating...' : 'Update Settings'}
        </button>
      </form>
    </div>
  )
}