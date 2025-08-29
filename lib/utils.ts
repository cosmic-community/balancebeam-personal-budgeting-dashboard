import { Transaction, CategoryBreakdownItem, MonthlyDataItem } from '@/types'

// Currency formatting
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

// Date formatting
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

// Generate URL-friendly slug
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Password validation
export function validatePassword(password: string): boolean {
  // Password must be at least 8 characters long
  return password.length >= 8
}

// Calculate category breakdown for expenses
export function calculateCategoryBreakdown(transactions: Transaction[]): CategoryBreakdownItem[] {
  const categoryTotals: { [key: string]: { amount: number; name: string; color: string } } = {}
  let totalExpenses = 0

  transactions.forEach(transaction => {
    if (transaction.metadata.type?.key === 'expense' && transaction.metadata.category) {
      const categoryName = transaction.metadata.category.metadata?.name || transaction.metadata.category.title
      const categoryColor = transaction.metadata.category.metadata?.color || '#9CA3AF'
      const amount = Math.abs(transaction.metadata.amount)
      
      totalExpenses += amount

      if (categoryTotals[categoryName]) {
        categoryTotals[categoryName].amount += amount
      } else {
        categoryTotals[categoryName] = {
          amount,
          name: categoryName,
          color: categoryColor
        }
      }
    }
  })

  return Object.values(categoryTotals).map(category => ({
    ...category,
    percentage: totalExpenses > 0 ? Math.round((category.amount / totalExpenses) * 100) : 0
  })).sort((a, b) => b.amount - a.amount)
}

// Calculate monthly data for cash flow chart
export function calculateMonthlyData(transactions: Transaction[]): MonthlyDataItem[] {
  const monthlyData: { [key: string]: { income: number; expenses: number } } = {}

  transactions.forEach(transaction => {
    const date = new Date(transaction.metadata.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { income: 0, expenses: 0 }
    }

    if (transaction.metadata.type?.key === 'income') {
      monthlyData[monthKey].income += transaction.metadata.amount
    } else if (transaction.metadata.type?.key === 'expense') {
      monthlyData[monthKey].expenses += Math.abs(transaction.metadata.amount)
    }
  })

  return Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, data]) => {
      const date = new Date(monthKey + '-01')
      const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
      
      return {
        month: monthName,
        income: data.income,
        expenses: data.expenses,
        net: data.income - data.expenses
      }
    })
}

// Class name utility (similar to clsx)
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}