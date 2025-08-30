'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { validateEmail, validatePassword } from '@/lib/utils'

export default function SignupForm() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate email
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    // Validate password
    if (!validatePassword(formData.password)) {
      setError('Password must be at least 8 characters with uppercase, lowercase, and number')
      setLoading(false)
      return
    }

    // Check password confirmation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        // Store the token
        localStorage.setItem('auth-token', data.token)
        // Redirect to dashboard
        router.push('/dashboard')
      } else {
        setError(data.error || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
            Full Name
          </label>
          <input
            id="full_name"
            type="text"
            value={formData.full_name}
            onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
            className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="John Doe"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="your@email.com"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="Create a secure password"
            required
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="Confirm your password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary py-3"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
    </div>
  )
}