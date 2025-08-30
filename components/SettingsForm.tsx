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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate email
      if (!isValidEmail(formData.email)) {
        alert('Please enter a valid email address')
        return
      }

      // Validate password if changing
      if (formData.new_password) {
        if (!formData.current_password) {
          alert('Current password is required to change password')
          return
        }
        if (formData.new_password !== formData.confirm_password) {
          alert('New passwords do not match')
          return
        }
        if (formData.new_password.length < 6) {
          alert('New password must be at least 6 characters')
          return
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
        alert('Settings updated successfully')
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          current_password: '',
          new_password: '',
          confirm_password: ''
        }))
        
        // Reload page to reflect changes
        window.location.reload()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update settings')
      }
    } catch (error) {
      console.error('Settings update error:', error)
      alert(`Failed to update settings: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">Account Settings</h3>
          <p className="card-subtitle">Update your account information and preferences</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Information */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
            Profile Information
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
              <label className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                Dark Mode
              </label>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                Enable dark mode for better viewing in low light
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.dark_mode}
              onChange={(e) => setFormData(prev => ({ ...prev, dark_mode: e.target.checked }))}
              className="w-4 h-4 text-primary bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark rounded focus:ring-primary"
            />
          </div>
        </div>

        {/* Change Password */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
            Change Password
          </h4>
          
          <div>
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={formData.current_password}
              onChange={(e) => setFormData(prev => ({ ...prev, current_password: e.target.value }))}
              className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md"
              placeholder="Enter current password to change"
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
              placeholder="Enter new password (optional)"
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
              placeholder="Confirm new password"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-border-light dark:border-border-dark">
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