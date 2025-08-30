import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Transaction, CategoryBreakdownItem, MonthlyDataItem } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Environment variable getters with fallbacks
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

// Utility functions
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// NEW: Format date for HTML input field
export function formatDateForInput(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toISOString().split('T')[0]
}

export function calculateCategoryBreakdown(transactions: Transaction[]): CategoryBreakdownItem[] {
  if (!transactions || transactions.length === 0) {
    return []
  }

  const categoryTotals = new Map<string, { amount: number; color: string; name: string }>()
  
  transactions.forEach(transaction => {
    const category = transaction.metadata.category
    const amount = Math.abs(transaction.metadata.amount || 0)
    
    // Handle both populated and unpopulated category references
    let categoryName = 'Unknown'
    let categoryColor = '#999999'
    
    if (typeof category === 'object' && category !== null) {
      categoryName = category.metadata?.name || category.title || 'Unknown'
      categoryColor = category.metadata?.color || '#999999'
    } else if (typeof category === 'string') {
      categoryName = 'Unknown Category'
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

  const total = Array.from(categoryTotals.values()).reduce((sum, cat) => sum + cat.amount, 0)
  
  // FIXED: Handle potential undefined values with proper checks
  return Array.from(categoryTotals.entries()).map(([name, data]) => {
    // Ensure data exists and has required properties
    if (!data) {
      return {
        name: name || 'Unknown',
        amount: 0,
        color: '#999999',
        percentage: 0
      }
    }
    
    return {
      name: data.name || name || 'Unknown',
      amount: data.amount || 0,
      color: data.color || '#999999',
      percentage: total > 0 ? Math.round((data.amount / total) * 100) : 0
    }
  }).sort((a, b) => b.amount - a.amount)
}

export function calculateMonthlyData(transactions: Transaction[]): MonthlyDataItem[] {
  if (!transactions || transactions.length === 0) {
    return []
  }

  const monthlyTotals = new Map<string, { income: number; expenses: number }>()
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.metadata.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const amount = Math.abs(transaction.metadata.amount || 0)
    const type = transaction.metadata.type?.key
    
    const existing = monthlyTotals.get(monthKey) || { income: 0, expenses: 0 }
    
    if (type === 'income') {
      existing.income += amount
    } else if (type === 'expense') {
      existing.expenses += amount
    }
    
    monthlyTotals.set(monthKey, existing)
  })

  return Array.from(monthlyTotals.entries())
    .map(([monthKey, totals]) => ({
      month: new Date(monthKey + '-01').toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      }),
      income: totals.income,
      expenses: totals.expenses,
      net: totals.income - totals.expenses
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
}