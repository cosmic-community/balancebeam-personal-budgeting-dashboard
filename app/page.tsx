import Hero from '@/components/Hero'
import Features from '@/components/Features'
import CallToAction from '@/components/CallToAction'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
      <CallToAction />
    </main>
  )
}