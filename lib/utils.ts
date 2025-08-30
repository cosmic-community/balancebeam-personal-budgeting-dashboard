import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Transaction, CategoryBreakdownItem, MonthlyDataItem } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Math.abs(amount))
}

// Environment variable helpers with proper type safety
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

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatDateForInput(dateString: string): string {
  return new Date(dateString).toISOString().split('T')[0]
}

// Email validation function
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function calculateCategoryBreakdown(transactions: Transaction[]): CategoryBreakdownItem[] {
  if (!transactions || transactions.length === 0) {
    return []
  }

  const categoryTotals = new Map<string, { amount: number; color: string; name: string }>()
  let totalExpenses = 0

  transactions.forEach(transaction => {
    const amount = Math.abs(transaction.metadata.amount || 0)
    totalExpenses += amount

    const categoryId = typeof transaction.metadata.category === 'object' 
      ? transaction.metadata.category?.id 
      : transaction.metadata.category

    const categoryName = typeof transaction.metadata.category === 'object' 
      ? transaction.metadata.category?.metadata?.name || 'Unknown Category'
      : 'Unknown Category'

    const categoryColor = typeof transaction.metadata.category === 'object' 
      ? transaction.metadata.category?.metadata?.color || '#999999'
      : '#999999'

    if (categoryId) {
      const existing = categoryTotals.get(categoryId) || { amount: 0, color: categoryColor, name: categoryName }
      existing.amount += amount
      categoryTotals.set(categoryId, existing)
    }
  })

  return Array.from(categoryTotals.values()).map(item => ({
    name: item.name,
    amount: item.amount,
    color: item.color,
    percentage: totalExpenses > 0 ? (item.amount / totalExpenses) * 100 : 0
  }))
}

export function calculateMonthlyData(transactions: Transaction[]): MonthlyDataItem[] {
  if (!transactions || transactions.length === 0) {
    return []
  }

  const monthlyTotals = new Map<string, { income: number; expenses: number }>()

  transactions.forEach(transaction => {
    const date = new Date(transaction.metadata.date)
    const monthKey = date.toISOString().substring(0, 7) // YYYY-MM format
    const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    
    const amount = transaction.metadata.amount || 0
    const existing = monthlyTotals.get(monthKey) || { income: 0, expenses: 0 }

    if (transaction.metadata.type?.key === 'income') {
      existing.income += Math.abs(amount)
    } else {
      existing.expenses += Math.abs(amount)
    }

    monthlyTotals.set(monthKey, existing)
  })

  return Array.from(monthlyTotals.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, data]) => {
      const date = new Date(monthKey + '-01')
      const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
      
      return {
        month: monthName,
        income: data.income,
        expenses: data.expenses,
        net: data.income - data.expenses
      }
    })
}