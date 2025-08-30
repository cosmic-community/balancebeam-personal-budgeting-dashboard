'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { RegisterRequest } from '@/types'

export default function SignupForm() {
  const [formData, setFormData] = useState<RegisterRequest>({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const success = await register(formData)
      
      if (success) {
        router.push('/dashboard')
      } else {
        setError('Registration failed. Please try again.')
      }
    } catch (error) {
      setError('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-text-primary-light dark:text-text-primary-dark">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-text-secondary-light dark:text-text-secondary-dark">
            Or{' '}
            <Link href="/login" className="font-medium text-accent hover:text-accent-hover">
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-error bg-opacity-10 border border-error p-4">
              <div className="text-sm text-error">{error}</div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="full_name" className="sr-only">
                Full Name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                value={formData.full_name}
                onChange={handleChange}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-border-light dark:border-border-dark placeholder-text-secondary-light dark:placeholder-text-secondary-dark bg-card-light dark:bg-card-dark text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-accent focus:border-accent focus:z-10 sm:text-sm"
                placeholder="Full Name"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-border-light dark:border-border-dark placeholder-text-secondary-light dark:placeholder-text-secondary-dark bg-card-light dark:bg-card-dark text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-accent focus:border-accent focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-border-light dark:border-border-dark placeholder-text-secondary-light dark:placeholder-text-secondary-dark bg-card-light dark:bg-card-dark text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-accent focus:border-accent focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-border-light dark:border-border-dark placeholder-text-secondary-light dark:placeholder-text-secondary-dark bg-card-light dark:bg-card-dark text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-accent focus:border-accent focus:z-10 sm:text-sm"
                placeholder="Confirm Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-accent hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}