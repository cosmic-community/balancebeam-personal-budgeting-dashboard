import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Transaction, CategoryBreakdownItem, MonthlyDataItem } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(dateString: string): string {
  try {
    return new Intl.DateFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateString))
  } catch (error) {
    return 'Invalid Date'
  }
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
    .trim()
}

export function calculateCategoryBreakdown(expenseTransactions: Transaction[]): CategoryBreakdownItem[] {
  if (!expenseTransactions || expenseTransactions.length === 0) {
    return []
  }

  const categoryTotals: Record<string, { amount: number; color: string; name: string }> = {}
  let totalExpenses = 0

  expenseTransactions.forEach(transaction => {
    const amount = Math.abs(transaction.metadata.amount || 0)
    totalExpenses += amount

    // Safe category access
    let categoryName = 'Unknown Category'
    let categoryColor = '#999999'

    if (typeof transaction.metadata.category === 'object' && transaction.metadata.category?.metadata) {
      categoryName = transaction.metadata.category.metadata.name || 'Unknown Category'
      categoryColor = transaction.metadata.category.metadata.color || '#999999'
    }

    if (!categoryTotals[categoryName]) {
      categoryTotals[categoryName] = {
        amount: 0,
        color: categoryColor,
        name: categoryName
      }
    }

    categoryTotals[categoryName].amount += amount
  })

  return Object.values(categoryTotals).map(category => ({
    ...category,
    percentage: totalExpenses > 0 ? Math.round((category.amount / totalExpenses) * 100) : 0
  }))
}

export function calculateMonthlyData(transactions: Transaction[]): MonthlyDataItem[] {
  if (!transactions || transactions.length === 0) {
    return []
  }

  const monthlyTotals: Record<string, { income: number; expenses: number }> = {}

  transactions.forEach(transaction => {
    const amount = Math.abs(transaction.metadata.amount || 0)
    const date = new Date(transaction.metadata.date)
    const monthKey = date.toISOString().slice(0, 7) // YYYY-MM format

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
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, totals]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      income: totals.income,
      expenses: totals.expenses,
      net: totals.income - totals.expenses
    }))
}