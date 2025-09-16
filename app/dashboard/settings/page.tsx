import { getCurrentUser, userToAuthUser } from '@/lib/auth'
import { cosmic, hasStatus } from '@/lib/cosmic'
import { Category } from '@/types'
import DashboardLayout from '@/components/DashboardLayout'
import SettingsForm from '@/components/SettingsForm'
import CategoryManager from '@/components/CategoryManager'
import { NextRequest } from 'next/server'
import { headers } from 'next/headers'

async function getSettingsData(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getCurrentUser(request)
    if (!user) {
      return {
        user: null,
        categories: []
      }
    }

    // Get categories for the user
    const categoriesResponse = await cosmic.objects
      .find({ 
        type: 'categories',
        'metadata.user': user.id 
      })
      .props(['id', 'title', 'slug', 'metadata'])

    const categories = categoriesResponse.objects as Category[]

    return {
      user,
      categories
    }
  } catch (error) {
    console.error('Settings data error:', error)
    
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
  // Create a mock NextRequest from headers
  const headersList = headers()
  const request = new NextRequest('http://localhost:3000/dashboard/settings', {
    headers: headersList
  })
  
  const data = await getSettingsData(request)
  
  if (!data.user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
            Authentication Required
          </h1>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mb-4">
            Please log in to access your settings.
          </p>
        </div>
      </div>
    )
  }

  const authUser = userToAuthUser(data.user)

  return (
    <DashboardLayout user={authUser}>
      <div className="space-y-grid-gap">
        <div>
          <h1 className="text-heading md:text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">
            Settings
          </h1>
          <p className="text-body text-text-secondary-light dark:text-text-secondary-dark mt-1">
            Manage your account and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-grid-gap">
          <SettingsForm user={authUser} />
          <CategoryManager categories={data.categories} />
        </div>
      </div>
    </DashboardLayout>
  )
}