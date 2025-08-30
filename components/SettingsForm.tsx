'use client'

import { useState } from 'react'
import { User } from '@/types'
import { validateEmail } from '@/lib/utils'

interface SettingsFormProps {
  user: User
}

export default function SettingsForm({ user }: SettingsFormProps) {
  const [formData, setFormData] = useState({
    full_name: user.metadata.full_name,
    email: user.metadata.email
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (!formData.full_name.trim()) {
      setMessage({ type: 'error', text: 'Full name is required' })
      setLoading(false)
      return
    }

    if (!validateEmail(formData.email)) {
      setMessage({ type: 'error', text: 'Invalid email format' })
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
        const data = await response.json()
        setMessage({ type: 'error', text: data.error || 'Failed to update settings' })
      }
    } catch (error) {
      console.error('Settings update error:', error)
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Account Settings</h3>
        <p className="card-subtitle">Update your account information</p>
      </div>
      
      <div className="p-6 pt-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Full Name</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              className="form-input"
              disabled={loading}
            />
          </div>

          <div>
            <label className="form-label">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="form-input"
              disabled={loading}
            />
          </div>

          {message && (
            <div className={`p-3 rounded-lg border ${
              message.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
            }`}>
              <p className="text-sm">{message.text}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="loading-spinner mr-2"></div>
                Updating...
              </div>
            ) : (
              'Update Settings'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}