'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { AuthUser } from '@/types'

interface AuthContextType {
  user: AuthUser | null
  login: (token: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchUser = async (token: string): Promise<AuthUser | null> => {
    try {
      const response = await fetch('/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        return data.user
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
    }
    return null
  }

  const login = async (token: string) => {
    localStorage.setItem('auth-token', token)
    const userData = await fetchUser(token)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('auth-token')
    setUser(null)
    router.push('/login')
  }

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth-token')
      if (token) {
        const userData = await fetchUser(token)
        setUser(userData)
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}