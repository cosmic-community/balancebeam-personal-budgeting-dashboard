'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import SignupForm from '@/components/SignupForm'
import { useTheme } from '@/components/ThemeProvider'

export default function SignupPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const { isDarkMode } = useTheme()

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    )
  }

  // Don't render signup form if user is authenticated
  if (user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-accent mb-2">BalanceBeam</h1>
          <h2 className="text-2xl font-semibold text-text-primary-light dark:text-text-primary-dark">
            Create your account
          </h2>
          <p className="mt-2 text-text-secondary-light dark:text-text-secondary-dark">
            Start managing your finances today
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card">
          <SignupForm />
          
          <div className="mt-6 text-center">
            <p className="text-text-secondary-light dark:text-text-secondary-dark">
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="font-medium text-accent hover:text-accent-hover transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}