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

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj)
}

export function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Environment variable getters with proper type safety
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

// JWT secret getter with proper type safety
export function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required')
  }
  return secret
}

// Calculate category breakdown for expenses
export function calculateCategoryBreakdown(expenseTransactions: Transaction[]): CategoryBreakdownItem[] {
  if (!expenseTransactions || expenseTransactions.length === 0) {
    return []
  }

  // Group expenses by category
  const categoryTotals = expenseTransactions.reduce((acc, transaction) => {
    if (!transaction.metadata.category || typeof transaction.metadata.category !== 'object') {
      return acc
    }

    const category = transaction.metadata.category
    const categoryName = category.metadata?.name || 'Unknown Category'
    const categoryColor = category.metadata?.color || '#999999'
    const amount = Math.abs(transaction.metadata.amount || 0)

    if (!acc[categoryName]) {
      acc[categoryName] = {
        name: categoryName,
        amount: 0,
        color: categoryColor,
        percentage: 0
      }
    }

    acc[categoryName].amount += amount
    return acc
  }, {} as Record<string, CategoryBreakdownItem>)

  // Calculate total expenses for percentage calculation
  const totalExpenses = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.amount, 0)

  // Calculate percentages and return sorted array
  return Object.values(categoryTotals)
    .map(item => ({
      ...item,
      percentage: totalExpenses > 0 ? Math.round((item.amount / totalExpenses) * 100) : 0
    }))
    .sort((a, b) => b.amount - a.amount)
}

// Calculate monthly data for charts
export function calculateMonthlyData(transactions: Transaction[]): MonthlyDataItem[] {
  if (!transactions || transactions.length === 0) {
    return []
  }

  // Group transactions by month
  const monthlyTotals = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.metadata.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    
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
      acc[monthKey].income += Math.abs(amount)
    } else if (transaction.metadata.type?.key === 'expense') {
      acc[monthKey].expenses += Math.abs(amount)
    }

    return acc
  }, {} as Record<string, MonthlyDataItem>)

  // Calculate net for each month and return sorted array
  return Object.values(monthlyTotals)
    .map(item => ({
      ...item,
      net: item.income - item.expenses
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
}