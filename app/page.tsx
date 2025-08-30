import Hero from '@/components/Hero'
import Features from '@/components/Features'
import CallToAction from '@/components/CallToAction'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background-light dark:bg-background-dark">
      <Hero />
      <Features />
      <CallToAction />
    </main>
  )
}