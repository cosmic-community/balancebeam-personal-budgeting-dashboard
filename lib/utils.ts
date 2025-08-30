import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Transaction, CategoryBreakdownItem, MonthlyDataItem } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Environment variable helpers with proper type safety
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

// Currency formatting
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

// Date formatting
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Generate URL-safe slug
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

// Calculate category breakdown for pie chart
export function calculateCategoryBreakdown(transactions: Transaction[]): CategoryBreakdownItem[] {
  if (!transactions || transactions.length === 0) return []

  const categoryTotals: Record<string, { amount: number; color: string }> = {}
  
  transactions.forEach(transaction => {
    const amount = Math.abs(transaction.metadata.amount || 0)
    
    let categoryName = 'Unknown Category'
    let categoryColor = '#999999'
    
    if (typeof transaction.metadata.category === 'object' && transaction.metadata.category?.metadata) {
      categoryName = transaction.metadata.category.metadata.name || 'Unknown Category'
      categoryColor = transaction.metadata.category.metadata.color || '#999999'
    }
    
    if (!categoryTotals[categoryName]) {
      categoryTotals[categoryName] = { amount: 0, color: categoryColor }
    }
    categoryTotals[categoryName].amount += amount
  })

  const total = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.amount, 0)
  
  if (total === 0) return []

  return Object.entries(categoryTotals).map(([name, data]) => ({
    name,
    amount: data.amount,
    color: data.color,
    percentage: Math.round((data.amount / total) * 100)
  }))
}

// Calculate monthly data for cash flow chart
export function calculateMonthlyData(transactions: Transaction[]): MonthlyDataItem[] {
  if (!transactions || transactions.length === 0) return []

  const monthlyTotals: Record<string, { income: number; expenses: number }> = {}
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.metadata.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const amount = Math.abs(transaction.metadata.amount || 0)
    
    if (!monthlyTotals[monthKey]) {
      monthlyTotals[monthKey] = { income: 0, expenses: 0 }
    }
    
    if (transaction.metadata.type?.key === 'income') {
      monthlyTotals[monthKey].income += amount
    } else {
      monthlyTotals[monthKey].expenses += amount
    }
  })

  return Object.entries(monthlyTotals)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month: new Date(`${month}-01`).toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      }),
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses
    }))
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Password strength validation
export function validatePassword(password: string): { isValid: boolean; message?: string } {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' }
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' }
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' }
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' }
  }
  
  return { isValid: true }
}