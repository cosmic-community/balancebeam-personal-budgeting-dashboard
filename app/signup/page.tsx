import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import Link from 'next/link'
import { verifyJWT, extractTokenFromHeader } from '@/lib/auth'
import SignupForm from '@/components/SignupForm'

export default async function SignupPage() {
  // Check if user is already authenticated
  try {
    const headersList = await headers()
    const authHeader = headersList.get('authorization') || headersList.get('cookie')
    
    // Extract token from cookie if present
    let token: string | null = extractTokenFromHeader(authHeader)
    if (!token && authHeader?.includes('auth-token=')) {
      token = authHeader.split('auth-token=')[1]?.split(';')[0] || null
    }

    if (token) {
      const payload = await verifyJWT(token)
      if (payload) {
        redirect('/dashboard')
      }
    }
  } catch (error) {
    // Continue to signup page if token verification fails
    console.error('Token verification error:', error)
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="flex min-h-screen">
        {/* Left side - Signup Form */}
        <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h1 className="text-heading font-bold text-text-primary-light dark:text-text-primary-dark">
                Create Account
              </h1>
              <p className="mt-2 text-body text-text-secondary-light dark:text-text-secondary-dark">
                Join BalanceBeam to start tracking your finances
              </p>
            </div>
            
            <SignupForm />
            
            <div className="text-center">
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                Already have an account?{' '}
                <Link 
                  href="/login" 
                  className="text-primary hover:text-primary-dark transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Visual/Branding */}
        <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center bg-surface-light dark:bg-surface-dark">
          <div className="text-center space-y-6 max-w-md">
            <div className="text-6xl">💰</div>
            <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
              Take Control of Your Finances
            </h2>
            <p className="text-lg text-text-secondary-light dark:text-text-secondary-dark">
              Track expenses, manage budgets, and achieve your financial goals with BalanceBeam.
            </p>
            <div className="flex justify-center space-x-4 text-sm text-text-secondary-light dark:text-text-secondary-dark">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Easy to Use</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-warning rounded-full"></div>
                <span>Comprehensive</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}