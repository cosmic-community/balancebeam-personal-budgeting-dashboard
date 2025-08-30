'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LoginRequest } from '@/types'

export default function LoginForm() {
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        // Store the JWT token in localStorage
        localStorage.setItem('auth-token', data.token)
        
        // Set cookie for server-side authentication
        document.cookie = `auth-token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
        
        // Redirect to dashboard
        router.push('/dashboard')
        router.refresh()
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card max-w-md mx-auto">
      <div className="card-header text-center">
        <h2 className="card-title">Welcome Back</h2>
        <p className="card-subtitle">Sign in to your BalanceBeam account</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-md text-sm mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="Enter your email"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
            Password
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            className="w-full px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="Enter your password"
            required
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <div className="text-center">
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
            Don't have an account?{' '}
            <Link href="/signup" className="text-primary hover:text-primary-dark font-medium">
              Sign up here
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}