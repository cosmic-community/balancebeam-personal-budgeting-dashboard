'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTheme } from './ThemeProvider'
import { User } from '@/types'

interface DashboardLayoutProps {
  children: React.ReactNode
  user: User
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const { isDarkMode, toggleDarkMode } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    try {
      // Call logout API
      await fetch('/api/auth/logout', {
        method: 'POST'
      })
      
      // Clear local storage
      localStorage.removeItem('auth-token')
      
      // Clear cookie
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      
      // Redirect to login
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
      // Force redirect even if API call fails
      localStorage.removeItem('auth-token')
      router.push('/login')
    }
  }

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: '📊'
    },
    {
      name: 'Transactions',
      href: '/dashboard/transactions',
      icon: '💰'
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: '⚙️'
    }
  ]

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-black opacity-50"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface-light dark:bg-surface-dark border-r border-border-light dark:border-border-dark transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-border-light dark:border-border-dark">
          <Link href="/dashboard" className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
            BalanceBeam
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md hover:bg-background-light dark:hover:bg-background-dark"
          >
            <span className="text-text-secondary-light dark:text-text-secondary-dark">✕</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="flex items-center px-4 py-2 text-text-secondary-light dark:text-text-secondary-dark hover:bg-background-light dark:hover:bg-background-dark rounded-md transition-colors"
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border-light dark:border-border-dark">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user.metadata.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                  {user.metadata.full_name}
                </p>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                  {user.metadata.email}
                </p>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md hover:bg-background-light dark:hover:bg-background-dark"
            >
              <span className="text-text-secondary-light dark:text-text-secondary-dark">
                {isDarkMode ? '☀️' : '🌙'}
              </span>
            </button>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-2 py-1 text-sm text-text-secondary-light dark:text-text-secondary-dark hover:bg-background-light dark:hover:bg-background-dark rounded-md transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between h-16 px-6 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md hover:bg-background-light dark:hover:bg-background-dark"
          >
            <span className="text-text-secondary-light dark:text-text-secondary-dark">☰</span>
          </button>
          <Link href="/dashboard" className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
            BalanceBeam
          </Link>
          <div className="w-8"></div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}