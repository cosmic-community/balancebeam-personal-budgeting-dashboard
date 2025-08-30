import { Transaction, CategoryBreakdownItem, MonthlyDataItem, getTransactionCategoryName, getTransactionCategoryColor } from '@/types'

// Environment variable helpers
export function getCosmicBucketSlug(): string {
  return process.env.COSMIC_BUCKET_SLUG || ''
}

export function getCosmicReadKey(): string {
  return process.env.COSMIC_READ_KEY || ''
}

export function getCosmicWriteKey(): string {
  return process.env.COSMIC_WRITE_KEY || ''
}

// Currency formatting
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

// Date formatting functions
export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  
  if (isNaN(date.getTime())) {
    return 'Invalid Date'
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

export function formatDateForInput(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  
  if (isNaN(date.getTime())) {
    return new Date().toISOString().split('T')[0]
  }

  return date.toISOString().split('T')[0]
}

// Slug generation
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

// Dashboard calculations
export function calculateCategoryBreakdown(transactions: Transaction[]): CategoryBreakdownItem[] {
  const categoryTotals: Record<string, { amount: number; color: string; name: string }> = {}
  
  transactions.forEach(transaction => {
    if (transaction.metadata.type?.key !== 'expense') return
    
    const categoryName = getTransactionCategoryName(transaction)
    const categoryColor = getTransactionCategoryColor(transaction)
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
  })
  
  const total = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.amount, 0)
  
  return Object.entries(categoryTotals)
    .map(([name, data]) => ({
      name: data.name,
      amount: data.amount,
      color: data.color,
      percentage: total > 0 ? (data.amount / total) * 100 : 0
    }))
    .sort((a, b) => b.amount - a.amount)
}

export function calculateMonthlyData(transactions: Transaction[]): MonthlyDataItem[] {
  const monthlyTotals: Record<string, { income: number; expenses: number }> = {}
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.metadata.date || transaction.created_at)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    
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
  
  // Get last 6 months
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    }
  }).reverse()
  
  return last6Months.map(({ key, month }) => {
    const data = monthlyTotals[key] || { income: 0, expenses: 0 }
    return {
      month,
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses
    }
  })
}