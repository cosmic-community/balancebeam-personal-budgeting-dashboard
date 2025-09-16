'use client'

import { useState } from 'react'
import { AuthUser } from '@/types'

interface SettingsFormProps {
  user: AuthUser | null
  onUpdate?: (user: AuthUser) => void
}

export default function SettingsForm({ user, onUpdate }: SettingsFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    dark_mode: user?.dark_mode || false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

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
        const data = await response.json()
        onUpdate?.(data.user)
        alert('Settings updated successfully!')
      } else {
        throw new Error('Failed to update settings')
      }
    } catch (error) {
      console.error('Settings update error:', error)
      alert('Failed to update settings. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('auth-token')
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('auth-token')
      window.location.href = '/login'
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">Account Settings</h3>
          <p className="card-subtitle">Update your profile information</p>
        </div>
      </div>
      
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
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md"
            required
          />
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="dark_mode"
            checked={formData.dark_mode}
            onChange={(e) => setFormData(prev => ({ ...prev, dark_mode: e.target.checked }))}
            className="w-4 h-4 text-primary"
          />
          <label 
            htmlFor="dark_mode"
            className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark"
          >
            Enable Dark Mode
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 btn-primary"
          >
            {loading ? 'Updating...' : 'Update Settings'}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="px-6 btn-secondary text-error hover:bg-error hover:text-white"
          >
            Logout
          </button>
        </div>
      </form>
    </div>
  )
}