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

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatDateForInput(date: Date | string): string {
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

// Email validation function
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
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

export function calculateCategoryBreakdown(transactions: Transaction[]): CategoryBreakdownItem[] {
  const categoryTotals = new Map<string, { amount: number; color: string; name: string }>()
  
  // Calculate totals for each category
  transactions.forEach(transaction => {
    if (typeof transaction.metadata.category === 'object' && transaction.metadata.category?.metadata) {
      const categoryId = transaction.metadata.category.id
      const categoryName = transaction.metadata.category.metadata.name || 'Unknown'
      const categoryColor = transaction.metadata.category.metadata.color || '#999999'
      const amount = Math.abs(transaction.metadata.amount || 0)
      
      if (categoryTotals.has(categoryId)) {
        const existing = categoryTotals.get(categoryId)!
        categoryTotals.set(categoryId, {
          ...existing,
          amount: existing.amount + amount
        })
      } else {
        categoryTotals.set(categoryId, {
          amount,
          color: categoryColor,
          name: categoryName
        })
      }
    }
  })
  
  // Calculate total for percentages
  const total = Array.from(categoryTotals.values()).reduce((sum, cat) => sum + cat.amount, 0)
  
  // Convert to CategoryBreakdownItem array with percentages
  return Array.from(categoryTotals.values())
    .map(cat => ({
      name: cat.name,
      amount: cat.amount,
      color: cat.color,
      percentage: total > 0 ? (cat.amount / total) * 100 : 0
    }))
    .sort((a, b) => b.amount - a.amount) // Sort by amount descending
}

export function calculateMonthlyData(transactions: Transaction[]): MonthlyDataItem[] {
  const monthlyTotals = new Map<string, { income: number; expenses: number }>()
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.metadata.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const amount = transaction.metadata.amount || 0
    
    if (!monthlyTotals.has(monthKey)) {
      monthlyTotals.set(monthKey, { income: 0, expenses: 0 })
    }
    
    const monthly = monthlyTotals.get(monthKey)!
    if (transaction.metadata.type?.key === 'income') {
      monthly.income += amount
    } else {
      monthly.expenses += Math.abs(amount)
    }
  })
  
  // Convert to array and sort by month
  return Array.from(monthlyTotals.entries())
    .map(([month, totals]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      income: totals.income,
      expenses: totals.expenses,
      net: totals.income - totals.expenses
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
}