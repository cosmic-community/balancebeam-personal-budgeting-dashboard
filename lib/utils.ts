import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
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

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function getCosmicBucketSlug(): string {
  const slug = process.env.COSMIC_BUCKET_SLUG
  if (!slug) {
    throw new Error('COSMIC_BUCKET_SLUG environment variable is required')
  }
  return slug
}

export function getCosmicReadKey(): string {
  const key = process.env.COSMIC_READ_KEY || ''
  return key
}

export function getCosmicWriteKey(): string {
  const key = process.env.COSMIC_WRITE_KEY
  if (!key) {
    throw new Error('COSMIC_WRITE_KEY environment variable is required')
  }
  return key
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function calculateCategoryBreakdown(transactions: Transaction[]): CategoryBreakdownItem[] {
  const categoryTotals = new Map<string, { amount: number; color: string; name: string }>()
  
  transactions.forEach(transaction => {
    const amount = Math.abs(transaction.metadata.amount || 0)
    
    // Safe access to category data
    let categoryName = 'Unknown Category'
    let categoryColor = '#999999'
    
    if (typeof transaction.metadata.category === 'object' && transaction.metadata.category) {
      categoryName = transaction.metadata.category.metadata?.name || 'Unknown Category'
      categoryColor = transaction.metadata.category.metadata?.color || '#999999'
    }
    
    const existing = categoryTotals.get(categoryName) || { amount: 0, color: categoryColor, name: categoryName }
    existing.amount += amount
    categoryTotals.set(categoryName, existing)
  })
  
  const total = Array.from(categoryTotals.values()).reduce((sum, cat) => sum + cat.amount, 0)
  
  return Array.from(categoryTotals.entries()).map(([name, data]) => ({
    name: data.name,
    amount: data.amount,
    color: data.color,
    percentage: total > 0 ? (data.amount / total) * 100 : 0
  }))
}

export function calculateMonthlyData(transactions: Transaction[]): MonthlyDataItem[] {
  const monthlyTotals = new Map<string, { income: number; expenses: number }>()
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.metadata.date || new Date())
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const amount = Math.abs(transaction.metadata.amount || 0)
    
    const existing = monthlyTotals.get(monthKey) || { income: 0, expenses: 0 }
    
    if (transaction.metadata.type?.key === 'income') {
      existing.income += amount
    } else if (transaction.metadata.type?.key === 'expense') {
      existing.expenses += amount
    }
    
    monthlyTotals.set(monthKey, existing)
  })
  
  // Convert to array and sort by month
  const sortedData = Array.from(monthlyTotals.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, data]) => {
      const [year, month] = monthKey.split('-')
      const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { 
        month: 'short' 
      })
      
      // Handle potentially undefined monthData with proper null checks
      const monthData = monthlyTotals.get(monthKey)
      if (!monthData) {
        return {
          month: monthName,
          income: 0,
          expenses: 0,
          net: 0
        }
      }
      
      const income = monthData.income || 0
      const expenses = monthData.expenses || 0
      const net = income - expenses
      
      return {
        month: monthName,
        income,
        expenses,
        net
      }
    })
  
  return sortedData
}