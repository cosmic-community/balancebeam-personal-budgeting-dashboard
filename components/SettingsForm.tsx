'use client'

import { useState } from 'react'
import { isValidEmail } from '@/lib/utils'
import { AuthUser } from '@/types'

interface SettingsFormProps {
  user: AuthUser
  onUpdate: (user: AuthUser) => void
}

export default function SettingsForm({ user, onUpdate }: SettingsFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: user.full_name,
    email: user.email,
    current_password: '',
    new_password: '',
    confirm_password: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (formData.new_password) {
      if (formData.new_password.length < 8) {
        newErrors.new_password = 'Password must be at least 8 characters'
      }
      if (formData.new_password !== formData.confirm_password) {
        newErrors.confirm_password = 'Passwords do not match'
      }
      if (!formData.current_password) {
        newErrors.current_password = 'Current password is required to change password'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('auth-token')
      const updateData: any = {
        full_name: formData.full_name,
        email: formData.email
      }

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
        const data = await response.json()
        onUpdate(data.user)
        
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          current_password: '',
          new_password: '',
          confirm_password: ''
        }))
        
        alert('Settings updated successfully!')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update settings')
      }
    } catch (error) {
      console.error('Settings update error:', error)
      alert('Failed to update settings. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleDarkMode = async () => {
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          dark_mode: !user.dark_mode
        })
      })

      if (response.ok) {
        const data = await response.json()
        onUpdate(data.user)
      }
    } catch (error) {
      console.error('Theme toggle error:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile Settings */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Profile Settings</h3>
            <p className="card-subtitle">Update your personal information</p>
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
              className={`w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border rounded-md ${
                errors.full_name 
                  ? 'border-error' 
                  : 'border-border-light dark:border-border-dark'
              }`}
              required
            />
            {errors.full_name && (
              <p className="text-error text-sm mt-1">{errors.full_name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className={`w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border rounded-md ${
                errors.email 
                  ? 'border-error' 
                  : 'border-border-light dark:border-border-dark'
              }`}
              required
            />
            {errors.email && (
              <p className="text-error text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <hr className="border-border-light dark:border-border-dark" />

          <div>
            <h4 className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-3">
              Change Password (optional)
            </h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-text-secondary-light dark:text-text-secondary-dark mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={formData.current_password}
                  onChange={(e) => setFormData(prev => ({ ...prev, current_password: e.target.value }))}
                  className={`w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border rounded-md ${
                    errors.current_password 
                      ? 'border-error' 
                      : 'border-border-light dark:border-border-dark'
                  }`}
                />
                {errors.current_password && (
                  <p className="text-error text-sm mt-1">{errors.current_password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-text-secondary-light dark:text-text-secondary-dark mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={formData.new_password}
                  onChange={(e) => setFormData(prev => ({ ...prev, new_password: e.target.value }))}
                  className={`w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border rounded-md ${
                    errors.new_password 
                      ? 'border-error' 
                      : 'border-border-light dark:border-border-dark'
                  }`}
                />
                {errors.new_password && (
                  <p className="text-error text-sm mt-1">{errors.new_password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-text-secondary-light dark:text-text-secondary-dark mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={formData.confirm_password}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirm_password: e.target.value }))}
                  className={`w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border rounded-md ${
                    errors.confirm_password 
                      ? 'border-error' 
                      : 'border-border-light dark:border-border-dark'
                  }`}
                />
                {errors.confirm_password && (
                  <p className="text-error text-sm mt-1">{errors.confirm_password}</p>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Theme Settings */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Appearance</h3>
            <p className="card-subtitle">Customize your interface</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-text-primary-light dark:text-text-primary-dark">
              Dark Mode
            </h4>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              Toggle between light and dark theme
            </p>
          </div>
          <button
            onClick={handleToggleDarkMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              user.dark_mode ? 'bg-primary' : 'bg-border-light dark:bg-border-dark'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                user.dark_mode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  )
}