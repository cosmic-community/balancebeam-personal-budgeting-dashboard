import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Transaction, CategoryBreakdownItem, MonthlyDataItem } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Environment variable helpers with proper type safety
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

// Validation functions
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

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

// Utility functions
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

export function formatDateForInput(dateString: string): string {
  return new Date(dateString).toISOString().split('T')[0]
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
}

// Dashboard calculation functions
export function calculateCategoryBreakdown(expenseTransactions: Transaction[]): CategoryBreakdownItem[] {
  if (!expenseTransactions || expenseTransactions.length === 0) {
    return []
  }

  // Group by category
  const categoryTotals: Record<string, { name: string; amount: number; color: string }> = {}
  
  let totalExpenses = 0
  
  expenseTransactions.forEach(transaction => {
    const amount = Math.abs(transaction.metadata.amount || 0)
    totalExpenses += amount
    
    // Get category info safely
    let categoryName = 'Unknown Category'
    let categoryColor = '#999999'
    
    if (typeof transaction.metadata.category === 'object' && transaction.metadata.category?.metadata) {
      categoryName = transaction.metadata.category.metadata.name || 'Unknown Category'
      categoryColor = transaction.metadata.category.metadata.color || '#999999'
    }
    
    if (!categoryTotals[categoryName]) {
      categoryTotals[categoryName] = {
        name: categoryName,
        amount: 0,
        color: categoryColor
      }
    }
    
    categoryTotals[categoryName].amount += amount
  })
  
  // Convert to array and calculate percentages
  return Object.values(categoryTotals)
    .map(category => ({
      name: category.name,
      amount: category.amount,
      color: category.color,
      percentage: totalExpenses > 0 ? Math.round((category.amount / totalExpenses) * 100) : 0
    }))
    .sort((a, b) => b.amount - a.amount) // Sort by amount descending
}

export function calculateMonthlyData(transactions: Transaction[]): MonthlyDataItem[] {
  if (!transactions || transactions.length === 0) {
    return []
  }

  // Group by month
  const monthlyTotals: Record<string, { income: number; expenses: number }> = {}
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.metadata.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    
    if (!monthlyTotals[monthKey]) {
      monthlyTotals[monthKey] = { income: 0, expenses: 0 }
    }
    
    const amount = transaction.metadata.amount || 0
    
    if (transaction.metadata.type?.key === 'income') {
      monthlyTotals[monthKey].income += amount
    } else if (transaction.metadata.type?.key === 'expense') {
      monthlyTotals[monthKey].expenses += Math.abs(amount)
    }
  })
  
  // Convert to array and sort by month
  return Object.entries(monthlyTotals)
    .map(([monthKey, totals]) => {
      const [year, month] = monthKey.split('-')
      const date = new Date(parseInt(year), parseInt(month) - 1)
      const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
      
      return {
        month: monthName,
        income: totals.income,
        expenses: totals.expenses,
        net: totals.income - totals.expenses
      }
    })
    .sort((a, b) => {
      // Sort by year and month
      const dateA = new Date(a.month)
      const dateB = new Date(b.month)
      return dateA.getTime() - dateB.getTime()
    })
    .slice(-6) // Get last 6 months
}

// Auth helpers
export function hashPassword(password: string): Promise<string> {
  // This would typically use bcrypt or similar
  // For now, return a placeholder - this should be implemented with proper hashing
  return Promise.resolve(`hashed_${password}`)
}

export function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  // This would typically use bcrypt.compare or similar
  // For now, return a simple check - this should be implemented with proper comparison
  return Promise.resolve(`hashed_${password}` === hashedPassword)
}