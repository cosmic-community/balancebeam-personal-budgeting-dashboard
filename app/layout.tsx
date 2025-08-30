import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import AuthProvider from '@/components/AuthProvider'
import CosmicBadge from '@/components/CosmicBadge'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BalanceBeam - Personal Budgeting Dashboard',
  description: 'Track your finances with ease using our intuitive budgeting dashboard powered by Cosmic CMS.',
  keywords: 'budgeting, finance, personal finance, dashboard, expense tracking, income tracking',
  authors: [{ name: 'BalanceBeam' }],
  openGraph: {
    title: 'BalanceBeam - Personal Budgeting Dashboard',
    description: 'Track your finances with ease using our intuitive budgeting dashboard.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <CosmicBadge bucketSlug={process.env.COSMIC_BUCKET_SLUG || 'budgeting-production'} />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}