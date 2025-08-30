import Link from 'next/link'
import SignupForm from '@/components/SignupForm'

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-accent">
            BalanceBeam
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
            Create your account
          </h1>
          <p className="mt-2 text-text-secondary-light dark:text-text-secondary-dark">
            Start managing your finances today
          </p>
        </div>

        <div className="card">
          <div className="p-6">
            <SignupForm />
            
            <div className="mt-6 text-center">
              <p className="text-text-secondary-light dark:text-text-secondary-dark">
                Already have an account?{' '}
                <Link href="/login" className="text-accent hover:text-accent-hover font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}