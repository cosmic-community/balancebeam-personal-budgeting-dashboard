import { type ClassValue, clsx } from 'clsx'
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

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date'
  }
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(dateObj)
}

export function formatDateForInput(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(dateObj.getTime())) {
    return new Date().toISOString().split('T')[0]
  }
  
  return dateObj.toISOString().split('T')[0]
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple dashes with single dash
    .replace(/^-+|-+$/g, '') // Remove leading and trailing dashes
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
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

  // Group expenses by category
  const categoryTotals = new Map<string, { name: string; amount: number; color: string }>()
  
  transactions.forEach(transaction => {
    if (transaction.metadata.type?.key !== 'expense') return
    
    const categoryName = typeof transaction.metadata.category === 'object' 
      ? transaction.metadata.category?.metadata?.name || 'Unknown'
      : 'Unknown'
    
    const categoryColor = typeof transaction.metadata.category === 'object'
      ? transaction.metadata.category?.metadata?.color || '#999999'
      : '#999999'
    
    const amount = Math.abs(transaction.metadata.amount || 0)
    
    if (categoryTotals.has(categoryName)) {
      const existing = categoryTotals.get(categoryName)!
      categoryTotals.set(categoryName, {
        ...existing,
        amount: existing.amount + amount
      })
    } else {
      categoryTotals.set(categoryName, {
        name: categoryName,
        amount,
        color: categoryColor
      })
    }
  })

  // Calculate total for percentages
  const total = Array.from(categoryTotals.values()).reduce((sum, cat) => sum + cat.amount, 0)
  
  if (total === 0) return []

  // Convert to array and add percentages
  return Array.from(categoryTotals.values()).map(category => ({
    name: category.name,
    amount: category.amount,
    color: category.color,
    percentage: Math.round((category.amount / total) * 100)
  })).sort((a, b) => b.amount - a.amount)
}

export function calculateMonthlyData(transactions: Transaction[]): MonthlyDataItem[] {
  if (!transactions || transactions.length === 0) {
    return []
  }

  // Group transactions by month
  const monthlyData = new Map<string, { income: number; expenses: number }>()
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.metadata.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    
    const amount = Math.abs(transaction.metadata.amount || 0)
    const isIncome = transaction.metadata.type?.key === 'income'
    
    if (monthlyData.has(monthKey)) {
      const existing = monthlyData.get(monthKey)!
      monthlyData.set(monthKey, {
        income: existing.income + (isIncome ? amount : 0),
        expenses: existing.expenses + (isIncome ? 0 : amount)
      })
    } else {
      monthlyData.set(monthKey, {
        income: isIncome ? amount : 0,
        expenses: isIncome ? 0 : amount
      })
    }
  })

  // Convert to array and add net calculation
  return Array.from(monthlyData.entries())
    .map(([monthKey, data]) => {
      const [year, month] = monthKey.split('-')
      const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      })
      
      return {
        month: monthName,
        income: data.income,
        expenses: data.expenses,
        net: data.income - data.expenses
      }
    })
    .sort((a, b) => {
      const dateA = new Date(a.month)
      const dateB = new Date(b.month)
      return dateA.getTime() - dateB.getTime()
    })
}