import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
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

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
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

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): boolean {
  // At least 8 characters, one letter, one number
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/
  return passwordRegex.test(password)
}

export function calculateCategoryBreakdown(expenseTransactions: Transaction[]): CategoryBreakdownItem[] {
  if (!expenseTransactions || expenseTransactions.length === 0) {
    return []
  }

  const categoryTotals: { [key: string]: { amount: number; color: string; name: string } } = {}

  expenseTransactions.forEach(transaction => {
    const category = transaction.metadata.category
    const amount = Math.abs(transaction.metadata.amount || 0)
    
    if (category?.metadata?.name) {
      const categoryName = category.metadata.name
      if (!categoryTotals[categoryName]) {
        categoryTotals[categoryName] = {
          amount: 0,
          color: category.metadata.color || '#666666',
          name: categoryName
        }
      }
      categoryTotals[categoryName].amount += amount
    }
  })

  const totalExpenses = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.amount, 0)

  return Object.values(categoryTotals).map(category => ({
    name: category.name,
    amount: category.amount,
    color: category.color,
    percentage: totalExpenses > 0 ? Math.round((category.amount / totalExpenses) * 100) : 0
  })).sort((a, b) => b.amount - a.amount)
}

export function calculateMonthlyData(transactions: Transaction[]): MonthlyDataItem[] {
  if (!transactions || transactions.length === 0) {
    return []
  }

  const monthlyTotals: { [key: string]: { income: number; expenses: number } } = {}

  transactions.forEach(transaction => {
    const date = new Date(transaction.metadata.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })

    if (!monthlyTotals[monthKey]) {
      monthlyTotals[monthKey] = { income: 0, expenses: 0 }
    }

    const amount = transaction.metadata.amount || 0
    if (transaction.metadata.type?.key === 'income') {
      monthlyTotals[monthKey].income += amount
    } else if (transaction.metadata.type?.key === 'expense') {
      monthlyTotals[monthKey].expenses += Math.abs(amount)
    }
  })

  return Object.entries(monthlyTotals)
    .map(([monthKey, data]) => {
      const date = new Date(monthKey + '-01')
      return {
        month: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        income: data.income,
        expenses: data.expenses,
        net: data.income - data.expenses
      }
    })
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
    .slice(-6) // Last 6 months
}