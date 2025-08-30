import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Transaction, CategoryBreakdownItem, MonthlyDataItem } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Environment variable getters with proper null checks
export function getCosmicBucketSlug(): string {
  const slug = process.env.COSMIC_BUCKET_SLUG
  if (!slug) {
    throw new Error('COSMIC_BUCKET_SLUG environment variable is required')
  }
  return slug
}

export function getCosmicReadKey(): string {
  const key = process.env.COSMIC_READ_KEY
  if (!key) {
    throw new Error('COSMIC_READ_KEY environment variable is required')
  }
  return key
}

export function getCosmicWriteKey(): string {
  const key = process.env.COSMIC_WRITE_KEY
  if (!key) {
    throw new Error('COSMIC_WRITE_KEY environment variable is required')
  }
  return key
}

// Validation functions
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): { isValid: boolean; message?: string } {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' }
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' }
  }
  return { isValid: true }
}

// Date formatting functions
export function formatDateForInput(dateString: string): string {
  if (!dateString) {
    return new Date().toISOString().split('T')[0]
  }
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return new Date().toISOString().split('T')[0]
    }
    return date.toISOString().split('T')[0]
  } catch (error) {
    return new Date().toISOString().split('T')[0]
  }
}

export function formatDate(dateString: string): string {
  if (!dateString) return 'Unknown Date'
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return 'Invalid Date'
    }
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date)
  } catch (error) {
    return 'Invalid Date'
  }
}

// Currency formatting
export function formatCurrency(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '$0.00'
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(Math.abs(amount))
}

// Slug generation
export function generateSlug(text: string): string {
  if (!text) {
    return 'untitled-' + Date.now()
  }
  
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    || 'untitled-' + Date.now() // Fallback if result is empty
}

// Safe category breakdown calculation
export function calculateCategoryBreakdown(expenseTransactions: Transaction[]): CategoryBreakdownItem[] {
  if (!expenseTransactions || expenseTransactions.length === 0) {
    return []
  }

  const categoryTotals = new Map<string, { amount: number; color: string; name: string }>()
  let totalExpenses = 0

  expenseTransactions.forEach(transaction => {
    const amount = Math.abs(transaction.metadata.amount || 0)
    totalExpenses += amount

    // Safe category access
    const category = transaction.metadata.category
    let categoryName = 'Unknown Category'
    let categoryColor = '#999999'

    if (category && typeof category === 'object') {
      // Category is populated object
      if (category.metadata) {
        categoryName = category.metadata.name || categoryName
        categoryColor = category.metadata.color || categoryColor
      }
    }

    const existing = categoryTotals.get(categoryName)
    if (existing) {
      existing.amount += amount
    } else {
      categoryTotals.set(categoryName, {
        amount,
        color: categoryColor,
        name: categoryName
      })
    }
  })

  if (totalExpenses === 0) {
    return []
  }

  return Array.from(categoryTotals.values()).map(category => ({
    name: category.name,
    amount: category.amount,
    color: category.color,
    percentage: Math.round((category.amount / totalExpenses) * 100)
  }))
}

// Safe monthly data calculation
export function calculateMonthlyData(transactions: Transaction[]): MonthlyDataItem[] {
  if (!transactions || transactions.length === 0) {
    return []
  }

  const monthlyTotals = new Map<string, { income: number; expenses: number }>()

  transactions.forEach(transaction => {
    const dateStr = transaction.metadata.date
    if (!dateStr) return

    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return

      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const amount = transaction.metadata.amount || 0
      const type = transaction.metadata.type?.key

      const existing = monthlyTotals.get(monthKey) || { income: 0, expenses: 0 }
      
      if (type === 'income') {
        existing.income += Math.abs(amount)
      } else if (type === 'expense') {
        existing.expenses += Math.abs(amount)
      }

      monthlyTotals.set(monthKey, existing)
    } catch (error) {
      // Skip invalid dates
      return
    }
  })

  return Array.from(monthlyTotals.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, totals]) => {
      const [year, month] = monthKey.split('-')
      const monthName = new Date(parseInt(year), parseInt(month) - 1, 1)
        .toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

      return {
        month: monthName,
        income: totals.income,
        expenses: totals.expenses,
        net: totals.income - totals.expenses
      }
    })
}

// JWT secret getter with proper validation
export function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required')
  }
  if (secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long')
  }
  return secret
}

// Hash password utility
export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcryptjs')
  return bcrypt.hash(password, 12)
}

// Compare password utility  
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  const bcrypt = await import('bcryptjs')
  return bcrypt.compare(password, hash)
}

// Safe user data extraction
export function extractUserData(user: any): { id: string; email: string; full_name: string; dark_mode: boolean } | null {
  if (!user || typeof user !== 'object') {
    return null
  }

  if (!user.id || !user.metadata) {
    return null
  }

  const metadata = user.metadata
  
  return {
    id: user.id,
    email: metadata.email || '',
    full_name: metadata.full_name || '',
    dark_mode: Boolean(metadata.dark_mode)
  }
}