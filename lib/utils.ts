import { Transaction, CategoryBreakdownItem, MonthlyDataItem } from '@/types'

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function calculateCategoryBreakdown(transactions: Transaction[]): CategoryBreakdownItem[] {
  const categoryMap = new Map<string, { amount: number; color: string; name: string }>()
  
  transactions.forEach(transaction => {
    if (transaction.metadata.category) {
      const categoryName = transaction.metadata.category.metadata?.name || transaction.metadata.category.title
      const categoryColor = transaction.metadata.category.metadata?.color || '#FF9800'
      const amount = Math.abs(transaction.metadata.amount || 0)
      
      if (categoryMap.has(categoryName)) {
        const existing = categoryMap.get(categoryName)!
        categoryMap.set(categoryName, {
          ...existing,
          amount: existing.amount + amount
        })
      } else {
        categoryMap.set(categoryName, {
          name: categoryName,
          amount,
          color: categoryColor
        })
      }
    }
  })
  
  const totalExpenses = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.amount, 0)
  
  return Array.from(categoryMap.values()).map(category => ({
    ...category,
    percentage: totalExpenses > 0 ? Math.round((category.amount / totalExpenses) * 100) : 0
  })).sort((a, b) => b.amount - a.amount)
}

export function calculateMonthlyData(transactions: Transaction[]): MonthlyDataItem[] {
  const monthMap = new Map<string, { income: number; expenses: number }>()
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.metadata.date)
    const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    const amount = Math.abs(transaction.metadata.amount || 0)
    
    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, { income: 0, expenses: 0 })
    }
    
    const monthData = monthMap.get(monthKey)!
    if (transaction.metadata.type?.key === 'income') {
      monthData.income += amount
    } else {
      monthData.expenses += amount
    }
  })
  
  return Array.from(monthMap.entries())
    .map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses
    }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
    .slice(-6) // Last 6 months
}