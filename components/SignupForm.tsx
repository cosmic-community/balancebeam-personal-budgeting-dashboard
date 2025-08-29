'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { validateEmail, validatePassword } from '@/lib/utils'
import { RegisterRequest } from '@/types'

export default function SignupForm() {
  const router = useRouter()
  const { register } = useAuth()
  const [formData, setFormData] = useState<RegisterRequest>({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validation
    if (!formData.full_name.trim()) {
      setError('Full name is required')
      setLoading(false)
      return
    }

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    if (!validatePassword(formData.password)) {
      setError('Password must be at least 8 characters with letters and numbers')
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    const success = await register(formData)
    
    if (success) {
      router.push('/dashboard')
    } else {
      setError('Registration failed. Please try again.')
    }
    
    setLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="card">
        <div className="card-header text-center">
          <h2 className="card-title text-2xl">Create Account</h2>
          <p className="card-subtitle">Start tracking your finances today</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-error/10 border border-error/20 rounded-md text-error text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              minLength={8}
              required
            />
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
              At least 8 characters with letters and numbers
            </p>
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-2.5 font-medium"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            Already have an account?{' '}
            <Link href="/login" className="text-accent hover:text-accent-dark font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}