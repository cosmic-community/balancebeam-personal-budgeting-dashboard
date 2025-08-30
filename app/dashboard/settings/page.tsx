import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { verifyJWT, extractTokenFromHeader } from '@/lib/auth'
import { cosmic } from '@/lib/cosmic'
import { User } from '@/types'
import DashboardLayout from '@/components/DashboardLayout'
import SettingsForm from '@/components/SettingsForm'

async function getUser(userId: string) {
  try {
    const userResponse = await cosmic.objects.findOne({
      type: 'users',
      id: userId
    })
    return userResponse.object as User
  } catch (error) {
    return null
  }
}

export default async function SettingsPage() {
  const headersList = await headers()
  const authHeader = headersList.get('authorization') || headersList.get('cookie')
  
  // Extract token from cookie if present
  let token: string | null = extractTokenFromHeader(authHeader)
  if (!token && authHeader?.includes('auth-token=')) {
    token = authHeader.split('auth-token=')[1]?.split(';')[0] || null
  }

  if (!token) {
    redirect('/login')
  }

  const payload = await verifyJWT(token)
  if (!payload) {
    redirect('/login')
  }

  const user = await getUser(payload.userId)
  
  if (!user) {
    redirect('/login')
  }

  // Convert User to AuthUser format expected by SettingsForm
  const authUser = {
    id: user.id,
    email: user.metadata.email,
    full_name: user.metadata.full_name,
    dark_mode: user.metadata.dark_mode || false
  }

  // Mock handler for user updates - this would normally trigger a revalidation
  const handleUserUpdate = () => {
    // In a real implementation, this would handle the user update
    // For now, it's just a placeholder to satisfy the TypeScript requirement
    console.log('User updated')
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-grid-gap">
        {/* Page Header */}
        <div>
          <h1 className="text-heading md:text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">
            Account Settings
          </h1>
          <p className="text-body text-text-secondary-light dark:text-text-secondary-dark mt-1">
            Manage your account preferences and settings
          </p>
        </div>

        {/* Settings Form */}
        <SettingsForm 
          user={authUser} 
          onUserUpdate={handleUserUpdate}
        />
      </div>
    </DashboardLayout>
  )
}