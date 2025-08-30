import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Transaction, CategoryBreakdownItem, MonthlyDataItem } from '@/types'

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

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function calculateCategoryBreakdown(transactions: Transaction[]): CategoryBreakdownItem[] {
  const categoryTotals = new Map<string, { amount: number; color: string; name: string }>()
  
  transactions.forEach(transaction => {
    if (typeof transaction.metadata.category === 'object' && transaction.metadata.category) {
      const categoryId = transaction.metadata.category.id
      const categoryName = transaction.metadata.category.metadata?.name || 'Unknown'
      const categoryColor = transaction.metadata.category.metadata?.color || '#999999'
      const amount = Math.abs(transaction.metadata.amount || 0)
      
      const existing = categoryTotals.get(categoryId)
      if (existing) {
        existing.amount += amount
      } else {
        categoryTotals.set(categoryId, {
          amount,
          color: categoryColor,
          name: categoryName
        })
      }
    }
  })

  const total = Array.from(categoryTotals.values()).reduce((sum, cat) => sum + cat.amount, 0)
  
  return Array.from(categoryTotals.entries()).map(([id, data]) => ({
    name: data.name,
    amount: data.amount,
    color: data.color,
    percentage: total > 0 ? (data.amount / total) * 100 : 0
  }))
}

export function calculateMonthlyData(transactions: Transaction[]): MonthlyDataItem[] {
  const monthlyTotals = new Map<string, { income: number; expenses: number }>()
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.metadata.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
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
    .map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses
    }))
}