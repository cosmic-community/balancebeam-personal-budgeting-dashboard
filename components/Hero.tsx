import Link from 'next/link'

export default function Hero() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-text-primary-light dark:text-text-primary-dark mb-6 text-balance">
          Take Control of Your{' '}
          <span className="text-accent">Personal Finances</span>
        </h1>
        
        <p className="text-xl text-text-secondary-light dark:text-text-secondary-dark mb-8 max-w-2xl mx-auto text-balance">
          BalanceBeam makes budgeting simple and intuitive. Track your income, manage expenses, and achieve your financial goals with our beautiful, powerful dashboard.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup" className="btn-primary text-lg">
            Get Started Free
          </Link>
          <Link href="/login" className="btn-secondary text-lg">
            Sign In
          </Link>
        </div>
      </div>
    </section>
  )
}