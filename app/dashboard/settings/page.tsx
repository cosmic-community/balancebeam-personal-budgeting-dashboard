import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { verifyJWT, extractTokenFromHeader } from '@/lib/auth'
import { cosmic } from '@/lib/cosmic'
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
    let categories: Category[] = []
    try {
      const categoriesResponse = await cosmic.objects
        .find({ 
          type: 'categories',
          'metadata.user': userId 
        })
        .props(['id', 'title', 'slug', 'metadata'])
      
      categories = categoriesResponse.objects as Category[]
    } catch (error) {
      // Categories might not exist yet, that's okay
      categories = []
    }

    return { user, categories }
  } catch (error) {
    return { user: null, categories: [] }
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

  return (
    <DashboardLayout user={data.user}>
      <div className="space-y-grid-gap">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
            Settings
          </h1>
          <p className="text-text-secondary-light dark:text-text-secondary-dark">
            Manage your account preferences and categories
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-grid-gap">
          {/* User Settings */}
          <SettingsForm user={data.user} />
          
          {/* Category Management */}
          <CategoryManager categories={data.categories} />
        </div>
      </div>
    </DashboardLayout>
  )
}