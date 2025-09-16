import { getCurrentUser, userToAuthUser } from '@/lib/auth'
import { cosmic, hasStatus } from '@/lib/cosmic'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Category, User } from '@/types'
import DashboardLayout from '@/components/DashboardLayout'
import SettingsForm from '@/components/SettingsForm'
import CategoryManager from '@/components/CategoryManager'

async function getSettingsData() {
  try {
    // Get auth token from cookies
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      redirect('/login')
    }

    // Get current user
    const authUser = await getCurrentUser(token)
    if (!authUser) {
      redirect('/login')
    }

    // Get full user object for DashboardLayout
    const userResponse = await cosmic.objects.findOne({
      type: 'users',
      id: authUser.id
    }).props(['id', 'title', 'slug', 'metadata'])

    const user = userResponse.object as User

    // Get user's categories
    const categoriesResponse = await cosmic.objects
      .find({ 
        type: 'categories',
        'metadata.user': authUser.id 
      })
      .props(['id', 'title', 'slug', 'metadata'])

    const categories = categoriesResponse.objects as Category[]

    return {
      user,
      authUser,
      categories
    }
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return {
        user: null,
        authUser: null,
        categories: []
      }
    }
    throw error
  }
}

export default async function SettingsPage() {
  const { user, authUser, categories } = await getSettingsData()

  if (!user || !authUser) {
    redirect('/login')
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
            Manage your account preferences and categories
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-grid-gap">
          {/* Settings Form */}
          <SettingsForm user={authUser} />

          {/* Category Manager */}
          <CategoryManager categories={categories} />
        </div>
      </div>
    </DashboardLayout>
  )
}