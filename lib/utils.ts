import { Transaction, CategoryBreakdownItem, MonthlyDataItem } from '@/types'

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date))
}

export function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export function calculateCategoryBreakdown(transactions: Transaction[]): CategoryBreakdownItem[] {
  if (!transactions || transactions.length === 0) return []
  
  const categoryTotals: { [key: string]: { amount: number; color: string; name: string } } = {}
  let totalAmount = 0

  transactions.forEach(transaction => {
    const amount = Math.abs(transaction.metadata.amount || 0)
    totalAmount += amount
    
    const categoryName = typeof transaction.metadata.category === 'object' 
      ? transaction.metadata.category?.metadata?.name || 'Unknown'
      : 'Unknown'
    const categoryColor = typeof transaction.metadata.category === 'object'
      ? transaction.metadata.category?.metadata?.color || '#999999'
      : '#999999'

    if (!categoryTotals[categoryName]) {
      categoryTotals[categoryName] = {
        amount: 0,
        color: categoryColor,
        name: categoryName
      }
    }
    categoryTotals[categoryName].amount += amount
  })

  return Object.values(categoryTotals)
    .map(item => ({
      ...item,
      percentage: totalAmount > 0 ? Math.round((item.amount / totalAmount) * 100) : 0
    }))
    .sort((a, b) => b.amount - a.amount)
}

export function calculateMonthlyData(transactions: Transaction[]): MonthlyDataItem[] {
  if (!transactions || transactions.length === 0) return []
  
  const monthlyTotals: { [key: string]: { income: number; expenses: number } } = {}

  transactions.forEach(transaction => {
    const date = new Date(transaction.metadata.date)
    const monthKey = date.toISOString().slice(0, 7) // YYYY-MM format
    const amount = Math.abs(transaction.metadata.amount || 0)
    
    if (!monthlyTotals[monthKey]) {
      monthlyTotals[monthKey] = { income: 0, expenses: 0 }
    }

    if (transaction.metadata.type?.key === 'income') {
      monthlyTotals[monthKey].income += amount
    } else {
      monthlyTotals[monthKey].expenses += amount
    }
  })

  return Object.entries(monthlyTotals)
    .map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
}