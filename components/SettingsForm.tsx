'use client'

import { useState } from 'react'
import { User } from '@/types'

interface SettingsFormProps {
  user: User
}

export default function SettingsForm({ user }: SettingsFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: user.metadata.full_name,
    email: user.metadata.email,
    dark_mode: user.metadata.dark_mode || false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch(`/api/user/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        // Show success message
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

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Account Settings</h3>
        <p className="card-subtitle">Update your profile information</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
            className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md text-text-primary-light dark:text-text-primary-dark"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md text-text-primary-light dark:text-text-primary-dark"
            required
          />
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="dark_mode"
            checked={formData.dark_mode}
            onChange={(e) => setFormData(prev => ({ ...prev, dark_mode: e.target.checked }))}
            className="w-4 h-4"
          />
          <label htmlFor="dark_mode" className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
            Enable Dark Mode
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