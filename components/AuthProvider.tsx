'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthUser } from '@/types'

interface AuthContextType {
  user: AuthUser | null
  login: (token: string) => void
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
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth-token')
      if (!token) {
        setLoading(false)
        return
      }

      const response = await fetch('/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        // Invalid token, remove it
        localStorage.removeItem('auth-token')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('auth-token')
    }
    
    setLoading(false)
  }

  const login = (token: string) => {
    localStorage.setItem('auth-token', token)
    checkAuth() // Fetch user data
  }

  const logout = () => {
    localStorage.removeItem('auth-token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}