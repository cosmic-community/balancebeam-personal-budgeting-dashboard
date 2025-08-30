import type { Metadata } from 'next'
import './globals.css'
import AuthProvider from '@/components/AuthProvider'
import ThemeProvider from '@/components/ThemeProvider'

export const metadata: Metadata = {
  title: 'BalanceBeam - Personal Budgeting Dashboard',
  description: 'Take control of your finances with BalanceBeam, a modern personal budgeting dashboard powered by Cosmic CMS.',
  keywords: 'budgeting, personal finance, dashboard, money management, expenses, income',
  openGraph: {
    title: 'BalanceBeam - Personal Budgeting Dashboard',
    description: 'Take control of your finances with BalanceBeam',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
        <script src="/dashboard-console-capture.js"></script>
      </body>
    </html>
  )
}