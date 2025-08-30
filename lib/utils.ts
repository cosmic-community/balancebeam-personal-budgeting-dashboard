import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: (string | undefined | null | false)[]): string {
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
  return dateObj.toISOString().split('T')[0] || ''
}

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

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Dashboard calculation utilities
export function calculateCategoryBreakdown(transactions: any[]) {
  const breakdown: Record<string, { amount: number; color: string; name: string }> = {}
  
  transactions.forEach(transaction => {
    const categoryData = typeof transaction.metadata.category === 'object' 
      ? transaction.metadata.category 
      : null
    
    if (categoryData?.metadata) {
      const categoryId = categoryData.id || 'unknown'
      const categoryName = categoryData.metadata.name || 'Unknown'
      const categoryColor = categoryData.metadata.color || '#999999'
      
      if (!breakdown[categoryId]) {
        breakdown[categoryId] = {
          name: categoryName,
          color: categoryColor,
          amount: 0
        }
      }
      
      breakdown[categoryId].amount += Math.abs(transaction.metadata.amount || 0)
    }
  })
  
  const totalAmount = Object.values(breakdown).reduce((sum, item) => sum + item.amount, 0)
  
  return Object.values(breakdown).map(item => ({
    ...item,
    percentage: totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0
  }))
}

export function calculateMonthlyData(transactions: any[]) {
  const monthlyData: Record<string, { income: number; expenses: number }> = {}
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.metadata.date || Date.now())
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { income: 0, expenses: 0 }
    }
    
    const amount = transaction.metadata.amount || 0
    if (transaction.metadata.type?.key === 'income') {
      monthlyData[monthKey].income += amount
    } else {
      monthlyData[monthKey].expenses += Math.abs(amount)
    }
  })
  
  return Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, data]) => ({
      month: new Date(monthKey + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses
    }))
}