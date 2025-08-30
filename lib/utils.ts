import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Transaction, CategoryBreakdownItem, MonthlyDataItem } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function calculateCategoryBreakdown(expenseTransactions: Transaction[]): CategoryBreakdownItem[] {
  if (!expenseTransactions || expenseTransactions.length === 0) {
    return []
  }

  const categoryTotals = new Map<string, { amount: number; color: string; name: string }>()
  let totalExpenses = 0

  expenseTransactions.forEach(transaction => {
    const amount = Math.abs(transaction.metadata.amount || 0)
    totalExpenses += amount

    // Handle category data safely
    let categoryName = 'Unknown Category'
    let categoryColor = '#999999'

    if (typeof transaction.metadata.category === 'object' && transaction.metadata.category?.metadata) {
      categoryName = transaction.metadata.category.metadata.name || 'Unknown Category'
      categoryColor = transaction.metadata.category.metadata.color || '#999999'
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

  // Convert to array and calculate percentages
  const breakdown: CategoryBreakdownItem[] = Array.from(categoryTotals.entries()).map(([name, data]) => ({
    name: data.name,
    amount: data.amount,
    color: data.color,
    percentage: totalExpenses > 0 ? Math.round((data.amount / totalExpenses) * 100) : 0
  }))

  // Sort by amount (highest first)
  return breakdown.sort((a, b) => b.amount - a.amount)
}

export function calculateMonthlyData(transactions: Transaction[]): MonthlyDataItem[] {
  if (!transactions || transactions.length === 0) {
    return []
  }

  const monthlyTotals = new Map<string, { income: number; expenses: number }>()

  transactions.forEach(transaction => {
    const date = new Date(transaction.metadata.date)
    const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    const amount = Math.abs(transaction.metadata.amount || 0)

    const existing = monthlyTotals.get(monthKey) || { income: 0, expenses: 0 }
    
    if (transaction.metadata.type?.key === 'income') {
      existing.income += amount
    } else {
      existing.expenses += amount
    }

    monthlyTotals.set(monthKey, existing)
  })

  // Convert to array and calculate net
  const monthlyData: MonthlyDataItem[] = Array.from(monthlyTotals.entries()).map(([month, data]) => ({
    month,
    income: data.income,
    expenses: data.expenses,
    net: data.income - data.expenses
  }))

  // Sort by date (most recent first)
  return monthlyData.sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime())
}

// Safe environment variable getters with proper TypeScript handling
export function getRequiredEnvVar(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

export function getCosmicBucketSlug(): string {
  return getRequiredEnvVar('COSMIC_BUCKET_SLUG')
}

export function getCosmicReadKey(): string {
  return getRequiredEnvVar('COSMIC_READ_KEY')
}

export function getCosmicWriteKey(): string {
  return getRequiredEnvVar('COSMIC_WRITE_KEY')
}

// JWT Secret getter with validation
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required')
  }
  if (secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long')
  }
  return secret
}

// Safe string to number conversion
export function safeParseFloat(value: string | number | undefined): number {
  if (typeof value === 'number') return value
  if (!value || typeof value !== 'string') return 0
  
  const parsed = parseFloat(value)
  return isNaN(parsed) ? 0 : parsed
}

// Safe date formatting
export function safeDateFormat(dateString: string | undefined): string {
  if (!dateString) return 'No date'
  
  try {
    return formatDate(dateString)
  } catch {
    return 'Invalid date'
  }
}

// Generate crypto-secure random string for tokens
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  
  // Use crypto.getRandomValues if available (browser/Node.js with crypto)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(length)
    crypto.getRandomValues(array)
    
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length]
    }
  } else {
    // Fallback to Math.random (less secure but functional)
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)]
    }
  }
  
  return result
}