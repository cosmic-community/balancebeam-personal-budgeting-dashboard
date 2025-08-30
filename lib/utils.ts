import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

// Email validation utility
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Password validation utility
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
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

// Format date for HTML input fields
export function formatDateForInput(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toISOString().split('T')[0]
}

// Dashboard calculation utilities
import { Transaction, CategoryBreakdownItem, MonthlyDataItem } from '@/types'

export function calculateCategoryBreakdown(transactions: Transaction[]): CategoryBreakdownItem[] {
  if (!transactions || transactions.length === 0) return []

  const categoryTotals = new Map<string, { amount: number; color: string; name: string }>()
  let totalExpenses = 0

  // Calculate totals by category
  transactions.forEach((transaction) => {
    const amount = Math.abs(transaction.metadata.amount || 0)
    totalExpenses += amount

    // Get category info safely
    let categoryName = 'Unknown'
    let categoryColor = '#999999'

    if (typeof transaction.metadata.category === 'object' && transaction.metadata.category?.metadata) {
      categoryName = transaction.metadata.category.metadata.name || 'Unknown'
      categoryColor = transaction.metadata.category.metadata.color || '#999999'
    }

    if (categoryTotals.has(categoryName)) {
      const existing = categoryTotals.get(categoryName)!
      categoryTotals.set(categoryName, {
        ...existing,
        amount: existing.amount + amount
      })
    } else {
      categoryTotals.set(categoryName, {
        amount,
        color: categoryColor,
        name: categoryName
      })
    }
  })

  // Convert to array and calculate percentages
  const breakdown: CategoryBreakdownItem[] = Array.from(categoryTotals.values()).map(category => ({
    name: category.name,
    amount: category.amount,
    color: category.color,
    percentage: totalExpenses > 0 ? Math.round((category.amount / totalExpenses) * 100) : 0
  }))

  // Sort by amount descending
  return breakdown.sort((a, b) => b.amount - a.amount)
}

export function calculateMonthlyData(transactions: Transaction[]): MonthlyDataItem[] {
  if (!transactions || transactions.length === 0) return []

  const monthlyTotals = new Map<string, { income: number; expenses: number }>()

  // Group transactions by month
  transactions.forEach((transaction) => {
    const date = new Date(transaction.metadata.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const amount = Math.abs(transaction.metadata.amount || 0)
    
    if (!monthlyTotals.has(monthKey)) {
      monthlyTotals.set(monthKey, { income: 0, expenses: 0 })
    }

    const monthly = monthlyTotals.get(monthKey)!
    
    if (transaction.metadata.type?.key === 'income') {
      monthly.income += amount
    } else {
      monthly.expenses += amount
    }
  })

  // Convert to array and format
  const monthlyData: MonthlyDataItem[] = Array.from(monthlyTotals.entries()).map(([monthKey, totals]) => {
    const [year, month] = monthKey.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

    return {
      month: monthName,
      income: totals.income,
      expenses: totals.expenses,
      net: totals.income - totals.expenses
    }
  })

  // Sort by date
  return monthlyData.sort((a, b) => {
    const dateA = new Date(a.month)
    const dateB = new Date(b.month)
    return dateA.getTime() - dateB.getTime()
  })
}

// Hash password utility with proper parameter validation
export async function hashPassword(password: string): Promise<string> {
  // Validate password parameter
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a valid string')
  }

  const bcrypt = await import('bcryptjs')
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

// Compare password utility with proper parameter validation
export async function comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
  // Validate parameters
  if (!plainPassword || typeof plainPassword !== 'string') {
    throw new Error('Plain password must be a valid string')
  }
  
  if (!hashedPassword || typeof hashedPassword !== 'string') {
    throw new Error('Hashed password must be a valid string')
  }

  const bcrypt = await import('bcryptjs')
  return bcrypt.compare(plainPassword, hashedPassword)
}