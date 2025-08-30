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
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
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
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
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

export function calculateCategoryBreakdown(expenses: Transaction[]): CategoryBreakdownItem[] {
  if (!expenses || expenses.length === 0) {
    return []
  }

  // Group expenses by category
  const categoryTotals = expenses.reduce((acc, transaction) => {
    const categoryId = typeof transaction.metadata.category === 'object' 
      ? transaction.metadata.category?.id || 'unknown'
      : transaction.metadata.category || 'unknown'
    
    const categoryName = typeof transaction.metadata.category === 'object'
      ? transaction.metadata.category?.metadata?.name || 'Unknown'
      : 'Unknown'
    
    const categoryColor = typeof transaction.metadata.category === 'object'
      ? transaction.metadata.category?.metadata?.color || '#999999'
      : '#999999'
    
    const amount = Math.abs(transaction.metadata.amount || 0)
    
    if (!acc[categoryId]) {
      acc[categoryId] = {
        name: categoryName,
        amount: 0,
        color: categoryColor,
        percentage: 0
      }
    }
    
    acc[categoryId].amount += amount
    return acc
  }, {} as Record<string, CategoryBreakdownItem>)

  // Calculate total and percentages
  const total = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.amount, 0)
  
  return Object.values(categoryTotals).map(category => ({
    ...category,
    percentage: total > 0 ? (category.amount / total) * 100 : 0
  }))
}

export function calculateMonthlyData(transactions: Transaction[]): MonthlyDataItem[] {
  if (!transactions || transactions.length === 0) {
    return []
  }

  // Group transactions by month
  const monthlyTotals = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.metadata.date)
    const monthKey = date.toISOString().slice(0, 7) // YYYY-MM format
    const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        month: monthName,
        income: 0,
        expenses: 0,
        net: 0
      }
    }
    
    const amount = transaction.metadata.amount || 0
    
    if (transaction.metadata.type?.key === 'income') {
      acc[monthKey].income += amount
    } else {
      acc[monthKey].expenses += Math.abs(amount)
    }
    
    return acc
  }, {} as Record<string, MonthlyDataItem>)

  // Calculate net balance and sort by month
  return Object.values(monthlyTotals)
    .map(month => ({
      ...month,
      net: month.income - month.expenses
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
}