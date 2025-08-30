import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
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

export function formatDateForInput(date: Date | string): string {
  const d = new Date(date)
  return d.toISOString().split('T')[0]
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

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function calculateCategoryBreakdown(expenseTransactions: Transaction[]): CategoryBreakdownItem[] {
  if (!expenseTransactions || expenseTransactions.length === 0) {
    return []
  }

  const categoryTotals: Record<string, { amount: number; color: string; name: string }> = {}

  expenseTransactions.forEach(transaction => {
    const amount = Math.abs(transaction.metadata.amount || 0)
    
    // Handle both populated and string category references
    let categoryId: string
    let categoryName: string
    let categoryColor: string

    if (typeof transaction.metadata.category === 'object' && transaction.metadata.category) {
      categoryId = transaction.metadata.category.id
      categoryName = transaction.metadata.category.metadata?.name || 'Unknown Category'
      categoryColor = transaction.metadata.category.metadata?.color || '#999999'
    } else {
      categoryId = transaction.metadata.category as string || 'unknown'
      categoryName = 'Unknown Category'
      categoryColor = '#999999'
    }

    if (categoryTotals[categoryId]) {
      categoryTotals[categoryId].amount += amount
    } else {
      categoryTotals[categoryId] = {
        amount,
        color: categoryColor,
        name: categoryName
      }
    }
  })

  const totalExpenses = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.amount, 0)

  return Object.values(categoryTotals).map(category => ({
    name: category.name,
    amount: category.amount,
    color: category.color,
    percentage: totalExpenses > 0 ? (category.amount / totalExpenses) * 100 : 0
  }))
}

export function calculateMonthlyData(transactions: Transaction[]): MonthlyDataItem[] {
  if (!transactions || transactions.length === 0) {
    return []
  }

  const monthlyTotals: Record<string, { income: number; expenses: number }> = {}

  transactions.forEach(transaction => {
    const date = new Date(transaction.metadata.date || Date.now())
    const monthKey = date.toISOString().slice(0, 7) // YYYY-MM format
    const amount = transaction.metadata.amount || 0

    if (!monthlyTotals[monthKey]) {
      monthlyTotals[monthKey] = { income: 0, expenses: 0 }
    }

    if (transaction.metadata.type?.key === 'income') {
      monthlyTotals[monthKey].income += Math.abs(amount)
    } else {
      monthlyTotals[monthKey].expenses += Math.abs(amount)
    }
  })

  return Object.entries(monthlyTotals)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses
    }))
}