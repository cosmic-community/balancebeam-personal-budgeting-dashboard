import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { CategoryBreakdownItem, MonthlyDataItem, Transaction } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateForInput(dateString: string): string {
  const date = new Date(dateString)
  return date.toISOString().split('T')[0]
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function calculateCategoryBreakdown(transactions: Transaction[]): CategoryBreakdownItem[] {
  const categoryTotals = new Map<string, { amount: number; color: string; name: string }>()
  
  transactions.forEach(transaction => {
    const categoryName = typeof transaction.metadata.category === 'object' 
      ? transaction.metadata.category?.metadata?.name || 'Unknown'
      : 'Unknown'
    
    const categoryColor = typeof transaction.metadata.category === 'object'
      ? transaction.metadata.category?.metadata?.color || '#999999'
      : '#999999'
    
    const amount = Math.abs(transaction.metadata.amount || 0)
    
    if (categoryTotals.has(categoryName)) {
      const existing = categoryTotals.get(categoryName)!
      existing.amount += amount
    } else {
      categoryTotals.set(categoryName, { amount, color: categoryColor, name: categoryName })
    }
  })
  
  const totalAmount = Array.from(categoryTotals.values()).reduce((sum, cat) => sum + cat.amount, 0)
  
  return Array.from(categoryTotals.entries()).map(([name, data]) => ({
    name,
    amount: data.amount,
    color: data.color,
    percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0
  }))
}

export function calculateMonthlyData(transactions: Transaction[]): MonthlyDataItem[] {
  const monthlyTotals = new Map<string, { income: number; expenses: number }>()
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.metadata.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const amount = Math.abs(transaction.metadata.amount || 0)
    const isIncome = transaction.metadata.type?.key === 'income'
    
    if (!monthlyTotals.has(monthKey)) {
      monthlyTotals.set(monthKey, { income: 0, expenses: 0 })
    }
    
    const monthData = monthlyTotals.get(monthKey)!
    if (isIncome) {
      monthData.income += amount
    } else {
      monthData.expenses += amount
    }
  })
  
  return Array.from(monthlyTotals.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses
    }))
}

// Environment variable getters with proper error handling
export function getCosmicBucketSlug(): string {
  const bucketSlug = process.env.COSMIC_BUCKET_SLUG
  if (!bucketSlug) {
    throw new Error('COSMIC_BUCKET_SLUG environment variable is not set')
  }
  return bucketSlug
}

export function getCosmicReadKey(): string {
  const readKey = process.env.COSMIC_READ_KEY
  if (!readKey) {
    throw new Error('COSMIC_READ_KEY environment variable is not set')
  }
  return readKey
}

export function getCosmicWriteKey(): string {
  const writeKey = process.env.COSMIC_WRITE_KEY
  if (!writeKey) {
    throw new Error('COSMIC_WRITE_KEY environment variable is not set')
  }
  return writeKey
}