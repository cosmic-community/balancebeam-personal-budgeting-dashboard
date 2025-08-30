import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
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

// Utility functions
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateForInput(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return new Date().toISOString().split('T')[0]
  }
  
  return date.toISOString().split('T')[0]
}

// Fixed: Added proper type safety for slug generation
export function generateSlug(text: string): string {
  // Ensure text is defined and is a string
  const safeText = text || 'untitled'
  
  return safeText
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Calculate category breakdown for pie chart
export function calculateCategoryBreakdown(transactions: Transaction[]): CategoryBreakdownItem[] {
  const categoryMap = new Map<string, { amount: number; color: string; name: string }>()
  
  // Fixed: Added proper null/undefined checks
  transactions.forEach(transaction => {
    if (!transaction?.metadata) return
    
    const category = transaction.metadata.category
    const amount = Math.abs(transaction.metadata.amount || 0)
    
    // Handle both populated category objects and category IDs
    let categoryId: string
    let categoryName: string
    let categoryColor: string
    
    if (typeof category === 'object' && category !== null) {
      categoryId = category.id || 'unknown'
      categoryName = category.metadata?.name || 'Unknown Category'
      categoryColor = category.metadata?.color || '#999999'
    } else {
      categoryId = category || 'unknown'
      categoryName = 'Unknown Category'
      categoryColor = '#999999'
    }
    
    if (categoryMap.has(categoryId)) {
      const existing = categoryMap.get(categoryId)!
      existing.amount += amount
    } else {
      categoryMap.set(categoryId, {
        amount,
        color: categoryColor,
        name: categoryName
      })
    }
  })

  const total = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.amount, 0)
  
  return Array.from(categoryMap.entries()).map(([id, data]) => ({
    name: data.name,
    amount: data.amount,
    color: data.color,
    percentage: total > 0 ? (data.amount / total) * 100 : 0
  }))
}

// Calculate monthly data for cash flow chart
export function calculateMonthlyData(transactions: Transaction[]): MonthlyDataItem[] {
  const monthMap = new Map<string, { income: number; expenses: number }>()
  
  // Fixed: Added proper null/undefined checks for transactions
  transactions.forEach(transaction => {
    if (!transaction?.metadata?.date) return
    
    const date = new Date(transaction.metadata.date)
    if (isNaN(date.getTime())) return // Skip invalid dates
    
    const monthKey = date.toISOString().slice(0, 7) // YYYY-MM format
    const amount = transaction.metadata.amount || 0
    const isIncome = transaction.metadata.type?.key === 'income'
    
    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, { income: 0, expenses: 0 })
    }
    
    const monthData = monthMap.get(monthKey)!
    if (isIncome) {
      monthData.income += Math.abs(amount)
    } else {
      monthData.expenses += Math.abs(amount)
    }
  })

  // Sort by month and return last 12 months
  return Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, data]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses
    }))
}