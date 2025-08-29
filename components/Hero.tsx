import Link from 'next/link'

export default function Hero() {
  return (
    <section className="bg-background-light dark:bg-background-dark py-20 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-text-primary-light dark:text-text-primary-dark mb-6 text-balance">
            Take Control of Your
            <span className="text-accent"> Finances</span>
          </h1>
          <p className="text-xl text-text-secondary-light dark:text-text-secondary-dark max-w-3xl mx-auto text-balance">
            BalanceBeam helps you track income and expenses with beautiful visualizations, 
            smart categorization, and insights that empower better financial decisions.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/signup" className="btn-primary">
            Get Started Free
          </Link>
          <Link href="/login" className="btn-secondary">
            Sign In
          </Link>
        </div>
        
        {/* Hero Image */}
        <div className="mt-16">
          <img 
            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600&fit=crop&auto=format,compress"
            alt="Financial dashboard preview"
            className="rounded-card shadow-lg mx-auto"
            width="1200"
            height="600"
          />
        </div>
      </div>
    </section>
  )
}