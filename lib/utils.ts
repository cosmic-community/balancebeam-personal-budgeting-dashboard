import { clsx, type ClassValue } from 'clsx'
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

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function calculateCategoryBreakdown(expenseTransactions: Transaction[]): CategoryBreakdownItem[] {
  const categoryTotals = new Map<string, { name: string; amount: number; color: string }>()

  expenseTransactions.forEach(transaction => {
    let categoryName = 'Unknown Category'
    let categoryColor = '#999999'
    
    // Safely extract category information
    if (typeof transaction.metadata.category === 'object' && transaction.metadata.category?.metadata) {
      categoryName = transaction.metadata.category.metadata.name || 'Unknown Category'
      categoryColor = transaction.metadata.category.metadata.color || '#999999'
    }

    const amount = Math.abs(transaction.metadata.amount || 0)
    
    if (categoryTotals.has(categoryName)) {
      const existing = categoryTotals.get(categoryName)!
      existing.amount += amount
    } else {
      categoryTotals.set(categoryName, {
        name: categoryName,
        amount,
        color: categoryColor
      })
    }
  })

  const totalExpenses = Array.from(categoryTotals.values()).reduce((sum, cat) => sum + cat.amount, 0)

  return Array.from(categoryTotals.values()).map(category => ({
    ...category,
    percentage: totalExpenses > 0 ? Math.round((category.amount / totalExpenses) * 100) : 0
  }))
}

export function calculateMonthlyData(transactions: Transaction[]): MonthlyDataItem[] {
  const monthlyTotals = new Map<string, { income: number; expenses: number }>()

  transactions.forEach(transaction => {
    const date = new Date(transaction.metadata.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const amount = Math.abs(transaction.metadata.amount || 0)

    if (!monthlyTotals.has(monthKey)) {
      monthlyTotals.set(monthKey, { income: 0, expenses: 0 })
    }

    const monthly = monthlyTotals.get(monthKey)!
    if (transaction.metadata.type?.key === 'income') {
      monthly.income += amount
    } else {
      monthly.expenses += amount
    }
  })

  return Array.from(monthlyTotals.entries())
    .sort()
    .slice(-6) // Last 6 months
    .map(([monthKey, data]) => ({
      month: new Date(monthKey + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses
    }))
}