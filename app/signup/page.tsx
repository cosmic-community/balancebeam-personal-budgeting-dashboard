import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { extractTokenFromHeader, verifyJWT } from '@/lib/auth'
import { ThemeProvider } from '@/components/ThemeProvider'
import SignupForm from '@/components/SignupForm'

export default async function SignupPage() {
  const headersList = await headers()
  const authHeader = headersList.get('authorization') || headersList.get('cookie')
  
  // Extract token from cookie if present
  let token: string | null = extractTokenFromHeader(authHeader)
  if (!token && authHeader?.includes('auth-token=')) {
    token = authHeader.split('auth-token=')[1]?.split(';')[0] || null
  }

  // If user is already authenticated, redirect to dashboard
  if (token) {
    const payload = await verifyJWT(token)
    if (payload) {
      redirect('/dashboard')
    }
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <SignupForm />
      </div>
    </ThemeProvider>
  )
}