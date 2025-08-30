import Link from 'next/link'
import LoginForm from '@/components/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-accent">
            BalanceBeam
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
            Welcome back
          </h1>
          <p className="mt-2 text-text-secondary-light dark:text-text-secondary-dark">
            Sign in to your account
          </p>
        </div>

        <div className="card">
          <div className="p-6">
            <LoginForm />
            
            <div className="mt-6 text-center">
              <p className="text-text-secondary-light dark:text-text-secondary-dark">
                Don't have an account?{' '}
                <Link href="/signup" className="text-accent hover:text-accent-hover font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}