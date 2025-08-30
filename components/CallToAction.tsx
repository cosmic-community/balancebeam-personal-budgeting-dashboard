import Link from 'next/link'

export default function CallToAction() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-text-primary-light dark:text-text-primary-dark mb-6">
          Ready to Transform Your Financial Life?
        </h2>
        
        <p className="text-xl text-text-secondary-light dark:text-text-secondary-dark mb-8 max-w-2xl mx-auto">
          Join thousands of users who have already taken control of their finances with BalanceBeam. Start your journey to financial freedom today.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup" className="btn-primary text-lg px-8 py-3">
            Start Free Today
          </Link>
          <Link href="/dashboard" className="btn-secondary text-lg px-8 py-3">
            View Demo
          </Link>
        </div>
        
        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-6">
          No credit card required • Free forever • Get started in seconds
        </p>
      </div>
    </section>
  )
}