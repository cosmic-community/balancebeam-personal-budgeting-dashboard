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
  }).format(amount)
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Fixed: Handle undefined environment variables properly
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

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
}

export function calculateCategoryBreakdown(transactions: Transaction[]): CategoryBreakdownItem[] {
  const categoryTotals: Record<string, { amount: number; color: string; name: string }> = {}
  let totalExpenses = 0

  transactions.forEach((transaction) => {
    const amount = Math.abs(transaction.metadata.amount || 0)
    totalExpenses += amount
    
    // Fixed: Handle potentially undefined category object
    const category = transaction.metadata.category
    if (category && typeof category === 'object' && category.metadata) {
      const categoryName = category.metadata.name || 'Unknown Category'
      const categoryColor = category.metadata.color || '#999999'
      
      if (categoryTotals[categoryName]) {
        categoryTotals[categoryName].amount += amount
      } else {
        categoryTotals[categoryName] = {
          amount,
          color: categoryColor,
          name: categoryName
        }
      }
    } else {
      // Handle case where category is undefined or not populated
      const unknownCategory = 'Unknown Category'
      if (categoryTotals[unknownCategory]) {
        categoryTotals[unknownCategory].amount += amount
      } else {
        categoryTotals[unknownCategory] = {
          amount,
          color: '#999999',
          name: unknownCategory
        }
      }
    }
  })

  return Object.values(categoryTotals).map(category => ({
    name: category.name,
    amount: category.amount,
    color: category.color,
    percentage: totalExpenses > 0 ? (category.amount / totalExpenses) * 100 : 0
  }))
}

export function calculateMonthlyData(transactions: Transaction[]): MonthlyDataItem[] {
  const monthlyTotals: Record<string, { income: number; expenses: number }> = {}

  transactions.forEach((transaction) => {
    const date = new Date(transaction.metadata.date)
    const monthKey = date.toISOString().substring(0, 7) // YYYY-MM format
    const amount = transaction.metadata.amount || 0
    const isIncome = transaction.metadata.type?.key === 'income'

    if (!monthlyTotals[monthKey]) {
      monthlyTotals[monthKey] = { income: 0, expenses: 0 }
    }

    if (isIncome) {
      monthlyTotals[monthKey].income += amount
    } else {
      monthlyTotals[monthKey].expenses += Math.abs(amount)
    }
  })

  return Object.entries(monthlyTotals)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
      }),
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses
    }))
}

// Utility to safely access nested object properties
export function safeGet<T>(obj: any, path: string, defaultValue: T): T {
  const keys = path.split('.')
  let result = obj
  
  for (const key of keys) {
    if (result == null || typeof result !== 'object') {
      return defaultValue
    }
    result = result[key]
  }
  
  return result !== undefined ? result : defaultValue
}

// Date utilities
export function isValidDate(date: string): boolean {
  return !isNaN(new Date(date).getTime())
}

export function formatDateForInput(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString().split('T')[0]
}

// Number utilities
export function parseAmount(value: string): number {
  const parsed = parseFloat(value.replace(/[^\d.-]/g, ''))
  return isNaN(parsed) ? 0 : parsed
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}