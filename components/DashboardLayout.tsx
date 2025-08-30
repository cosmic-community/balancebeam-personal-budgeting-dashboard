'use client'

import { ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { useTheme } from '@/components/ThemeProvider'
import { User } from '@/types'

interface DashboardLayoutProps {
  children: ReactNode
  user: User
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { logout } = useAuth()
  const { isDarkMode, toggleDarkMode } = useTheme()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Transactions', href: '/dashboard/transactions', icon: '💰' },
    { name: 'Settings', href: '/dashboard/settings', icon: '⚙️' }
  ]

  const isActiveRoute = (href: string) => {
    return pathname === href
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Top Navigation */}
      <nav className="bg-card-light dark:bg-card-dark border-b border-border-light dark:border-border-dark shadow-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold text-accent hover:text-accent-hover transition-colors">
                BalanceBeam
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-card hover:bg-background-light dark:hover:bg-background-dark transition-colors"
                aria-label="Toggle dark mode"
              >
                <span className="text-xl">{isDarkMode ? '☀️' : '🌙'}</span>
              </button>
              
              <div className="flex items-center space-x-3">
                <span className="text-body text-text-secondary-light dark:text-text-secondary-dark">
                  {user.metadata?.full_name || user.title}
                </span>
                <button
                  onClick={logout}
                  className="text-body text-text-secondary-light dark:text-text-secondary-dark hover:text-error transition-colors px-3 py-1 rounded-card hover:bg-background-light dark:hover:bg-background-dark"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-grid-gap">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64">
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`nav-pill flex items-center space-x-3 w-full ${
                    isActiveRoute(item.href) 
                      ? 'nav-pill-active' 
                      : 'nav-pill-inactive'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}