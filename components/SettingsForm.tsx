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
    full_name: user.metadata.full_name,
    email: user.metadata.email,
    dark_mode: user.metadata.dark_mode || false,
    current_password: '',
    new_password: '',
    confirm_password: ''
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      // Validate email format
      if (!isValidEmail(formData.email)) {
        throw new Error('Please enter a valid email address')
      }

      // Validate password change if provided
      if (formData.new_password) {
        if (!formData.current_password) {
          throw new Error('Current password is required to set a new password')
        }
        if (formData.new_password !== formData.confirm_password) {
          throw new Error('New passwords do not match')
        }
        if (formData.new_password.length < 6) {
          throw new Error('New password must be at least 6 characters long')
        }
      }

      const token = localStorage.getItem('auth-token')
      if (!token) {
        throw new Error('Authentication required. Please log in again.')
      }

      // Prepare update data
      const updateData: any = {
        full_name: formData.full_name,
        email: formData.email,
        dark_mode: formData.dark_mode
      }

      // Include password fields if changing password
      if (formData.new_password) {
        updateData.current_password = formData.current_password
        updateData.new_password = formData.new_password
      }

      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        setMessage('Settings updated successfully!')
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          current_password: '',
          new_password: '',
          confirm_password: ''
        }))
        
        // Reload page to reflect changes if needed
        if (formData.dark_mode !== user.metadata.dark_mode) {
          setTimeout(() => window.location.reload(), 1000)
        }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update settings')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">Account Settings</h3>
          <p className="card-subtitle">Update your profile and preferences</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {message && (
          <div className="p-3 bg-success/10 text-success rounded-md text-sm">
            {message}
          </div>
        )}
        
        {error && (
          <div className="p-3 bg-error/10 text-error rounded-md text-sm">
            {error}
          </div>
        )}

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

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="dark_mode"
            checked={formData.dark_mode}
            onChange={(e) => setFormData(prev => ({ ...prev, dark_mode: e.target.checked }))}
            className="w-4 h-4 text-primary bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark rounded focus:ring-primary focus:ring-2"
          />
          <label htmlFor="dark_mode" className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
            Enable Dark Mode
          </label>
        </div>

        <div className="border-t border-border-light dark:border-border-dark pt-4">
          <h4 className="text-lg font-medium text-text-primary-light dark:text-text-primary-dark mb-3">
            Change Password
          </h4>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-4">
            Leave blank if you don't want to change your password
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={formData.current_password}
                onChange={(e) => setFormData(prev => ({ ...prev, current_password: e.target.value }))}
                className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
                New Password
              </label>
              <input
                type="password"
                value={formData.new_password}
                onChange={(e) => setFormData(prev => ({ ...prev, new_password: e.target.value }))}
                className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md"
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={formData.confirm_password}
                onChange={(e) => setFormData(prev => ({ ...prev, confirm_password: e.target.value }))}
                className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md"
                minLength={6}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 btn-primary"
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}