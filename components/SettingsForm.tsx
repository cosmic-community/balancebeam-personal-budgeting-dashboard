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
    
    // Validate email
    if (!isValidEmail(formData.email)) {
      alert('Please enter a valid email address')
      return
    }

    // Validate passwords if changing password
    if (formData.new_password) {
      if (!formData.current_password) {
        alert('Current password is required to set a new password')
        return
      }
      if (formData.new_password !== formData.confirm_password) {
        alert('New passwords do not match')
        return
      }
      if (formData.new_password.length < 6) {
        alert('New password must be at least 6 characters long')
        return
      }
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('auth-token')
      const updateData: any = {
        full_name: formData.full_name,
        email: formData.email,
        dark_mode: formData.dark_mode
      }

      // Only include password fields if changing password
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
        alert('Settings updated successfully!')
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
        const data = await response.json()
        alert(data.error || 'Failed to update settings')
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
        <p className="card-subtitle">Update your personal information and preferences</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
            className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:border-transparent"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:border-transparent"
            required
          />
        </div>

        {/* Dark Mode Toggle */}
        <div className="flex items-center justify-between p-3 bg-surface-light dark:bg-surface-dark rounded-lg">
          <div>
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
              Dark Mode
            </label>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              Toggle between light and dark theme
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={formData.dark_mode}
              onChange={(e) => setFormData(prev => ({ ...prev, dark_mode: e.target.checked }))}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-light/25 dark:peer-focus:ring-primary-dark/25 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-light dark:peer-checked:bg-primary-dark"></div>
          </label>
        </div>

        {/* Password Change Section */}
        <div className="border-t border-border-light dark:border-border-dark pt-4">
          <h4 className="text-lg font-medium text-text-primary-light dark:text-text-primary-dark mb-4">
            Change Password
          </h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={formData.current_password}
                onChange={(e) => setFormData(prev => ({ ...prev, current_password: e.target.value }))}
                className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:border-transparent"
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
                className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:border-transparent"
                placeholder="Enter new password (min 6 characters)"
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
                className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:border-transparent"
                placeholder="Confirm new password"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Updating...' : 'Update Settings'}
        </button>
      </form>
    </div>
  )
}