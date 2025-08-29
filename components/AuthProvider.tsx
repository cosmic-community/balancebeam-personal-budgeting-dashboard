'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { AuthUser, LoginRequest, RegisterRequest } from '@/types'

interface AuthContextType {
  user: AuthUser | null
  login: (credentials: LoginRequest) => Promise<boolean>
  register: (userData: RegisterRequest) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('auth-token')
    if (token) {
      // Verify token with server
      fetch('/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user)
        } else {
          localStorage.removeItem('auth-token')
        }
      })
      .catch(() => {
        localStorage.removeItem('auth-token')
      })
      .finally(() => {
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (credentials: LoginRequest): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('auth-token', data.token)
        setUser(data.user)
        return true
      } else {
        console.error('Login failed:', data.error)
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const register = async (userData: RegisterRequest): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('auth-token', data.token)
        setUser(data.user)
        return true
      } else {
        console.error('Registration failed:', data.error)
        return false
      }
    } catch (error) {
      console.error('Registration error:', error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('auth-token')
    setUser(null)
    // Optionally call logout endpoint
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {
      // Silent fail for logout endpoint
    })
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}