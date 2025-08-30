import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Transaction, CategoryBreakdownItem, MonthlyDataItem } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Email validation function
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Password validation function
export function validatePassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
  return passwordRegex.test(password)
}

// Format date function with proper error handling
export function formatDate(dateString: string): string {
  if (!dateString) return 'No date'
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Invalid date'
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date)
  } catch (error) {
    return 'Invalid date'
  }
}

// Currency formatting function
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

// Generate slug function
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

// Calculate category breakdown with proper null checks
export function calculateCategoryBreakdown(transactions: Transaction[]): CategoryBreakdownItem[] {
  if (!transactions || transactions.length === 0) return []

  const categoryTotals: Record<string, { amount: number; color: string; name: string }> = {}
  let totalExpenses = 0

  transactions.forEach(transaction => {
    if (!transaction.metadata.category || typeof transaction.metadata.category !== 'object') return
    
    const category = transaction.metadata.category
    const amount = Math.abs(transaction.metadata.amount || 0)
    const categoryId = category.id || 'unknown'
    const categoryName = category.metadata?.name || 'Unknown Category'
    const categoryColor = category.metadata?.color || '#6B7280'

    if (!categoryTotals[categoryId]) {
      categoryTotals[categoryId] = {
        amount: 0,
        color: categoryColor,
        name: categoryName
      }
    }

    categoryTotals[categoryId].amount += amount
    totalExpenses += amount
  })

  return Object.entries(categoryTotals)
    .map(([_, data]) => ({
      name: data.name,
      amount: data.amount,
      color: data.color,
      percentage: totalExpenses > 0 ? Math.round((data.amount / totalExpenses) * 100) : 0
    }))
    .sort((a, b) => b.amount - a.amount)
}

// Calculate monthly data with proper null checks
export function calculateMonthlyData(transactions: Transaction[]): MonthlyDataItem[] {
  if (!transactions || transactions.length === 0) return []

  const monthlyTotals: Record<string, { income: number; expenses: number }> = {}

  transactions.forEach(transaction => {
    if (!transaction.metadata.date) return

    const date = new Date(transaction.metadata.date)
    if (isNaN(date.getTime())) return

    const monthKey = date.toISOString().substring(0, 7) // YYYY-MM format
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
    .map(([month, data]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
}

// Hash password function
export async function hashPassword(password: string): Promise<string> {
  const bcrypt = require('bcryptjs')
  return bcrypt.hash(password, 12)
}

// Verify password function  
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const bcrypt = require('bcryptjs')
  return bcrypt.compare(password, hashedPassword)
}

// Type-safe object validation
export function isValidObject<T>(obj: unknown, requiredKeys: (keyof T)[]): obj is T {
  if (typeof obj !== 'object' || obj === null) return false
  
  const objKeys = Object.keys(obj as Record<string, unknown>)
  return requiredKeys.every(key => objKeys.includes(key as string))
}