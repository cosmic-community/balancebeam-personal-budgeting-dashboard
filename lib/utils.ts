import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Transaction, CategoryBreakdownItem, MonthlyDataItem } from './types'

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

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Environment variable helpers with proper null checks
export function getCosmicBucketSlug(): string {
  const slug = process.env.COSMIC_BUCKET_SLUG
  if (!slug) {
    throw new Error('COSMIC_BUCKET_SLUG environment variable is required')
  }
  return slug
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

export function calculateCategoryBreakdown(transactions: Transaction[]): CategoryBreakdownItem[] {
  const categoryTotals = new Map<string, { amount: number; color: string; name: string }>()
  
  transactions.forEach(transaction => {
    if (!transaction.metadata.category) return
    
    let categoryName: string
    let categoryColor: string
    
    if (typeof transaction.metadata.category === 'object') {
      categoryName = transaction.metadata.category.metadata?.name || 'Unknown Category'
      categoryColor = transaction.metadata.category.metadata?.color || '#999999'
    } else {
      categoryName = 'Unknown Category'
      categoryColor = '#999999'
    }
    
    const existing = categoryTotals.get(categoryName)
    if (existing) {
      existing.amount += Math.abs(transaction.metadata.amount || 0)
    } else {
      categoryTotals.set(categoryName, {
        amount: Math.abs(transaction.metadata.amount || 0),
        color: categoryColor,
        name: categoryName
      })
    }
  })
  
  const total = Array.from(categoryTotals.values()).reduce((sum, item) => sum + item.amount, 0)
  
  return Array.from(categoryTotals.entries()).map(([name, data]) => ({
    name,
    amount: data.amount,
    color: data.color,
    percentage: total > 0 ? (data.amount / total) * 100 : 0
  }))
}

export function calculateMonthlyData(transactions: Transaction[]): MonthlyDataItem[] {
  const monthlyTotals = new Map<string, { income: number; expenses: number }>()
  
  transactions.forEach(transaction => {
    if (!transaction.metadata.date) return
    
    const date = new Date(transaction.metadata.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    
    const existing = monthlyTotals.get(monthKey)
    const amount = Math.abs(transaction.metadata.amount || 0)
    
    if (existing) {
      if (transaction.metadata.type?.key === 'income') {
        existing.income += amount
      } else {
        existing.expenses += amount
      }
    } else {
      monthlyTotals.set(monthKey, {
        income: transaction.metadata.type?.key === 'income' ? amount : 0,
        expenses: transaction.metadata.type?.key === 'expense' ? amount : 0
      })
    }
  })
  
  return Array.from(monthlyTotals.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([monthKey, data]) => {
      const date = new Date(monthKey + '-01')
      return {
        month: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        income: data.income,
        expenses: data.expenses,
        net: data.income - data.expenses
      }
    })
}

export function getInitials(name: string): string {
  if (!name) return '?'
  
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}