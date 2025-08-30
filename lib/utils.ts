import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Transaction, CategoryBreakdownItem, MonthlyDataItem } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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
    .replace(/(^-|-$)/g, '')
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date'
  }
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj)
}

export function formatDateForInput(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return new Date().toISOString().split('T')[0]
  }
  
  return dateObj.toISOString().split('T')[0]
}

export function formatRelativeDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInMs = now.getTime() - dateObj.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) {
    return 'Today'
  } else if (diffInDays === 1) {
    return 'Yesterday'
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`
  } else {
    return formatDate(dateObj)
  }
}

export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

export function absoluteValue(num: number): number {
  return Math.abs(num)
}

export function isPositive(num: number): boolean {
  return num > 0
}

export function isNegative(num: number): boolean {
  return num < 0
}

// Calculate category breakdown for expense transactions
export function calculateCategoryBreakdown(transactions: Transaction[]): CategoryBreakdownItem[] {
  const categoryTotals = new Map<string, { amount: number; color: string; name: string }>()
  
  transactions.forEach(transaction => {
    // Skip if not expense transaction
    if (transaction.metadata.type?.key !== 'expense') {
      return
    }
    
    // Get category info safely
    let categoryName = 'Unknown Category'
    let categoryColor = '#999999'
    
    if (typeof transaction.metadata.category === 'object' && transaction.metadata.category?.metadata) {
      categoryName = transaction.metadata.category.metadata.name || 'Unknown Category'
      categoryColor = transaction.metadata.category.metadata.color || '#999999'
    }
    
    const amount = Math.abs(transaction.metadata.amount || 0)
    
    if (categoryTotals.has(categoryName)) {
      const existing = categoryTotals.get(categoryName)!
      categoryTotals.set(categoryName, {
        ...existing,
        amount: existing.amount + amount
      })
    } else {
      categoryTotals.set(categoryName, {
        amount,
        color: categoryColor,
        name: categoryName
      })
    }
  })
  
  // Calculate total for percentages
  const totalExpenses = Array.from(categoryTotals.values()).reduce((sum, cat) => sum + cat.amount, 0)
  
  // Convert to CategoryBreakdownItem array
  return Array.from(categoryTotals.entries()).map(([name, data]) => ({
    name,
    amount: data.amount,
    color: data.color,
    percentage: calculatePercentage(data.amount, totalExpenses)
  })).sort((a, b) => b.amount - a.amount) // Sort by amount descending
}

// Calculate monthly data for transactions
export function calculateMonthlyData(transactions: Transaction[]): MonthlyDataItem[] {
  const monthlyTotals = new Map<string, { income: number; expenses: number }>()
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.metadata.date)
    if (isNaN(date.getTime())) {
      return // Skip invalid dates
    }
    
    const monthKey = date.toISOString().slice(0, 7) // YYYY-MM format
    const amount = transaction.metadata.amount || 0
    const isIncome = transaction.metadata.type?.key === 'income'
    
    if (monthlyTotals.has(monthKey)) {
      const existing = monthlyTotals.get(monthKey)!
      if (isIncome) {
        monthlyTotals.set(monthKey, {
          ...existing,
          income: existing.income + amount
        })
      } else {
        monthlyTotals.set(monthKey, {
          ...existing,
          expenses: existing.expenses + Math.abs(amount)
        })
      }
    } else {
      monthlyTotals.set(monthKey, {
        income: isIncome ? amount : 0,
        expenses: isIncome ? 0 : Math.abs(amount)
      })
    }
  })
  
  // Convert to MonthlyDataItem array and sort by date
  return Array.from(monthlyTotals.entries())
    .map(([monthKey, data]) => {
      const date = new Date(monthKey + '-01')
      const month = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      
      return {
        month,
        income: data.income,
        expenses: data.expenses,
        net: data.income - data.expenses
      }
    })
    .sort((a, b) => {
      // Sort by date (newest first)
      const dateA = new Date(a.month + ' 01')
      const dateB = new Date(b.month + ' 01')
      return dateA.getTime() - dateB.getTime()
    })
    .slice(-6) // Get last 6 months
}