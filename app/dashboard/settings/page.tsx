import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { verifyJWT, extractTokenFromHeader } from '@/lib/auth'
import { cosmic, hasStatus } from '@/lib/cosmic'
import { User, Category } from '@/types'
import DashboardLayout from '@/components/DashboardLayout'
import SettingsForm from '@/components/SettingsForm'
import CategoryManager from '@/components/CategoryManager'

async function getSettingsData(userId: string) {
  try {
    // Get user data
    const userResponse = await cosmic.objects.findOne({
      type: 'users',
      id: userId
    })
    const user = userResponse.object as User

    // Get user's categories
    const categoriesResponse = await cosmic.objects
      .find({ 
        type: 'categories',
        'metadata.user': userId 
      })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)
    
    const categories = categoriesResponse.objects as Category[]

    return { user, categories }
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return { user: null, categories: [] }
    }
    throw error
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

  const data = await getSettingsData(payload.userId)
  
  if (!data.user) {
    redirect('/login')
  }

  // Convert User to AuthUser format expected by SettingsForm
  const authUser = {
    id: data.user.id,
    email: data.user.metadata.email,
    full_name: data.user.metadata.full_name,
    dark_mode: data.user.metadata.dark_mode || false
  }

  return (
    <DashboardLayout user={data.user}>
      <div className="space-y-grid-gap">
        {/* Page Header */}
        <div>
          <h1 className="text-heading md:text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">
            Settings
          </h1>
          <p className="text-body text-text-secondary-light dark:text-text-secondary-dark mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Settings Form and Category Manager */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-grid-gap">
          <SettingsForm user={authUser} onUpdate={() => {}} />
          <CategoryManager categories={data.categories} />
        </div>
      </div>
    </DashboardLayout>
  )
}