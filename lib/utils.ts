import { Transaction, CategoryBreakdownItem, MonthlyDataItem } from '@/types'

export function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ')
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

export function formatDateForInput(date: string | Date): string {
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

export function getCosmicBucketSlug(): string {
  const bucketSlug = process.env.COSMIC_BUCKET_SLUG
  if (!bucketSlug) {
    throw new Error('COSMIC_BUCKET_SLUG environment variable is required')
  }
  return bucketSlug
}

export function getCosmicReadKey(): string {
  return process.env.COSMIC_READ_KEY || ''
}

export function getCosmicWriteKey(): string {
  return process.env.COSMIC_WRITE_KEY || ''
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function calculateCategoryBreakdown(transactions: Transaction[]): CategoryBreakdownItem[] {
  // Filter out transactions without proper category data
  const validTransactions = transactions.filter(t => {
    return t && 
           t.metadata && 
           typeof t.metadata.category === 'object' && 
           t.metadata.category !== null &&
           t.metadata.category.metadata &&
           t.metadata.category.metadata.name &&
           t.metadata.category.metadata.color &&
           typeof t.metadata.amount === 'number'
  })

  if (validTransactions.length === 0) {
    return []
  }

  const categoryTotals = new Map<string, { amount: number; color: string; name: string }>()
  
  validTransactions.forEach(transaction => {
    const category = transaction.metadata.category
    if (typeof category === 'object' && category && category.metadata) {
      const categoryName = category.metadata.name
      const categoryColor = category.metadata.color
      const amount = Math.abs(transaction.metadata.amount || 0)
      
      if (categoryName && categoryColor) {
        if (categoryTotals.has(categoryName)) {
          const existing = categoryTotals.get(categoryName)
          if (existing) {
            existing.amount += amount
          }
        } else {
          categoryTotals.set(categoryName, {
            amount,
            color: categoryColor,
            name: categoryName
          })
        }
      }
    }
  })

  const total = Array.from(categoryTotals.values()).reduce((sum, cat) => sum + cat.amount, 0)
  
  return Array.from(categoryTotals.entries()).map(([name, data]) => ({
    name: data.name,
    amount: data.amount,
    color: data.color,
    percentage: total > 0 ? (data.amount / total) * 100 : 0
  }))
}

export function calculateMonthlyData(transactions: Transaction[]): MonthlyDataItem[] {
  // Filter out transactions without proper data
  const validTransactions = transactions.filter(t => {
    return t && 
           t.metadata && 
           t.metadata.date && 
           typeof t.metadata.amount === 'number' &&
           t.metadata.type &&
           t.metadata.type.key
  })

  if (validTransactions.length === 0) {
    return []
  }

  const monthlyTotals = new Map<string, { income: number; expenses: number }>()

  validTransactions.forEach(transaction => {
    const date = new Date(transaction.metadata.date)
    const monthKey = date.toISOString().substring(0, 7) // YYYY-MM format
    const amount = Math.abs(transaction.metadata.amount)
    const type = transaction.metadata.type?.key

    if (!monthlyTotals.has(monthKey)) {
      monthlyTotals.set(monthKey, { income: 0, expenses: 0 })
    }

    const monthData = monthlyTotals.get(monthKey)
    if (monthData) {
      if (type === 'income') {
        monthData.income += amount
      } else if (type === 'expense') {
        monthData.expenses += amount
      }
    }
  })

  return Array.from(monthlyTotals.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      }),
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses
    }))
}