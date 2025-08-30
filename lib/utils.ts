import { type ClassValue, clsx } from 'clsx'
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

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatDateForInput(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    return new Date().toISOString().split('T')[0]
  }
  
  return dateObj.toISOString().split('T')[0]
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

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

export function calculateCategoryBreakdown(transactions: Transaction[]): CategoryBreakdownItem[] {
  const categoryTotals: { [key: string]: { amount: number; color: string; name: string } } = {}
  
  transactions.forEach(transaction => {
    // Safe access to category data
    const categoryData = typeof transaction.metadata.category === 'object' 
      ? transaction.metadata.category 
      : null
      
    if (categoryData?.metadata) {
      const categoryName = categoryData.metadata.name || 'Unknown'
      const categoryColor = categoryData.metadata.color || '#999999'
      const amount = Math.abs(transaction.metadata.amount || 0)
      
      if (categoryTotals[categoryName]) {
        categoryTotals[categoryName].amount += amount
      } else {
        categoryTotals[categoryName] = {
          amount,
          color: categoryColor,
          name: categoryName
        }
      }
    }
  })

  const totalAmount = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.amount, 0)
  
  return Object.entries(categoryTotals).map(([name, data]) => ({
    name: data.name,
    amount: data.amount,
    color: data.color,
    percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0
  }))
}

export function calculateMonthlyData(transactions: Transaction[]): MonthlyDataItem[] {
  const monthlyTotals: { [key: string]: { income: number; expenses: number } } = {}
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.metadata.date || new Date())
    const monthKey = date.toISOString().slice(0, 7) // YYYY-MM format
    const amount = transaction.metadata.amount || 0
    
    if (!monthlyTotals[monthKey]) {
      monthlyTotals[monthKey] = { income: 0, expenses: 0 }
    }
    
    if (transaction.metadata.type?.key === 'income') {
      monthlyTotals[monthKey].income += amount
    } else {
      monthlyTotals[monthKey].expenses += Math.abs(amount)
    }
  })

  // Get last 6 months
  const months = Object.keys(monthlyTotals)
    .sort()
    .slice(-6)
    
  return months.map(month => {
    const data = monthlyTotals[month]
    const monthDate = new Date(month + '-01')
    
    return {
      month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses
    }
  })
}

export function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required')
  }
  return secret
}