'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import CategoryManager from '@/components/CategoryManager'
import SettingsForm from '@/components/SettingsForm'
import { Category, AuthUser } from '@/types'

export default function SettingsPage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth-token')
      
      if (!token) {
        window.location.href = '/login'
        return
      }

      // Load user data
      const userResponse = await fetch('/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (userResponse.ok) {
        const userData = await userResponse.json()
        setUser(userData.user)
      }

      // Load categories
      const categoriesResponse = await fetch('/api/categories')
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData.categories)
      }
    } catch (error) {
      console.error('Data loading error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center h-64">
          <div className="text-text-secondary-light dark:text-text-secondary-dark">
            Loading settings...
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-grid-gap">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-heading md:text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">
              Settings
            </h1>
            <p className="text-body text-text-secondary-light dark:text-text-secondary-dark mt-1">
              Manage your account and preferences
            </p>
          </div>
        </div>

        {/* Settings Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-grid-gap">
          {/* User Settings */}
          <SettingsForm user={user} onUpdate={setUser} />
          
          {/* Category Management */}
          <CategoryManager categories={categories} />
        </div>
      </div>
    </DashboardLayout>
  )
}