'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { isValidEmail, isValidPassword } from '@/lib/utils'
import { RegisterRequest } from '@/types'

export default function SignupForm() {
  const router = useRouter()
  const [formData, setFormData] = useState<RegisterRequest>({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    // Validation
    const newErrors: Record<string, string> = {}
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required'
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (!isValidPassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, and number'
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
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
        // Store token
        localStorage.setItem('auth-token', data.token)
        
        // Set cookie for SSR
        document.cookie = `auth-token=${data.token}; path=/; max-age=86400; SameSite=Lax`
        
        router.push('/dashboard')
      } else {
        setErrors({ form: data.error || 'Registration failed' })
      }
    } catch (error) {
      console.error('Registration error:', error)
      setErrors({ form: 'An error occurred. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.form && (
        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-md text-sm">
          {errors.form}
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
          className={`w-full px-4 py-3 bg-surface-light dark:bg-surface-dark border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
            errors.full_name ? 'border-error' : 'border-border-light dark:border-border-dark'
          }`}
          placeholder="Enter your full name"
          required
        />
        {errors.full_name && (
          <p className="mt-1 text-sm text-error">{errors.full_name}</p>
        )}
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
          className={`w-full px-4 py-3 bg-surface-light dark:bg-surface-dark border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
            errors.email ? 'border-error' : 'border-border-light dark:border-border-dark'
          }`}
          placeholder="Enter your email"
          required
        />
        {errors.email && (
          <p className="mt-1 text-sm text-error">{errors.email}</p>
        )}
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
          className={`w-full px-4 py-3 bg-surface-light dark:bg-surface-dark border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
            errors.password ? 'border-error' : 'border-border-light dark:border-border-dark'
          }`}
          placeholder="Enter your password"
          required
        />
        {errors.password && (
          <p className="mt-1 text-sm text-error">{errors.password}</p>
        )}
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
          className={`w-full px-4 py-3 bg-surface-light dark:bg-surface-dark border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
            errors.confirmPassword ? 'border-error' : 'border-border-light dark:border-border-dark'
          }`}
          placeholder="Confirm your password"
          required
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-error">{errors.confirmPassword}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating account...' : 'Create account'}
      </button>

      <div className="text-center">
        <p className="text-text-secondary-light dark:text-text-secondary-dark">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:text-primary-dark font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </form>
  )
}