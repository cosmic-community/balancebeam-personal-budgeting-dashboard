import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Transaction, CategoryBreakdownItem, MonthlyDataItem } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Add the missing formatDateForInput function
export function formatDateForInput(dateString: string): string {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getTransactionAmount(transaction: Transaction): number {
  return transaction.metadata.amount || 0
}

export function getTransactionType(transaction: Transaction): 'income' | 'expense' {
  return transaction.metadata.type?.key || 'expense'
}

export function getTransactionDate(transaction: Transaction): string {
  return transaction.metadata.date || new Date().toISOString().split('T')[0]
}

export function getTransactionCategoryName(transaction: Transaction): string {
  if (typeof transaction.metadata.category === 'object' && transaction.metadata.category?.metadata?.name) {
    return transaction.metadata.category.metadata.name
  }
  return 'Unknown Category'
}

export function getTransactionCategoryColor(transaction: Transaction): string {
  if (typeof transaction.metadata.category === 'object' && transaction.metadata.category?.metadata?.color) {
    return transaction.metadata.category.metadata.color
  }
  return '#999999'
}

// Fixed TypeScript error - properly handle undefined environment variables
export function getCosmicBucketSlug(): string {
  const bucketSlug = process.env.COSMIC_BUCKET_SLUG
  if (!bucketSlug) {
    throw new Error('COSMIC_BUCKET_SLUG environment variable is required')
  }
  return bucketSlug as string
}

export function getCosmicReadKey(): string {
  const readKey = process.env.COSMIC_READ_KEY
  if (!readKey) {
    throw new Error('COSMIC_READ_KEY environment variable is required')
  }
  return readKey as string
}

export function getCosmicWriteKey(): string {
  const writeKey = process.env.COSMIC_WRITE_KEY
  if (!writeKey) {
    throw new Error('COSMIC_WRITE_KEY environment variable is required')
  }
  return writeKey as string
}

// Add missing calculateCategoryBreakdown function
export function calculateCategoryBreakdown(transactions: Transaction[]): CategoryBreakdownItem[] {
  const categoryTotals = new Map<string, { amount: number; color: string; name: string }>()

  // Calculate total amount per category
  transactions.forEach(transaction => {
    const categoryName = getTransactionCategoryName(transaction)
    const categoryColor = getTransactionCategoryColor(transaction)
    const amount = Math.abs(getTransactionAmount(transaction)) // Use absolute value for expenses
    
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

  // Calculate total for percentage calculation
  const total = Array.from(categoryTotals.values()).reduce((sum, category) => sum + category.amount, 0)

  // Convert to CategoryBreakdownItem array
  const breakdown: CategoryBreakdownItem[] = Array.from(categoryTotals.entries()).map(([name, data]) => ({
    name: data.name,
    amount: data.amount,
    color: data.color,
    percentage: total > 0 ? (data.amount / total) * 100 : 0
  }))

  // Sort by amount descending
  return breakdown.sort((a, b) => b.amount - a.amount)
}

// Add calculateMonthlyData function for completeness
export function calculateMonthlyData(transactions: Transaction[]): MonthlyDataItem[] {
  const monthlyTotals = new Map<string, { income: number; expenses: number }>()

  transactions.forEach(transaction => {
    const date = new Date(getTransactionDate(transaction))
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const amount = getTransactionAmount(transaction)
    const type = getTransactionType(transaction)
    
    if (!monthlyTotals.has(monthKey)) {
      monthlyTotals.set(monthKey, { income: 0, expenses: 0 })
    }
    
    const monthData = monthlyTotals.get(monthKey)!
    if (type === 'income') {
      monthData.income += amount
    } else {
      monthData.expenses += Math.abs(amount)
    }
  })

  // Convert to MonthlyDataItem array and sort by month
  const monthlyData: MonthlyDataItem[] = Array.from(monthlyTotals.entries())
    .map(([month, data]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses
    }))
    .sort((a, b) => {
      // Sort by date
      const dateA = new Date(a.month + ' 01')
      const dateB = new Date(b.month + ' 01')
      return dateA.getTime() - dateB.getTime()
    })

  return monthlyData
}