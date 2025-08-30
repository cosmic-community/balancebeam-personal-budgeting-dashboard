import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import ThemeProvider from '@/components/ThemeProvider'
import CosmicBadge from '@/components/CosmicBadge'
import { getCosmicBucketSlug } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'BalanceBeam - Personal Budgeting Dashboard',
  description: 'Track your income, expenses, and financial goals with ease. A powerful personal budgeting dashboard built with Next.js and Cosmic CMS.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const bucketSlug = getCosmicBucketSlug()

  return (
    <html lang="en">
      <body className="font-inter antialiased">
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
        <CosmicBadge bucketSlug={bucketSlug} />
      </body>
    </html>
  )
}