import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Transaction, CategoryBreakdownItem, MonthlyDataItem } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Environment variable helpers with proper undefined handling
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

// Utility functions
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function calculateCategoryBreakdown(expenseTransactions: Transaction[]): CategoryBreakdownItem[] {
  if (!expenseTransactions || expenseTransactions.length === 0) {
    return []
  }

  const categoryTotals = new Map<string, { amount: number; color: string; name: string }>()
  let totalExpenses = 0

  expenseTransactions.forEach((transaction) => {
    const amount = Math.abs(transaction.metadata.amount || 0)
    totalExpenses += amount

    // Handle both populated and non-populated category objects
    let categoryName = 'Unknown Category'
    let categoryColor = '#999999'

    if (typeof transaction.metadata.category === 'object' && transaction.metadata.category !== null) {
      categoryName = transaction.metadata.category.metadata?.name || transaction.metadata.category.title || 'Unknown Category'
      categoryColor = transaction.metadata.category.metadata?.color || '#999999'
    }

    if (categoryTotals.has(categoryName)) {
      const existing = categoryTotals.get(categoryName)!
      existing.amount += amount
    } else {
      categoryTotals.set(categoryName, {
        amount,
        color: categoryColor,
        name: categoryName
      })
    }
  })

  return Array.from(categoryTotals.entries()).map(([name, data]) => ({
    name: data.name,
    amount: data.amount,
    color: data.color,
    percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0
  }))
}

export function calculateMonthlyData(transactions: Transaction[]): MonthlyDataItem[] {
  if (!transactions || transactions.length === 0) {
    return []
  }

  const monthlyTotals = new Map<string, { income: number; expenses: number }>()

  transactions.forEach((transaction) => {
    const date = new Date(transaction.metadata.date)
    const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    const amount = Math.abs(transaction.metadata.amount || 0)
    const isIncome = transaction.metadata.type?.key === 'income'

    if (!monthlyTotals.has(monthKey)) {
      monthlyTotals.set(monthKey, { income: 0, expenses: 0 })
    }

    const monthly = monthlyTotals.get(monthKey)!
    if (isIncome) {
      monthly.income += amount
    } else {
      monthly.expenses += amount
    }
  })

  return Array.from(monthlyTotals.entries())
    .map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses
    }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
}