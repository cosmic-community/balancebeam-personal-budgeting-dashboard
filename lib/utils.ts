import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Transaction, CategoryBreakdownItem, MonthlyDataItem } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateForInput(dateString: string): string {
  return new Date(dateString).toISOString().split('T')[0]
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Environment variable getters with proper null checks and validation
export function getCosmicBucketSlug(): string {
  const bucketSlug = process.env.COSMIC_BUCKET_SLUG
  if (!bucketSlug) {
    throw new Error('COSMIC_BUCKET_SLUG environment variable is required')
  }
  return bucketSlug
}

export function getCosmicReadKey(): string {
  const readKey = process.env.COSMIC_READ_KEY
  if (!readKey) {
    throw new Error('COSMIC_READ_KEY environment variable is required')
  }
  return readKey
}

export function getCosmicWriteKey(): string {
  const writeKey = process.env.COSMIC_WRITE_KEY
  if (!writeKey) {
    throw new Error('COSMIC_WRITE_KEY environment variable is required')
  }
  return writeKey
}

export function calculateCategoryBreakdown(expenses: Transaction[]): CategoryBreakdownItem[] {
  if (!expenses || expenses.length === 0) {
    return []
  }

  // Group expenses by category
  const categoryTotals = new Map<string, { name: string; amount: number; color: string }>()
  let totalExpenses = 0

  expenses.forEach(transaction => {
    const amount = Math.abs(transaction.metadata.amount || 0)
    totalExpenses += amount

    // Safely extract category information
    let categoryName = 'Unknown Category'
    let categoryColor = '#999999'

    if (typeof transaction.metadata.category === 'object' && transaction.metadata.category?.metadata) {
      categoryName = transaction.metadata.category.metadata.name || categoryName
      categoryColor = transaction.metadata.category.metadata.color || categoryColor
    }

    if (categoryTotals.has(categoryName)) {
      const existing = categoryTotals.get(categoryName)!
      existing.amount += amount
    } else {
      categoryTotals.set(categoryName, {
        name: categoryName,
        amount,
        color: categoryColor
      })
    }
  })

  // Convert to array and add percentages
  return Array.from(categoryTotals.values()).map(category => ({
    ...category,
    percentage: totalExpenses > 0 ? Math.round((category.amount / totalExpenses) * 100) : 0
  })).sort((a, b) => b.amount - a.amount)
}

export function calculateMonthlyData(transactions: Transaction[]): MonthlyDataItem[] {
  if (!transactions || transactions.length === 0) {
    return []
  }

  // Group transactions by month
  const monthlyTotals = new Map<string, { income: number; expenses: number }>()

  transactions.forEach(transaction => {
    const date = new Date(transaction.metadata.date || new Date())
    const monthKey = date.toISOString().slice(0, 7) // YYYY-MM format
    const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    const amount = transaction.metadata.amount || 0

    if (!monthlyTotals.has(monthName)) {
      monthlyTotals.set(monthName, { income: 0, expenses: 0 })
    }

    const monthly = monthlyTotals.get(monthName)!
    if (transaction.metadata.type?.key === 'income') {
      monthly.income += Math.abs(amount)
    } else {
      monthly.expenses += Math.abs(amount)
    }
  })

  // Convert to array and calculate net
  return Array.from(monthlyTotals.entries()).map(([month, data]) => ({
    month,
    income: data.income,
    expenses: data.expenses,
    net: data.income - data.expenses
  })).sort((a, b) => a.month.localeCompare(b.month))
}

export function getTransactionDisplayAmount(transaction: Transaction): number {
  const amount = transaction.metadata.amount || 0
  return transaction.metadata.type?.key === 'expense' ? Math.abs(amount) : amount
}

export function getTransactionTypeColor(type: 'income' | 'expense'): string {
  return type === 'income' ? 'text-success' : 'text-error'
}

export function getTransactionTypeBadge(type: 'income' | 'expense'): string {
  return type === 'income' ? 'badge-success' : 'badge-error'
}

// JWT secret getter with proper validation
export function getJWTSecret(): string {
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is required')
  }
  return jwtSecret
}

// Validation helpers
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8
}

// Safe date formatting with fallbacks
export function formatSafeDate(dateInput: string | Date | undefined | null): string {
  if (!dateInput) {
    return formatDate(new Date().toISOString())
  }
  
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
    return formatDate(date.toISOString())
  } catch {
    return formatDate(new Date().toISOString())
  }
}

// Safe currency formatting with fallbacks
export function formatSafeCurrency(amount: number | undefined | null): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return formatCurrency(0)
  }
  return formatCurrency(amount)
}