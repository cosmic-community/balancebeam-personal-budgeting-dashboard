import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { cosmic, hasStatus } from '@/lib/cosmic'
import { Category, User } from '@/types'
import DashboardLayout from '@/components/DashboardLayout'
import CategoryManager from '@/components/CategoryManager'
import SettingsForm from '@/components/SettingsForm'

async function getSettingsData() {
  try {
    const authUser = await getCurrentUser()
    
    if (!authUser) {
      redirect('/login')
    }

    // Create User object from AuthUser
    const user: User = {
      id: authUser.id,
      slug: `user-${authUser.id}`,
      title: authUser.full_name,
      type: 'users',
      created_at: new Date().toISOString(),
      modified_at: new Date().toISOString(),
      metadata: {
        full_name: authUser.full_name,
        email: authUser.email,
        password_hash: '',
        dark_mode: authUser.dark_mode,
        created_at: '2025-01-01'
      }
    }

    // Get user's categories
    const categoriesResponse = await cosmic.objects
      .find({ 
        type: 'categories',
        'metadata.user': authUser.id 
      })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)
    
    const categories = categoriesResponse.objects as Category[]

    return {
      user,
      categories
    }
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      const authUser = await getCurrentUser()
      
      if (!authUser) {
        redirect('/login')
      }

      // Create User object from AuthUser
      const user: User = {
        id: authUser.id,
        slug: `user-${authUser.id}`,
        title: authUser.full_name,
        type: 'users',
        created_at: new Date().toISOString(),
        modified_at: new Date().toISOString(),
        metadata: {
          full_name: authUser.full_name,
          email: authUser.email,
          password_hash: '',
          dark_mode: authUser.dark_mode,
          created_at: '2025-01-01'
        }
      }

      return {
        user,
        categories: []
      }
    }
    throw error
  }
}

export default async function SettingsPage() {
  const data = await getSettingsData()

  return (
    <DashboardLayout user={data.user}>
      <div className="space-y-grid-gap">
        {/* Page Header */}
        <div>
          <h1 className="text-heading md:text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">
            Settings
          </h1>
          <p className="text-body text-text-secondary-light dark:text-text-secondary-dark mt-1">
            Manage your account and preferences
          </p>
        </div>

        {/* Settings Form */}
        <SettingsForm user={data.user} />

        {/* Category Management */}
        <CategoryManager categories={data.categories} />
      </div>
    </DashboardLayout>
  )
}