import LoginForm from '@/components/LoginForm'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">
            Welcome back
          </h1>
          <p className="mt-2 text-text-secondary-light dark:text-text-secondary-dark">
            Sign in to your BalanceBeam account
          </p>
        </div>
        
        <LoginForm />
        
        <div className="text-center">
          <p className="text-text-secondary-light dark:text-text-secondary-dark">
            Don't have an account?{' '}
            <Link 
              href="/signup" 
              className="text-accent hover:underline font-medium"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}