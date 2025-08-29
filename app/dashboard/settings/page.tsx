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

    // Get all categories for user
    const categoriesResponse = await cosmic.objects
      .find({ 
        type: 'categories',
        'metadata.user': userId 
      })
      .props(['id', 'title', 'slug', 'metadata'])
    
    const categories = categoriesResponse.objects as Category[]

    return {
      user,
      categories
    }
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return {
        user: null,
        categories: []
      }
    }
    throw error
  }
}

export default async function SettingsPage() {
  const headersList = await headers()
  const authHeader = headersList.get('authorization') || headersList.get('cookie')
  
  // Extract token from cookie if present
  let token = extractTokenFromHeader(authHeader)
  if (!token && authHeader?.includes('auth-token=')) {
    token = authHeader.split('auth-token=')[1]?.split(';')[0]
  }

  if (!token) {
    redirect('/login')
  }

  const payload = verifyJWT(token)
  if (!payload) {
    redirect('/login')
  }

  const data = await getSettingsData(payload.userId)
  
  if (!data.user) {
    redirect('/login')
  }

  return (
    <DashboardLayout user={data.user}>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
            Settings
          </h1>
          <p className="text-text-secondary-light dark:text-text-secondary-dark">
            Manage your account and preferences
          </p>
        </div>

        {/* Settings Form */}
        <SettingsForm user={data.user} />

        {/* Category Manager */}
        <CategoryManager 
          categories={data.categories}
          userId={payload.userId}
        />
      </div>
    </DashboardLayout>
  )
}