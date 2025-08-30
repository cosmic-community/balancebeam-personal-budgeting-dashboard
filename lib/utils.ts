import { Transaction, CategoryBreakdownItem, MonthlyDataItem } from '@/types'

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
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function calculateCategoryBreakdown(transactions: Transaction[]): CategoryBreakdownItem[] {
  const categoryMap = new Map<string, { amount: number; color: string; name: string }>()

  transactions.forEach(transaction => {
    if (typeof transaction.metadata.category === 'object' && transaction.metadata.category?.metadata) {
      const categoryName = transaction.metadata.category.metadata.name
      const categoryColor = transaction.metadata.category.metadata.color
      const amount = Math.abs(transaction.metadata.amount || 0)

      if (categoryMap.has(categoryName)) {
        categoryMap.get(categoryName)!.amount += amount
      } else {
        categoryMap.set(categoryName, {
          amount,
          color: categoryColor,
          name: categoryName
        })
      }
    }
  })

  const total = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.amount, 0)

  return Array.from(categoryMap.entries()).map(([name, data]) => ({
    name,
    amount: data.amount,
    color: data.color,
    percentage: total > 0 ? (data.amount / total) * 100 : 0
  }))
}

export function calculateMonthlyData(transactions: Transaction[]): MonthlyDataItem[] {
  const monthlyMap = new Map<string, { income: number; expenses: number }>()

  transactions.forEach(transaction => {
    const date = new Date(transaction.metadata.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const amount = transaction.metadata.amount || 0

    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, { income: 0, expenses: 0 })
    }

    const monthData = monthlyMap.get(monthKey)!
    if (transaction.metadata.type?.key === 'income') {
      monthData.income += amount
    } else {
      monthData.expenses += Math.abs(amount)
    }
  })

  // Get last 6 months
  const result: MonthlyDataItem[] = []
  const now = new Date()
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthName = date.toLocaleDateString('en-US', { month: 'short' })
    
    const data = monthlyMap.get(monthKey) || { income: 0, expenses: 0 }
    result.push({
      month: monthName,
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses
    })
  }

  return result
}