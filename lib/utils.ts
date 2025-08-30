import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Transaction } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDateForInput(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toISOString().split('T')[0]
}

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Environment variable getters with proper null checks
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
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
}

export function calculateCategoryBreakdown(transactions: Transaction[]) {
  const categoryTotals = new Map<string, { name: string; amount: number; color: string }>()
  
  transactions.forEach(transaction => {
    const categoryName = typeof transaction.metadata.category === 'object' && transaction.metadata.category?.metadata?.name
      ? transaction.metadata.category.metadata.name
      : 'Unknown'
    
    const categoryColor = typeof transaction.metadata.category === 'object' && transaction.metadata.category?.metadata?.color
      ? transaction.metadata.category.metadata.color
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
  })

  const totalAmount = Array.from(categoryTotals.values()).reduce((sum, cat) => sum + cat.amount, 0)
  
  return Array.from(categoryTotals.values()).map(category => ({
    ...category,
    percentage: totalAmount > 0 ? (category.amount / totalAmount) * 100 : 0
  }))
}

export function calculateMonthlyData(transactions: Transaction[]) {
  const monthlyTotals = new Map<string, { income: number; expenses: number }>()
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.metadata.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    
    if (!monthlyTotals.has(monthKey)) {
      monthlyTotals.set(monthKey, { income: 0, expenses: 0 })
    }
    
    const monthData = monthlyTotals.get(monthKey)!
    const amount = transaction.metadata.amount || 0
    
    if (transaction.metadata.type?.key === 'income') {
      monthData.income += amount
    } else {
      monthData.expenses += Math.abs(amount)
    }
  })

  return Array.from(monthlyTotals.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, data]) => ({
      month: monthKey,
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses
    }))
}