import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwindcss-merge'
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
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(dateObj)
}

export function formatDateForInput(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function generateSlug(text: string): string {
  const bucketSlug = process.env.COSMIC_BUCKET_SLUG
  if (!bucketSlug) {
    throw new Error('COSMIC_BUCKET_SLUG environment variable is required')
  }
  
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
    .substring(0, 50)
}

// Email validation function
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Password validation function
export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function calculateCategoryBreakdown(transactions: Transaction[]): CategoryBreakdownItem[] {
  const categoryTotals = new Map<string, { amount: number; color: string; name: string }>()
  
  transactions.forEach(transaction => {
    if (typeof transaction.metadata.category === 'object' && transaction.metadata.category?.metadata) {
      const categoryName = transaction.metadata.category.metadata.name || 'Unknown'
      const categoryColor = transaction.metadata.category.metadata.color || '#999999'
      const amount = Math.abs(transaction.metadata.amount || 0)
      
      const existing = categoryTotals.get(categoryName)
      if (existing) {
        existing.amount += amount
      } else {
        categoryTotals.set(categoryName, {
          amount,
          color: categoryColor,
          name: categoryName
        })
      }
    }
  })
  
  const totalAmount = Array.from(categoryTotals.values()).reduce((sum, cat) => sum + cat.amount, 0)
  
  return Array.from(categoryTotals.entries()).map(([name, data]) => ({
    name,
    amount: data.amount,
    color: data.color,
    percentage: totalAmount > 0 ? Math.round((data.amount / totalAmount) * 100) : 0
  })).sort((a, b) => b.amount - a.amount)
}

export function calculateMonthlyData(transactions: Transaction[]): MonthlyDataItem[] {
  const monthlyTotals = new Map<string, { income: number; expenses: number }>()
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.metadata.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const amount = transaction.metadata.amount || 0
    
    const existing = monthlyTotals.get(monthKey)
    if (existing) {
      if (transaction.metadata.type?.key === 'income') {
        existing.income += Math.abs(amount)
      } else {
        existing.expenses += Math.abs(amount)
      }
    } else {
      monthlyTotals.set(monthKey, {
        income: transaction.metadata.type?.key === 'income' ? Math.abs(amount) : 0,
        expenses: transaction.metadata.type?.key === 'expense' ? Math.abs(amount) : 0
      })
    }
  })
  
  return Array.from(monthlyTotals.entries())
    .map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
}