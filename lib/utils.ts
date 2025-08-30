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
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateForInput(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toISOString().split('T')[0]
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

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim()
}

export function calculateCategoryBreakdown(expenseTransactions: Transaction[]): CategoryBreakdownItem[] {
  const categoryTotals = new Map<string, { amount: number; color: string; name: string }>()

  // Group transactions by category
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

    const existing = categoryTotals.get(categoryId)
    if (existing) {
      existing.amount += amount
    } else {
      categoryTotals.set(categoryId, {
        amount,
        name: categoryName,
        color: categoryColor
      })
    }
  })

  // Convert to array and calculate percentages
  const totalAmount = Array.from(categoryTotals.values()).reduce((sum, cat) => sum + cat.amount, 0)
  
  return Array.from(categoryTotals.entries()).map(([_, data]) => ({
    name: data.name,
    amount: data.amount,
    color: data.color,
    percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0
  })).sort((a, b) => b.amount - a.amount)
}

export function calculateMonthlyData(transactions: Transaction[]): MonthlyDataItem[] {
  const monthlyTotals = new Map<string, { income: number; expenses: number }>()

  // Group transactions by month
  transactions.forEach(transaction => {
    const date = new Date(transaction.metadata.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const amount = transaction.metadata.amount || 0
    
    const existing = monthlyTotals.get(monthKey) || { income: 0, expenses: 0 }
    
    if (transaction.metadata.type?.key === 'income') {
      existing.income += Math.abs(amount)
    } else {
      existing.expenses += Math.abs(amount)
    }
    
    monthlyTotals.set(monthKey, existing)
  })

  // Convert to array and sort by month
  return Array.from(monthlyTotals.entries())
    .map(([monthKey, data]) => {
      const [year, month] = monthKey.split('-')
      const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      
      return {
        month: monthName,
        income: data.income,
        expenses: data.expenses,
        net: data.income - data.expenses
      }
    })
    .sort((a, b) => {
      // Sort by year-month for chronological order
      const [aMonth, aYear] = a.month.split(' ')
      const [bMonth, bYear] = b.month.split(' ')
      const aDate = new Date(`${aMonth} 1, ${aYear}`)
      const bDate = new Date(`${bMonth} 1, ${bYear}`)
      return aDate.getTime() - bDate.getTime()
    })
}