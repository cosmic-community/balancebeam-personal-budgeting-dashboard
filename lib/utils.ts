import { Transaction, CategoryBreakdownItem, MonthlyDataItem } from '@/types'

// Environment variable getters
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

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateForInput(date: string | Date): string {
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // Remove invalid chars
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/-+/g, '-') // Replace multiple - with single -
    .trim() // Trim - from start and end
}

// Dashboard calculation functions
export function calculateCategoryBreakdown(transactions: Transaction[]): CategoryBreakdownItem[] {
  if (!transactions || transactions.length === 0) {
    return []
  }

  // Group transactions by category
  const categoryTotals: { [key: string]: { amount: number; color: string; name: string } } = {}
  
  transactions.forEach(transaction => {
    if (transaction.metadata.type?.key === 'expense' && transaction.metadata.amount) {
      const categoryId = typeof transaction.metadata.category === 'object' 
        ? transaction.metadata.category.id 
        : transaction.metadata.category
      
      const categoryName = typeof transaction.metadata.category === 'object' 
        ? transaction.metadata.category.metadata?.name || 'Unknown Category'
        : 'Unknown Category'
      
      const categoryColor = typeof transaction.metadata.category === 'object'
        ? transaction.metadata.category.metadata?.color || '#999999'
        : '#999999'

      if (categoryId && categoryName) {
        if (!categoryTotals[categoryId]) {
          categoryTotals[categoryId] = {
            amount: 0,
            color: categoryColor,
            name: categoryName
          }
        }
        
        categoryTotals[categoryId].amount += Math.abs(transaction.metadata.amount)
      }
    }
  })

  // Convert to array and calculate percentages
  const totalExpenses = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.amount, 0)
  
  if (totalExpenses === 0) {
    return []
  }

  return Object.values(categoryTotals)
    .map(category => ({
      name: category.name,
      amount: category.amount,
      color: category.color,
      percentage: (category.amount / totalExpenses) * 100
    }))
    .sort((a, b) => b.amount - a.amount)
}

export function calculateMonthlyData(transactions: Transaction[]): MonthlyDataItem[] {
  if (!transactions || transactions.length === 0) {
    return []
  }

  // Group transactions by month
  const monthlyTotals: { [key: string]: { income: number; expenses: number } } = {}

  transactions.forEach(transaction => {
    if (transaction.metadata.date && transaction.metadata.amount && transaction.metadata.type?.key) {
      const date = new Date(transaction.metadata.date)
      const monthKey = date.toISOString().substring(0, 7) // YYYY-MM format
      const monthName = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      })

      if (!monthlyTotals[monthKey]) {
        monthlyTotals[monthKey] = { income: 0, expenses: 0 }
      }

      if (transaction.metadata.type.key === 'income') {
        monthlyTotals[monthKey].income += Math.abs(transaction.metadata.amount)
      } else if (transaction.metadata.type.key === 'expense') {
        monthlyTotals[monthKey].expenses += Math.abs(transaction.metadata.amount)
      }
    }
  })

  // Convert to array and sort by month
  return Object.keys(monthlyTotals)
    .sort()
    .map(monthKey => {
      const date = new Date(monthKey + '-01')
      const monthName = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      })
      
      const monthData = monthlyTotals[monthKey]
      
      return {
        month: monthName,
        income: monthData.income,
        expenses: monthData.expenses,
        net: monthData.income - monthData.expenses
      }
    })
}

// Class name utility (similar to clsx)
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}