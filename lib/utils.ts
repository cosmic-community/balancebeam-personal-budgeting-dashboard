import { type ClassValue, clsx } from 'clsx'
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

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim()
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function calculateCategoryBreakdown(expenses: Transaction[]): CategoryBreakdownItem[] {
  if (!expenses || expenses.length === 0) return []

  const categoryTotals: Record<string, { amount: number; color: string; name: string }> = {}
  let totalExpenses = 0

  expenses.forEach(transaction => {
    const amount = Math.abs(transaction.metadata.amount || 0)
    const category = transaction.metadata.category
    
    if (category && category.metadata) {
      const categoryName = category.metadata.name || category.title
      const categoryColor = category.metadata.color || '#6B7280'
      
      if (!categoryTotals[categoryName]) {
        categoryTotals[categoryName] = {
          amount: 0,
          color: categoryColor,
          name: categoryName
        }
      }
      
      categoryTotals[categoryName].amount += amount
      totalExpenses += amount
    }
  })

  return Object.values(categoryTotals).map(category => ({
    name: category.name,
    amount: category.amount,
    color: category.color,
    percentage: totalExpenses > 0 ? Math.round((category.amount / totalExpenses) * 100) : 0
  }))
}

export function calculateMonthlyData(transactions: Transaction[]): MonthlyDataItem[] {
  if (!transactions || transactions.length === 0) return []

  const monthlyTotals: Record<string, { income: number; expenses: number }> = {}

  transactions.forEach(transaction => {
    const date = new Date(transaction.metadata.date)
    const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    const amount = transaction.metadata.amount || 0
    const type = transaction.metadata.type?.key

    if (!monthlyTotals[monthKey]) {
      monthlyTotals[monthKey] = { income: 0, expenses: 0 }
    }

    if (type === 'income') {
      monthlyTotals[monthKey].income += amount
    } else if (type === 'expense') {
      monthlyTotals[monthKey].expenses += Math.abs(amount)
    }
  })

  return Object.entries(monthlyTotals)
    .map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses
    }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
}