import { format, parseISO, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { Transaction, CategoryBreakdownItem, MonthlyDataItem } from '@/types'

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date: string): string {
  return format(parseISO(date), 'MMM dd, yyyy')
}

export function calculateCategoryBreakdown(transactions: Transaction[]): CategoryBreakdownItem[] {
  const categoryMap = new Map<string, { amount: number; color: string; name: string }>()
  let totalAmount = 0

  transactions.forEach(transaction => {
    const category = transaction.metadata?.category
    if (!category) return

    const categoryId = category.id
    const amount = Math.abs(transaction.metadata.amount || 0)
    totalAmount += amount

    if (categoryMap.has(categoryId)) {
      const existing = categoryMap.get(categoryId)!
      categoryMap.set(categoryId, {
        ...existing,
        amount: existing.amount + amount
      })
    } else {
      categoryMap.set(categoryId, {
        amount,
        color: category.metadata?.color || '#6B7280',
        name: category.metadata?.name || category.title
      })
    }
  })

  return Array.from(categoryMap.values()).map(item => ({
    ...item,
    percentage: totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0
  }))
}

export function calculateMonthlyData(transactions: Transaction[]): MonthlyDataItem[] {
  const monthlyMap = new Map<string, { income: number; expenses: number }>()

  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(new Date(), i)
    const monthKey = format(date, 'yyyy-MM')
    monthlyMap.set(monthKey, { income: 0, expenses: 0 })
  }

  transactions.forEach(transaction => {
    const transactionDate = parseISO(transaction.metadata.date)
    const monthKey = format(transactionDate, 'yyyy-MM')
    
    if (monthlyMap.has(monthKey)) {
      const monthData = monthlyMap.get(monthKey)!
      const amount = transaction.metadata.amount || 0
      
      if (transaction.metadata.type?.key === 'income') {
        monthData.income += amount
      } else {
        monthData.expenses += Math.abs(amount)
      }
    }
  })

  return Array.from(monthlyMap.entries()).map(([monthKey, data]) => ({
    month: format(parseISO(monthKey + '-01'), 'MMM'),
    income: data.income,
    expenses: data.expenses,
    net: data.income - data.expenses
  }))
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[\w\.-]+@[\w\.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): { isValid: boolean; message?: string } {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' }
  }
  if (!/[A-Za-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one letter' }
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' }
  }
  return { isValid: true }
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}