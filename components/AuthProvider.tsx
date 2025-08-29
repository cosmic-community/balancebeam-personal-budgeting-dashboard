'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AuthUser, LoginRequest, RegisterRequest } from '@/types'

interface AuthContextType {
  user: AuthUser | null
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('auth-token')
    if (token) {
      // In a real app, you might want to verify the token with the server
      // For now, we'll just check if it exists
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        if (payload.exp * 1000 > Date.now()) {
          // Token is still valid, get user data from API or storage
          // For simplicity, we'll store user data in localStorage
          const userData = localStorage.getItem('user-data')
          if (userData) {
            setUser(JSON.parse(userData))
          }
        } else {
          localStorage.removeItem('auth-token')
          localStorage.removeItem('user-data')
        }
      } catch (error) {
        localStorage.removeItem('auth-token')
        localStorage.removeItem('user-data')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (data: LoginRequest) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Login failed')
    }

    const result = await response.json()
    localStorage.setItem('auth-token', result.token)
    localStorage.setItem('user-data', JSON.stringify(result.user))
    setUser(result.user)
    router.push('/dashboard')
  }

  const register = async (data: RegisterRequest) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Registration failed')
    }

    const result = await response.json()
    localStorage.setItem('auth-token', result.token)
    localStorage.setItem('user-data', JSON.stringify(result.user))
    setUser(result.user)
    router.push('/dashboard')
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout error:', error)
    }
    
    localStorage.removeItem('auth-token')
    localStorage.removeItem('user-data')
    setUser(null)
    router.push('/login')
  }

  // Redirect logic
  useEffect(() => {
    if (!isLoading) {
      const isPublicPath = ['/', '/login', '/signup'].includes(pathname)
      
      if (!user && !isPublicPath) {
        router.push('/login')
      } else if (user && (pathname === '/login' || pathname === '/signup')) {
        router.push('/dashboard')
      }
    }
  }, [user, pathname, isLoading, router])

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}