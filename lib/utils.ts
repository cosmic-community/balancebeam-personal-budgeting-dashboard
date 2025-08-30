import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Transaction, CategoryBreakdownItem, MonthlyDataItem, getTransactionCategoryName, getTransactionCategoryColor } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Environment variable helpers
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

// Format currency helper
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

// Format date for HTML input[type="date"] - YYYY-MM-DD format
export function formatDateForInput(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return new Date().toISOString().split('T')[0] || ''
  }
  
  const isoString = date.toISOString().split('T')[0]
  return isoString || ''
}

// Generate slug helper
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Format date for display
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

// Calculate percentage
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

// Calculate category breakdown for expenses
export function calculateCategoryBreakdown(expenseTransactions: Transaction[]): CategoryBreakdownItem[] {
  const categoryTotals: Record<string, { amount: number; color: string }> = {}

  expenseTransactions.forEach(transaction => {
    const categoryName = getTransactionCategoryName(transaction)
    const categoryColor = getTransactionCategoryColor(transaction)
    const amount = Math.abs(transaction.metadata.amount || 0)

    if (!categoryTotals[categoryName]) {
      categoryTotals[categoryName] = { amount: 0, color: categoryColor }
    }
    categoryTotals[categoryName].amount += amount
  })

  const totalExpenses = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.amount, 0)

  return Object.entries(categoryTotals).map(([name, data]) => ({
    name,
    amount: data.amount,
    color: data.color,
    percentage: calculatePercentage(data.amount, totalExpenses)
  }))
}

// Calculate monthly data for cash flow chart
export function calculateMonthlyData(transactions: Transaction[]): MonthlyDataItem[] {
  const monthlyTotals: Record<string, { income: number; expenses: number }> = {}

  transactions.forEach(transaction => {
    const date = new Date(transaction.metadata.date || transaction.created_at)
    const monthKey = date.toISOString().substring(0, 7) // YYYY-MM format
    const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

    if (!monthlyTotals[monthKey]) {
      monthlyTotals[monthKey] = { income: 0, expenses: 0 }
    }

    const amount = Math.abs(transaction.metadata.amount || 0)
    if (transaction.metadata.type?.key === 'income') {
      monthlyTotals[monthKey].income += amount
    } else {
      monthlyTotals[monthKey].expenses += amount
    }
  })

  return Object.entries(monthlyTotals)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([monthKey, data]) => {
      const date = new Date(monthKey + '-01')
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      
      return {
        month: monthName,
        income: data.income,
        expenses: data.expenses,
        net: data.income - data.expenses
      }
    })
}