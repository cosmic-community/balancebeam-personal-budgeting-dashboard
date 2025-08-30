import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Transaction, CategoryBreakdownItem, MonthlyDataItem } from "@/types"

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
    day: 'numeric',
  })
}

export function formatDateForInput(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toISOString().split('T')[0]
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Environment variable getters with proper null checking
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
  const categoryTotals = new Map<string, { amount: number, color: string, name: string }>()
  
  expenseTransactions.forEach(transaction => {
    const amount = Math.abs(transaction.metadata.amount || 0)
    const categoryId = typeof transaction.metadata.category === 'object' && transaction.metadata.category?.id
      ? transaction.metadata.category.id
      : 'unknown'
    const categoryName = typeof transaction.metadata.category === 'object' && transaction.metadata.category?.metadata?.name
      ? transaction.metadata.category.metadata.name
      : 'Unknown Category'
    const categoryColor = typeof transaction.metadata.category === 'object' && transaction.metadata.category?.metadata?.color
      ? transaction.metadata.category.metadata.color
      : '#999999'
    
    if (categoryTotals.has(categoryId)) {
      const existing = categoryTotals.get(categoryId)!
      existing.amount += amount
    } else {
      categoryTotals.set(categoryId, {
        amount,
        color: categoryColor,
        name: categoryName
      })
    }
  })
  
  const totalExpenses = Array.from(categoryTotals.values()).reduce((sum, cat) => sum + cat.amount, 0)
  
  return Array.from(categoryTotals.entries()).map(([id, data]) => ({
    name: data.name,
    amount: data.amount,
    color: data.color,
    percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0
  }))
}

export function calculateMonthlyData(transactions: Transaction[]): MonthlyDataItem[] {
  const monthlyTotals = new Map<string, { income: number, expenses: number }>()
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.metadata.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const amount = transaction.metadata.amount || 0
    
    if (!monthlyTotals.has(monthKey)) {
      monthlyTotals.set(monthKey, { income: 0, expenses: 0 })
    }
    
    const monthData = monthlyTotals.get(monthKey)!
    if (amount > 0) {
      monthData.income += amount
    } else {
      monthData.expenses += Math.abs(amount)
    }
  })
  
  // Get last 6 months
  const months = []
  const currentDate = new Date()
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthName = date.toLocaleDateString('en-US', { month: 'short' })
    
    const data = monthlyTotals.get(monthKey) || { income: 0, expenses: 0 }
    months.push({
      month: monthName,
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses
    })
  }
  
  return months
}