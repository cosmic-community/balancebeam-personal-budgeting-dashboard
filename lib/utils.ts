import { clsx, type ClassValue } from 'clsx'
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
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
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

export function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required')
  }
  return secret
}

// Calculate category breakdown for pie chart
export function calculateCategoryBreakdown(transactions: Transaction[]): CategoryBreakdownItem[] {
  if (!transactions || transactions.length === 0) {
    return []
  }

  // Group by category and sum amounts
  const categoryTotals: Record<string, { amount: number; color: string; name: string }> = {}
  
  transactions.forEach(transaction => {
    if (!transaction.metadata?.category || !transaction.metadata?.amount) {
      return // Skip invalid transactions
    }

    const category = transaction.metadata.category
    let categoryName: string
    let categoryColor: string

    // Handle both populated and string category references
    if (typeof category === 'object' && category !== null && 'metadata' in category) {
      categoryName = category.metadata?.name || 'Unknown Category'
      categoryColor = category.metadata?.color || '#999999'
    } else {
      categoryName = 'Unknown Category'
      categoryColor = '#999999'
    }

    if (!categoryTotals[categoryName]) {
      categoryTotals[categoryName] = {
        amount: 0,
        color: categoryColor,
        name: categoryName
      }
    }
    
    categoryTotals[categoryName].amount += Math.abs(transaction.metadata.amount)
  })

  // Calculate total for percentages
  const total = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.amount, 0)
  
  if (total === 0) {
    return []
  }

  // Convert to array with percentages
  return Object.values(categoryTotals).map(category => ({
    name: category.name,
    amount: category.amount,
    color: category.color,
    percentage: Math.round((category.amount / total) * 100)
  })).sort((a, b) => b.amount - a.amount)
}

// Calculate monthly data for cash flow chart
export function calculateMonthlyData(transactions: Transaction[]): MonthlyDataItem[] {
  if (!transactions || transactions.length === 0) {
    return []
  }

  // Group by month-year
  const monthlyTotals: Record<string, { income: number; expenses: number }> = {}
  
  transactions.forEach(transaction => {
    if (!transaction.metadata?.date || !transaction.metadata?.amount || !transaction.metadata?.type) {
      return // Skip invalid transactions
    }

    const date = new Date(transaction.metadata.date)
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
    
    if (!monthlyTotals[monthKey]) {
      monthlyTotals[monthKey] = { income: 0, expenses: 0 }
    }
    
    const amount = Math.abs(transaction.metadata.amount)
    
    if (transaction.metadata.type.key === 'income') {
      monthlyTotals[monthKey].income += amount
    } else if (transaction.metadata.type.key === 'expense') {
      monthlyTotals[monthKey].expenses += amount
    }
  })

  // Convert to array and sort by date
  return Object.entries(monthlyTotals)
    .map(([monthKey, totals]) => {
      const [year, month] = monthKey.split('-')
      const date = new Date(parseInt(year), parseInt(month) - 1, 1)
      
      return {
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        income: totals.income,
        expenses: totals.expenses,
        net: totals.income - totals.expenses
      }
    })
    .sort((a, b) => {
      // Sort by the actual date for proper chronological order
      const dateA = new Date(a.month)
      const dateB = new Date(b.month)
      return dateA.getTime() - dateB.getTime()
    })
}

// Safe property accessors for transaction data
export function getTransactionCategoryName(transaction: Transaction): string {
  if (!transaction.metadata?.category) {
    return 'Unknown Category'
  }

  const category = transaction.metadata.category
  if (typeof category === 'object' && category !== null && 'metadata' in category && category.metadata?.name) {
    return category.metadata.name
  }
  
  return 'Unknown Category'
}

export function getTransactionCategoryColor(transaction: Transaction): string {
  if (!transaction.metadata?.category) {
    return '#999999'
  }

  const category = transaction.metadata.category
  if (typeof category === 'object' && category !== null && 'metadata' in category && category.metadata?.color) {
    return category.metadata.color
  }
  
  return '#999999'
}

export function getTransactionAmount(transaction: Transaction): number {
  return transaction.metadata?.amount || 0
}

export function getTransactionType(transaction: Transaction): 'income' | 'expense' | 'unknown' {
  if (!transaction.metadata?.type?.key) {
    return 'unknown'
  }
  
  const type = transaction.metadata.type.key
  return type === 'income' || type === 'expense' ? type : 'unknown'
}

export function getTransactionDate(transaction: Transaction): string {
  return transaction.metadata?.date || new Date().toISOString().split('T')[0]
}

export function getTransactionDescription(transaction: Transaction): string {
  return transaction.metadata?.description || 'No description'
}