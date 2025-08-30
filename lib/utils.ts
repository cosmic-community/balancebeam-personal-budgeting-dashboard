import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwindcss-merge'
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
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toISOString().split('T')[0]
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
    throw new Error('COSMIC_BUCKET_SLUG environment variable is not set')
  }
  return slug
}

export function getCosmicReadKey(): string {
  const key = process.env.COSMIC_READ_KEY
  if (!key) {
    throw new Error('COSMIC_READ_KEY environment variable is not set')
  }
  return key
}

export function getCosmicWriteKey(): string {
  const key = process.env.COSMIC_WRITE_KEY
  if (!key) {
    throw new Error('COSMIC_WRITE_KEY environment variable is not set')
  }
  return key
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function calculateCategoryBreakdown(transactions: Transaction[]): CategoryBreakdownItem[] {
  const categoryTotals: Record<string, { amount: number; color: string; name: string }> = {}
  
  transactions.forEach(transaction => {
    if (transaction.metadata.type?.key !== 'expense') return
    
    const categoryId = typeof transaction.metadata.category === 'object' 
      ? transaction.metadata.category.id 
      : transaction.metadata.category || 'unknown'
    
    const categoryName = typeof transaction.metadata.category === 'object' 
      ? transaction.metadata.category.metadata?.name || 'Unknown'
      : 'Unknown'
    
    const categoryColor = typeof transaction.metadata.category === 'object' 
      ? transaction.metadata.category.metadata?.color || '#999999'
      : '#999999'
    
    const amount = Math.abs(transaction.metadata.amount || 0)
    
    if (!categoryTotals[categoryId]) {
      categoryTotals[categoryId] = {
        amount: 0,
        color: categoryColor,
        name: categoryName
      }
    }
    
    categoryTotals[categoryId].amount += amount
  })
  
  const total = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.amount, 0)
  
  return Object.values(categoryTotals).map(category => ({
    name: category.name,
    amount: category.amount,
    color: category.color,
    percentage: total > 0 ? (category.amount / total) * 100 : 0
  }))
}

export function calculateMonthlyData(transactions: Transaction[]): MonthlyDataItem[] {
  const monthlyTotals: Record<string, { income: number; expenses: number }> = {}
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.metadata.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    
    if (!monthlyTotals[monthKey]) {
      monthlyTotals[monthKey] = { income: 0, expenses: 0 }
    }
    
    const amount = transaction.metadata.amount || 0
    if (transaction.metadata.type?.key === 'income') {
      monthlyTotals[monthKey].income += amount
    } else {
      monthlyTotals[monthKey].expenses += Math.abs(amount)
    }
  })
  
  return Object.entries(monthlyTotals)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, data]) => ({
      month: new Date(monthKey + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses
    }))
}