'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { validateEmail, validatePassword } from '@/lib/utils'

export default function SignupForm() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    // Validate form
    const newErrors: Record<string, string> = {}
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required'
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters and contain letters and numbers'
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
        await login(data.token)
        router.push('/dashboard')
      } else {
        setErrors({ submit: data.error || 'Registration failed' })
      }
    } catch (error) {
      console.error('Registration error:', error)
      setErrors({ submit: 'An unexpected error occurred' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="form-label">Full Name</label>
        <input
          type="text"
          value={formData.full_name}
          onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
          className="form-input"
          placeholder="Enter your full name"
          disabled={loading}
        />
        {errors.full_name && <p className="form-error">{errors.full_name}</p>}
      </div>

      <div>
        <label className="form-label">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className="form-input"
          placeholder="Enter your email"
          disabled={loading}
        />
        {errors.email && <p className="form-error">{errors.email}</p>}
      </div>

      <div>
        <label className="form-label">Password</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          className="form-input"
          placeholder="Enter your password"
          disabled={loading}
        />
        {errors.password && <p className="form-error">{errors.password}</p>}
      </div>

      <div>
        <label className="form-label">Confirm Password</label>
        <input
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
          className="form-input"
          placeholder="Confirm your password"
          disabled={loading}
        />
        {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
      </div>

      {errors.submit && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-sm">{errors.submit}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="loading-spinner mr-2"></div>
            Creating account...
          </div>
        ) : (
          'Create Account'
        )}
      </button>
    </form>
  )
}