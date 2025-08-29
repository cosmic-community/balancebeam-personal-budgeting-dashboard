'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { validateEmail } from '@/lib/utils'
import { LoginRequest } from '@/types'

export default function LoginForm() {
  const router = useRouter()
  const { login } = useAuth()
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Basic validation
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    const success = await login(formData)
    
    if (success) {
      router.push('/dashboard')
    } else {
      setError('Invalid email or password')
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
          <h2 className="card-title text-2xl">Welcome Back</h2>
          <p className="card-subtitle">Sign in to your account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-error/10 border border-error/20 rounded-md text-error text-sm">
              {error}
            </div>
          )}
          
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
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-2.5 font-medium"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            Don't have an account?{' '}
            <Link href="/signup" className="text-accent hover:text-accent-dark font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}