'use client'

import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { RegisterRequest } from '@/types'
import { validateEmail, validatePassword } from '@/lib/utils'

export default function SignupForm() {
  const [formData, setFormData] = useState<RegisterRequest>({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  
  const { register } = useAuth()

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required'
    }

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    const passwordValidation = validatePassword(formData.password)
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.message || 'Invalid password'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      await register(formData)
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : 'An error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-6">
      {errors.general && (
        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg">
          {errors.general}
        </div>
      )}
      
      <div>
        <label 
          htmlFor="full_name" 
          className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2"
        >
          Full Name
        </label>
        <input
          type="text"
          id="full_name"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          className={`input w-full ${errors.full_name ? 'border-error' : ''}`}
          placeholder="Enter your full name"
        />
        {errors.full_name && (
          <p className="text-error text-sm mt-1">{errors.full_name}</p>
        )}
      </div>
      
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
          className={`input w-full ${errors.email ? 'border-error' : ''}`}
          placeholder="Enter your email"
        />
        {errors.email && (
          <p className="text-error text-sm mt-1">{errors.email}</p>
        )}
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
          className={`input w-full ${errors.password ? 'border-error' : ''}`}
          placeholder="Create a password"
        />
        {errors.password && (
          <p className="text-error text-sm mt-1">{errors.password}</p>
        )}
      </div>
      
      <div>
        <label 
          htmlFor="confirmPassword" 
          className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2"
        >
          Confirm Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className={`input w-full ${errors.confirmPassword ? 'border-error' : ''}`}
          placeholder="Confirm your password"
        />
        {errors.confirmPassword && (
          <p className="text-error text-sm mt-1">{errors.confirmPassword}</p>
        )}
      </div>
      
      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full"
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="spinner" />
            Creating account...
          </div>
        ) : (
          'Create Account'
        )}
      </button>
    </form>
  )
}