import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { cosmic, hasStatus } from '@/lib/cosmic'
import CategoryManager from '@/components/CategoryManager'
import SettingsForm from '@/components/SettingsForm'
import { Category, AuthUser } from '@/types'

export default async function SettingsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value

  if (!token) {
    redirect('/login')
  }

  const payload = await verifyToken(token)
  if (!payload) {
    redirect('/login')
  }

  let user: AuthUser
  let categories: Category[] = []

  try {
    // Get user data
    const userResponse = await cosmic.objects
      .findOne({
        type: 'users',
        id: payload.userId
      })
      .props(['id', 'title', 'slug', 'metadata'])

    if (!userResponse.object) {
      redirect('/login')
    }

    user = {
      id: userResponse.object.id,
      email: userResponse.object.metadata.email,
      full_name: userResponse.object.metadata.full_name,
      dark_mode: userResponse.object.metadata.dark_mode || false
    }

    // Get categories for the user
    try {
      const categoriesResponse = await cosmic.objects
        .find({ 
          type: 'categories',
          'metadata.user': payload.userId 
        })
        .props(['id', 'title', 'slug', 'metadata'])
        .depth(1)

      categories = categoriesResponse.objects as Category[]
    } catch (error) {
      if (hasStatus(error) && error.status === 404) {
        categories = []
      } else {
        throw error
      }
    }

  } catch (error) {
    console.error('Settings page error:', error)
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
          Settings
        </h1>
        <p className="text-text-secondary-light dark:text-text-secondary-dark">
          Manage your account settings and categories
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SettingsForm user={user} />
        <CategoryManager categories={categories} />
      </div>
    </div>
  )
}