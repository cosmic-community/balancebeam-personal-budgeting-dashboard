import SignupForm from '@/components/SignupForm'
import Link from 'next/link'

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">
            Create your account
          </h1>
          <p className="mt-2 text-text-secondary-light dark:text-text-secondary-dark">
            Start tracking your finances with BalanceBeam
          </p>
        </div>
        
        <SignupForm />
        
        <div className="text-center">
          <p className="text-text-secondary-light dark:text-text-secondary-dark">
            Already have an account?{' '}
            <Link 
              href="/login" 
              className="text-accent hover:underline font-medium"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}