import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { verifyJWT, extractTokenFromHeader } from '@/lib/auth'
import { cosmic, hasStatus } from '@/lib/cosmic'
import { User } from '@/types'
import DashboardLayout from '@/components/DashboardLayout'
import SettingsForm from '@/components/SettingsForm'
import CategoryManager from '@/components/CategoryManager'

async function getUserData(userId: string) {
  try {
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

    return {
      user,
      categories: categoriesResponse.objects
    }
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

  const data = await getUserData(payload.userId)
  
  if (!data.user) {
    redirect('/login')
  }

  // Create a properly typed user object that matches the User interface
  const userForLayout: User = {
    id: data.user.id,
    slug: data.user.slug,
    title: data.user.title,
    type: data.user.type,
    metadata: data.user.metadata,
    created_at: data.user.created_at,
    modified_at: data.user.modified_at,
    status: data.user.status,
    bucket: data.user.bucket,
    published_at: data.user.published_at,
    modified_by: data.user.modified_by,
    created_by: data.user.created_by,
    publish_at: data.user.publish_at,
    thumbnail: data.user.thumbnail,
    content: data.user.content
  }

  return (
    <DashboardLayout user={userForLayout}>
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

        {/* Settings Form */}
        <SettingsForm user={userForLayout} />

        {/* Category Manager */}
        <CategoryManager categories={data.categories} />
      </div>
    </DashboardLayout>
  )
}