import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Transaction, Category, CategoryBreakdownItem, MonthlyDataItem } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Fixed: Add proper type guards and default values for environment variables
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
  const writeKey = process.env.COSMIC_WRITE_KEY
  if (!writeKey) {
    throw new Error('COSMIC_WRITE_KEY environment variable is required')
  }
  return writeKey
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
}

export function formatDateForInput(date: string | Date): string {
  const d = new Date(date)
  if (isNaN(d.getTime())) {
    // If invalid date, return today's date
    return new Date().toISOString().split('T')[0]
  }
  return d.toISOString().split('T')[0]
}

export function getTransactionTypeColor(type: 'income' | 'expense'): string {
  return type === 'income' ? 'text-income' : 'text-expense'
}

export function getTransactionTypeSign(type: 'income' | 'expense'): string {
  return type === 'income' ? '+' : '-'
}

export function calculateNetBalance(transactions: Transaction[]): number {
  return transactions.reduce((balance, transaction) => {
    const amount = transaction.metadata.amount || 0
    return balance + amount
  }, 0)
}

export function calculateTotalIncome(transactions: Transaction[]): number {
  return transactions
    .filter(t => t.metadata.type?.key === 'income')
    .reduce((total, t) => total + (t.metadata.amount || 0), 0)
}

export function calculateTotalExpenses(transactions: Transaction[]): number {
  return transactions
    .filter(t => t.metadata.type?.key === 'expense')
    .reduce((total, t) => total + Math.abs(t.metadata.amount || 0), 0)
}

export function getRecentTransactions(transactions: Transaction[], limit: number = 5): Transaction[] {
  return transactions
    .sort((a, b) => new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime())
    .slice(0, limit)
}

export function calculateCategoryBreakdown(transactions: Transaction[]): CategoryBreakdownItem[] {
  // Fixed: Add proper type guard for data parameter
  if (!transactions || transactions.length === 0) {
    return []
  }

  const categoryTotals: { [key: string]: { name: string; amount: number; color: string } } = {}
  let totalAmount = 0

  // Fixed: Add null checks for potentially undefined properties
  transactions.forEach(transaction => {
    if (!transaction || !transaction.metadata) return
    
    const category = transaction.metadata.category
    const amount = Math.abs(transaction.metadata.amount || 0)
    
    if (typeof category === 'object' && category && category.metadata) {
      const categoryName = category.metadata.name || 'Unknown'
      const categoryColor = category.metadata.color || '#999999'
      
      if (!categoryTotals[categoryName]) {
        categoryTotals[categoryName] = {
          name: categoryName,
          amount: 0,
          color: categoryColor
        }
      }
      
      categoryTotals[categoryName].amount += amount
      totalAmount += amount
    }
  })

  // Convert to array and calculate percentages
  return Object.values(categoryTotals).map(item => ({
    ...item,
    percentage: totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0
  }))
}

export function calculateMonthlyData(data: Transaction[]): MonthlyDataItem[] {
  // Fixed: Add proper type guard for data parameter
  if (!data || data.length === 0) {
    return []
  }

  const monthlyTotals: { [key: string]: { income: number; expenses: number } } = {}

  // Fixed: Add proper null checks for transaction properties
  data.forEach(transaction => {
    if (!transaction || !transaction.metadata || !transaction.metadata.date) return
    
    const date = new Date(transaction.metadata.date)
    const monthKey = date.toISOString().slice(0, 7) // YYYY-MM format
    const amount = transaction.metadata.amount || 0

    if (!monthlyTotals[monthKey]) {
      monthlyTotals[monthKey] = { income: 0, expenses: 0 }
    }

    if (transaction.metadata.type?.key === 'income') {
      monthlyTotals[monthKey].income += Math.abs(amount)
    } else if (transaction.metadata.type?.key === 'expense') {
      monthlyTotals[monthKey].expenses += Math.abs(amount)
    }
  })

  // Convert to array and sort by month
  return Object.entries(monthlyTotals)
    .map(([month, totals]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      income: totals.income,
      expenses: totals.expenses,
      net: totals.income - totals.expenses
    }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
}

export function groupTransactionsByDate(transactions: Transaction[]): { [key: string]: Transaction[] } {
  return transactions.reduce((groups, transaction) => {
    const date = formatDate(transaction.metadata.date)
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(transaction)
    return groups
  }, {} as { [key: string]: Transaction[] })
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

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