import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
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

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateForInput(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString().split('T')[0]
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
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

export function calculateCategoryBreakdown(transactions: Transaction[]): CategoryBreakdownItem[] {
  if (!transactions || transactions.length === 0) {
    return []
  }

  const categoryTotals: Record<string, { amount: number; color: string; name: string }> = {}
  let totalAmount = 0

  transactions.forEach((transaction) => {
    const amount = Math.abs(transaction.metadata.amount || 0)
    totalAmount += amount

    // Handle both populated and string category references
    let categoryId: string
    let categoryName: string
    let categoryColor: string

    if (typeof transaction.metadata.category === 'object' && transaction.metadata.category !== null) {
      categoryId = transaction.metadata.category.id
      categoryName = transaction.metadata.category.metadata?.name || 'Unknown Category'
      categoryColor = transaction.metadata.category.metadata?.color || '#999999'
    } else {
      categoryId = transaction.metadata.category as string || 'unknown'
      categoryName = 'Unknown Category'
      categoryColor = '#999999'
    }

    if (!categoryTotals[categoryId]) {
      categoryTotals[categoryId] = {
        amount: 0,
        color: categoryColor,
        name: categoryName
      }
    }
    categoryTotals[categoryId].amount += amount
  })

  return Object.entries(categoryTotals)
    .map(([_, data]) => ({
      name: data.name,
      amount: data.amount,
      color: data.color,
      percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0
    }))
    .sort((a, b) => b.amount - a.amount)
}

export function calculateMonthlyData(transactions: Transaction[]): MonthlyDataItem[] {
  if (!transactions || transactions.length === 0) {
    return []
  }

  const monthlyTotals: Record<string, { income: number; expenses: number }> = {}

  transactions.forEach((transaction) => {
    const date = new Date(transaction.metadata.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const amount = transaction.metadata.amount || 0

    if (!monthlyTotals[monthKey]) {
      monthlyTotals[monthKey] = { income: 0, expenses: 0 }
    }

    if (transaction.metadata.type?.key === 'income') {
      monthlyTotals[monthKey].income += Math.abs(amount)
    } else if (transaction.metadata.type?.key === 'expense') {
      monthlyTotals[monthKey].expenses += Math.abs(amount)
    }
  })

  return Object.entries(monthlyTotals)
    .map(([month, data]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      }),
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
}

export function getRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? 's' : ''} ago`
  } else {
    return formatDate(d)
  }
}