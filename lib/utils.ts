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

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateForInput(dateString: string): string {
  const date = new Date(dateString)
  return date.toISOString().split('T')[0]
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
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

export function calculateCategoryBreakdown(expenseTransactions: Transaction[]): CategoryBreakdownItem[] {
  const categoryTotals: Record<string, { amount: number; color: string; name: string }> = {}
  
  for (const transaction of expenseTransactions) {
    if (typeof transaction.metadata.category === 'object' && transaction.metadata.category?.metadata) {
      const categoryId = transaction.metadata.category.id
      const categoryName = transaction.metadata.category.metadata.name || 'Unknown'
      const categoryColor = transaction.metadata.category.metadata.color || '#999999'
      const amount = Math.abs(transaction.metadata.amount || 0)
      
      if (!categoryTotals[categoryId]) {
        categoryTotals[categoryId] = {
          amount: 0,
          color: categoryColor,
          name: categoryName
        }
      }
      
      categoryTotals[categoryId].amount += amount
    }
  }
  
  const totalExpenses = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.amount, 0)
  
  return Object.values(categoryTotals).map(category => ({
    name: category.name,
    amount: category.amount,
    color: category.color,
    percentage: totalExpenses > 0 ? (category.amount / totalExpenses) * 100 : 0
  }))
}

export function calculateMonthlyData(transactions: Transaction[]): MonthlyDataItem[] {
  const monthlyTotals: Record<string, { income: number; expenses: number }> = {}
  
  for (const transaction of transactions) {
    const date = new Date(transaction.metadata.date || transaction.created_at)
    const monthKey = date.toISOString().substring(0, 7) // YYYY-MM format
    
    if (!monthlyTotals[monthKey]) {
      monthlyTotals[monthKey] = { income: 0, expenses: 0 }
    }
    
    const amount = Math.abs(transaction.metadata.amount || 0)
    if (transaction.metadata.type?.key === 'income') {
      monthlyTotals[monthKey].income += amount
    } else {
      monthlyTotals[monthKey].expenses += amount
    }
  }
  
  // Get last 6 months
  const last6Months: MonthlyDataItem[] = []
  const now = new Date()
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = date.toISOString().substring(0, 7)
    const monthName = date.toLocaleDateString('en-US', { month: 'short' })
    
    const data = monthlyTotals[monthKey] || { income: 0, expenses: 0 }
    last6Months.push({
      month: monthName,
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses
    })
  }
  
  return last6Months
}