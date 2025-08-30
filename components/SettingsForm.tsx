'use client'

import { useState } from 'react'
import { isValidEmail } from '@/lib/utils'
import { User } from '@/types'

interface SettingsFormProps {
  user: User
  onUpdate?: () => void
}

export default function SettingsForm({ user, onUpdate }: SettingsFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: user.metadata.full_name,
    email: user.metadata.email,
    dark_mode: user.metadata.dark_mode || false,
    current_password: '',
    new_password: '',
    confirm_password: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate email
      if (!isValidEmail(formData.email)) {
        throw new Error('Please enter a valid email address')
      }

      // Validate password change if provided
      if (formData.new_password) {
        if (!formData.current_password) {
          throw new Error('Current password is required to set new password')
        }
        if (formData.new_password !== formData.confirm_password) {
          throw new Error('New passwords do not match')
        }
        if (formData.new_password.length < 6) {
          throw new Error('New password must be at least 6 characters long')
        }
      }

      const token = localStorage.getItem('auth-token')
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: formData.full_name,
          email: formData.email,
          dark_mode: formData.dark_mode,
          ...(formData.new_password && {
            current_password: formData.current_password,
            new_password: formData.new_password
          })
        })
      })

      if (response.ok) {
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          current_password: '',
          new_password: '',
          confirm_password: ''
        }))
        
        onUpdate?.()
        alert('Settings updated successfully!')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update settings')
      }
    } catch (error) {
      console.error('Settings update error:', error)
      alert((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">Account Settings</h3>
          <p className="card-subtitle">Update your personal information and preferences</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
            Personal Information
          </h4>
          
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
        </div>

        {/* Preferences */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
            Preferences
          </h4>
          
          <div className="flex items-center justify-between p-3 bg-surface-light dark:bg-surface-dark rounded-lg">
            <div>
              <h5 className="font-medium text-text-primary-light dark:text-text-primary-dark">
                Dark Mode
              </h5>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                Use dark theme for better viewing in low light
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.dark_mode}
                onChange={(e) => setFormData(prev => ({ ...prev, dark_mode: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>

        {/* Security */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
            Change Password
          </h4>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            Leave blank to keep current password
          </p>
          
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

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary"
          >
            {loading ? 'Updating...' : 'Update Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}