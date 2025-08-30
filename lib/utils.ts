import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Transaction, CategoryBreakdownItem, MonthlyDataItem } from '../types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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

export function formatDateForInput(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toISOString().split('T')[0]
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function calculateCategoryBreakdown(expenseTransactions: Transaction[]): CategoryBreakdownItem[] {
  const categoryTotals: { [key: string]: { amount: number; color: string; name: string } } = {}
  const totalExpenses = expenseTransactions.reduce((sum, transaction) => sum + Math.abs(transaction.metadata.amount || 0), 0)

  expenseTransactions.forEach((transaction) => {
    const categoryId = typeof transaction.metadata.category === 'object' 
      ? transaction.metadata.category?.id || 'unknown'
      : transaction.metadata.category || 'unknown'
    
    const categoryName = typeof transaction.metadata.category === 'object'
      ? transaction.metadata.category?.metadata?.name || 'Unknown Category'
      : 'Unknown Category'
    
    const categoryColor = typeof transaction.metadata.category === 'object'
      ? transaction.metadata.category?.metadata?.color || '#999999'
      : '#999999'

    if (!categoryTotals[categoryId]) {
      categoryTotals[categoryId] = {
        amount: 0,
        color: categoryColor,
        name: categoryName
      }
    }

    categoryTotals[categoryId].amount += Math.abs(transaction.metadata.amount || 0)
  })

  return Object.entries(categoryTotals).map(([_, data]) => ({
    name: data.name,
    amount: data.amount,
    color: data.color,
    percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0
  }))
}

export function calculateMonthlyData(transactions: Transaction[]): MonthlyDataItem[] {
  const monthlyTotals: { [key: string]: { income: number; expenses: number } } = {}

  transactions.forEach((transaction) => {
    const date = new Date(transaction.metadata.date || transaction.created_at)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    
    if (!monthlyTotals[monthKey]) {
      monthlyTotals[monthKey] = { income: 0, expenses: 0 }
    }

    const amount = Math.abs(transaction.metadata.amount || 0)
    if (transaction.metadata.type?.key === 'income') {
      monthlyTotals[monthKey].income += amount
    } else if (transaction.metadata.type?.key === 'expense') {
      monthlyTotals[monthKey].expenses += amount
    }
  })

  return Object.entries(monthlyTotals)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, data]) => {
      const [year, month] = monthKey.split('-')
      // Handle potential undefined values with fallback
      const yearNum = year ? parseInt(year) : new Date().getFullYear()
      const monthNum = month ? parseInt(month) - 1 : 0
      const monthName = new Date(yearNum, monthNum).toLocaleDateString('en-US', { month: 'short' })
      
      return {
        month: monthName,
        income: data.income,
        expenses: data.expenses,
        net: data.income - data.expenses
      }
    })
}