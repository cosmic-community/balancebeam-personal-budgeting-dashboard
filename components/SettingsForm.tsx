'use client'

import { useState } from 'react'
import { isValidEmail } from '@/lib/utils'
import { AuthUser } from '@/types'

interface SettingsFormProps {
  user: AuthUser
  onUserUpdate: (user: AuthUser) => void
}

export default function SettingsForm({ user, onUserUpdate }: SettingsFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: user.full_name || '',
    email: user.email || '',
    dark_mode: user.dark_mode || false
  })
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.full_name.trim()) {
      alert('Full name is required')
      return
    }
    
    if (!isValidEmail(formData.email)) {
      alert('Please enter a valid email address')
      return
    }

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
        onUserUpdate(data.user)
        alert('Profile updated successfully!')
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match')
      return
    }
    
    if (passwordData.newPassword.length < 6) {
      alert('New password must be at least 6 characters long')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      if (response.ok) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        alert('Password updated successfully!')
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to update password')
      }
    } catch (error) {
      console.error('Password update error:', error)
      alert('Failed to update password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile Settings */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Profile Settings</h3>
          <p className="card-subtitle">Update your account information</p>
        </div>
        
        <form onSubmit={handleProfileUpdate} className="space-y-4">
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
              id="darkMode"
              checked={formData.dark_mode}
              onChange={(e) => setFormData(prev => ({ ...prev, dark_mode: e.target.checked }))}
              className="w-4 h-4 text-primary bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark rounded"
            />
            <label htmlFor="darkMode" className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
              Enable Dark Mode
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary"
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>

      {/* Password Change */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Change Password</h3>
          <p className="card-subtitle">Update your account password</p>
        </div>
        
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
              className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
              New Password
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
              className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md"
              minLength={6}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md"
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary"
          >
            {loading ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  )
}