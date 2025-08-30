import { Transaction, CategoryBreakdownItem, MonthlyDataItem } from '@/types'

// Environment variable helpers
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

// Validation helpers
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Date formatting helpers
export function formatDateForInput(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (isNaN(dateObj.getTime())) {
    return new Date().toISOString().split('T')[0]
  }
  return dateObj.toISOString().split('T')[0]
}

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date'
  }
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Currency formatting
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

// Slug generation
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Dashboard data calculations
export function calculateCategoryBreakdown(transactions: Transaction[]): CategoryBreakdownItem[] {
  const categoryTotals = new Map<string, { name: string; amount: number; color: string }>()
  
  transactions.forEach(transaction => {
    if (transaction.metadata.type?.key === 'expense') {
      const categoryName = typeof transaction.metadata.category === 'object' 
        ? transaction.metadata.category.metadata?.name || 'Unknown'
        : 'Unknown'
      
      const categoryColor = typeof transaction.metadata.category === 'object'
        ? transaction.metadata.category.metadata?.color || '#999999'
        : '#999999'
      
      const amount = Math.abs(transaction.metadata.amount || 0)
      
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
    }
  })

  const total = Array.from(categoryTotals.values()).reduce((sum, cat) => sum + cat.amount, 0)
  
  return Array.from(categoryTotals.values()).map(category => ({
    ...category,
    percentage: total > 0 ? (category.amount / total) * 100 : 0
  }))
}

export function calculateMonthlyData(transactions: Transaction[]): MonthlyDataItem[] {
  const monthlyTotals = new Map<string, { income: number; expenses: number }>()
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.metadata.date)
    const monthKey = date.toISOString().slice(0, 7) // YYYY-MM format
    
    if (!monthlyTotals.has(monthKey)) {
      monthlyTotals.set(monthKey, { income: 0, expenses: 0 })
    }
    
    const month = monthlyTotals.get(monthKey)!
    const amount = transaction.metadata.amount || 0
    
    if (transaction.metadata.type?.key === 'income') {
      month.income += Math.abs(amount)
    } else if (transaction.metadata.type?.key === 'expense') {
      month.expenses += Math.abs(amount)
    }
  })
  
  // Get last 6 months
  const result: MonthlyDataItem[] = []
  const now = new Date()
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = date.toISOString().slice(0, 7)
    const monthName = date.toLocaleDateString('en-US', { month: 'short' })
    
    const data = monthlyTotals.get(monthKey) || { income: 0, expenses: 0 }
    
    result.push({
      month: monthName,
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses
    })
  }
  
  return result
}

// String utilities
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

export function capitalizeFirstLetter(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

// Number utilities
export function roundToTwo(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100
}

export function getPercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / Math.abs(previous)) * 100
}

// Array utilities
export function groupBy<T>(array: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return array.reduce((result, item) => {
    const key = keyFn(item)
    if (!result[key]) {
      result[key] = []
    }
    result[key].push(item)
    return result
  }, {} as Record<string, T[]>)
}

export function sortBy<T>(array: T[], keyFn: (item: T) => any, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aValue = keyFn(a)
    const bValue = keyFn(b)
    
    if (aValue < bValue) return order === 'asc' ? -1 : 1
    if (aValue > bValue) return order === 'asc' ? 1 : -1
    return 0
  })
}

// Class name utilities (cn function)
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}