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
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatDateForInput(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toISOString().split('T')[0]
}

// Fixed: Add proper null checks for environment variables
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

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function calculateCategoryBreakdown(expenses: Transaction[]): CategoryBreakdownItem[] {
  const categoryTotals: Record<string, { amount: number; color: string; name: string }> = {}
  
  expenses.forEach(transaction => {
    const categoryName = typeof transaction.metadata.category === 'object' 
      ? transaction.metadata.category?.metadata?.name || 'Unknown'
      : 'Unknown'
    const categoryColor = typeof transaction.metadata.category === 'object'
      ? transaction.metadata.category?.metadata?.color || '#999999'
      : '#999999'
    const amount = Math.abs(transaction.metadata.amount || 0)
    
    if (categoryTotals[categoryName]) {
      categoryTotals[categoryName].amount += amount
    } else {
      categoryTotals[categoryName] = {
        amount,
        color: categoryColor,
        name: categoryName
      }
    }
  })
  
  const totalExpenses = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.amount, 0)
  
  return Object.entries(categoryTotals).map(([name, data]) => ({
    name,
    amount: data.amount,
    color: data.color,
    percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0
  }))
}

export function calculateMonthlyData(transactions: Transaction[]): MonthlyDataItem[] {
  const monthlyTotals: Record<string, { income: number; expenses: number }> = {}
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.metadata.date || transaction.created_at)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    
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
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, data]) => {
      const [year, month] = monthKey.split('-')
      const monthName = new Date(parseInt(year), parseInt(month) - 1, 1)
        .toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      
      return {
        month: monthName,
        income: data.income,
        expenses: data.expenses,
        net: data.income - data.expenses
      }
    })
    .slice(-6) // Last 6 months
}