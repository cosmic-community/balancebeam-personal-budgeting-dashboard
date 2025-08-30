'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AuthUser } from '@/types'

interface AuthContextType {
  user: AuthUser | null
  login: (user: AuthUser, token: string) => void
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

interface AuthProviderProps {
  children: ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check for existing auth on mount
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth-token')
      const userData = localStorage.getItem('user')
      
      if (token && userData) {
        // Verify token is still valid
        const response = await fetch('/api/user', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const userInfo = JSON.parse(userData)
          setUser(userInfo)
        } else {
          // Token invalid, clear storage
          localStorage.removeItem('auth-token')
          localStorage.removeItem('user')
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      // Clear invalid auth data
      localStorage.removeItem('auth-token')
      localStorage.removeItem('user')
    } finally {
      setLoading(false)
    }
  }

  const login = (userData: AuthUser, token: string) => {
    localStorage.setItem('auth-token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = async () => {
    try {
      // Call logout API to clear server-side cookie
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      })
    } catch (error) {
      console.error('Logout API call failed:', error)
    }

    // Clear client-side data
    localStorage.removeItem('auth-token')
    localStorage.removeItem('user')
    setUser(null)
    router.push('/login')
  }

  // Redirect logic
  useEffect(() => {
    if (!loading) {
      const isAuthRoute = pathname === '/login' || pathname === '/signup'
      const isDashboardRoute = pathname.startsWith('/dashboard')
      
      if (!user && isDashboardRoute) {
        // Not authenticated and trying to access dashboard
        router.push('/login')
      } else if (user && isAuthRoute) {
        // Authenticated and trying to access auth pages
        router.push('/dashboard')
      }
    }
  }, [user, loading, pathname, router])

  const value = {
    user,
    login,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}