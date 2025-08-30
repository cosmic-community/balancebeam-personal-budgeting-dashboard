'use client'

import { useRouter } from 'next/navigation'

export default function Hero() {
  const router = useRouter()

  const handleSignIn = () => {
    router.push('/dashboard')
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-background-light via-surface-light to-background-light dark:from-background-dark dark:via-surface-dark dark:to-background-dark flex items-center justify-center">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-text-primary-light dark:text-text-primary-dark mb-6 leading-tight">
            Take Control of Your
            <span className="text-gradient bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent block">
              Financial Future
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-text-secondary-light dark:text-text-secondary-dark mb-12 max-w-3xl mx-auto leading-relaxed">
            Track expenses, manage budgets, and achieve your financial goals with our comprehensive personal budgeting dashboard.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={handleSignIn}
              className="btn-primary btn-large px-8 py-4 text-lg font-semibold"
            >
              Get Started Free
            </button>
            <button className="btn-secondary btn-large px-8 py-4 text-lg font-semibold">
              View Demo
            </button>
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
                Smart Analytics
              </h3>
              <p className="text-text-secondary-light dark:text-text-secondary-dark">
                Get insights into your spending patterns with detailed charts and reports
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
                Goal Tracking
              </h3>
              <p className="text-text-secondary-light dark:text-text-secondary-dark">
                Set and achieve your financial goals with personalized budgeting tools
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
                Secure & Private
              </h3>
              <p className="text-text-secondary-light dark:text-text-secondary-dark">
                Your financial data is encrypted and stored securely with bank-level security
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}