'use client'

import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { LoginRequest } from '@/types'

export default function LoginForm() {
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(formData)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-6">
      {error && (
        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      <div>
        <label 
          htmlFor="email" 
          className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2"
        >
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="input w-full"
          placeholder="Enter your email"
          required
        />
      </div>
      
      <div>
        <label 
          htmlFor="password" 
          className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2"
        >
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="input w-full"
          placeholder="Enter your password"
          required
        />
      </div>
      
      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full"
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="spinner" />
            Signing in...
          </div>
        ) : (
          'Sign In'
        )}
      </button>
    </form>
  )
}