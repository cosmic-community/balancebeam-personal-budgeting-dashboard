import Link from 'next/link'

export default function CallToAction() {
  return (
    <section className="py-20 px-4 bg-accent">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-text-primary-light mb-4">
          Ready to take control of your finances?
        </h2>
        <p className="text-xl text-text-primary-light mb-8 opacity-90">
          Join thousands of users who are already managing their money smarter with BalanceBeam.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            href="/signup" 
            className="bg-text-primary-light hover:bg-text-primary-light/90 text-accent font-medium px-8 py-4 rounded-pill transition-all duration-200"
          >
            Start Your Free Account
          </Link>
          <Link 
            href="/login" 
            className="text-text-primary-light hover:underline font-medium px-8 py-4"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </section>
  )
}