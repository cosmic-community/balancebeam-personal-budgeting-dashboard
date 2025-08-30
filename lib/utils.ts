import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

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
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(dateObj)
}

export function formatDateForInput(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toISOString().split('T')[0]
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Cosmic environment variable helpers
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

// Dashboard calculation utilities
export function calculateCategoryBreakdown(transactions: any[]): any[] {
  const categoryTotals: Record<string, { amount: number; color: string; name: string }> = {}
  
  transactions.forEach(transaction => {
    const categoryId = typeof transaction.metadata.category === 'object' 
      ? transaction.metadata.category.id 
      : transaction.metadata.category
    
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
  
  const totalExpenses = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.amount, 0)
  
  return Object.entries(categoryTotals).map(([id, data]) => ({
    name: data.name,
    amount: data.amount,
    color: data.color,
    percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0
  }))
}

export function calculateMonthlyData(transactions: any[]): any[] {
  const monthlyTotals: Record<string, { income: number; expenses: number }> = {}
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.metadata.date || transaction.created_at)
    const monthKey = date.toISOString().substring(0, 7) // YYYY-MM format
    
    if (!monthlyTotals[monthKey]) {
      monthlyTotals[monthKey] = { income: 0, expenses: 0 }
    }
    
    const amount = Math.abs(transaction.metadata.amount || 0)
    
    if (transaction.metadata.type?.key === 'income') {
      monthlyTotals[monthKey].income += amount
    } else {
      monthlyTotals[monthKey].expenses += amount
    }
  })
  
  // Get last 12 months
  const months = Object.keys(monthlyTotals).sort().slice(-12)
  
  return months.map(month => ({
    month,
    income: monthlyTotals[month].income,
    expenses: monthlyTotals[month].expenses,
    net: monthlyTotals[month].income - monthlyTotals[month].expenses
  }))
}