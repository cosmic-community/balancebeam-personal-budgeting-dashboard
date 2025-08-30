import { Transaction, CategoryBreakdownItem, MonthlyDataItem } from '@/types'

// Type-safe environment variable getters
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

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
}

export function calculateCategoryBreakdown(expenseTransactions: Transaction[]): CategoryBreakdownItem[] {
  const categoryTotals = new Map<string, { amount: number; color: string }>()
  
  expenseTransactions.forEach(transaction => {
    const categoryName = typeof transaction.metadata.category === 'object' 
      ? transaction.metadata.category?.metadata?.name || 'Unknown'
      : 'Unknown'
    
    const categoryColor = typeof transaction.metadata.category === 'object' 
      ? transaction.metadata.category?.metadata?.color || '#999999'
      : '#999999'
    
    const amount = Math.abs(transaction.metadata.amount || 0)
    
    if (categoryTotals.has(categoryName)) {
      const existing = categoryTotals.get(categoryName)!
      categoryTotals.set(categoryName, { ...existing, amount: existing.amount + amount })
    } else {
      categoryTotals.set(categoryName, { amount, color: categoryColor })
    }
  })
  
  const totalExpenses = Array.from(categoryTotals.values())
    .reduce((sum, cat) => sum + cat.amount, 0)
  
  return Array.from(categoryTotals.entries()).map(([name, data]) => ({
    name,
    amount: data.amount,
    color: data.color,
    percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0
  }))
}

export function calculateMonthlyData(transactions: Transaction[]): MonthlyDataItem[] {
  const monthlyTotals = new Map<string, { income: number; expenses: number }>()
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.metadata.date)
    const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    const amount = Math.abs(transaction.metadata.amount || 0)
    const isIncome = transaction.metadata.type?.key === 'income'
    
    if (monthlyTotals.has(monthKey)) {
      const existing = monthlyTotals.get(monthKey)!
      monthlyTotals.set(monthKey, {
        income: existing.income + (isIncome ? amount : 0),
        expenses: existing.expenses + (isIncome ? 0 : amount)
      })
    } else {
      monthlyTotals.set(monthKey, {
        income: isIncome ? amount : 0,
        expenses: isIncome ? 0 : amount
      })
    }
  })
  
  return Array.from(monthlyTotals.entries()).map(([month, data]) => ({
    month,
    income: data.income,
    expenses: data.expenses,
    net: data.income - data.expenses
  }))
}

// Safe bucket info getter for client-side usage
export function getBucketSlugSafely(): string | null {
  try {
    const bucketSlug = process.env.COSMIC_BUCKET_SLUG
    const readKey = process.env.COSMIC_READ_KEY
    
    if (!bucketSlug || !readKey) {
      return null
    }
    
    return bucketSlug
  } catch {
    return null
  }
}