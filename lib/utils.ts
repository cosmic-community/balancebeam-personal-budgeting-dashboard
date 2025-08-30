import { Transaction, CategoryBreakdownItem, MonthlyDataItem } from '@/types'

export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password: string): boolean => {
  return password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password)
}

export const calculateCategoryBreakdown = (expenseTransactions: Transaction[]): CategoryBreakdownItem[] => {
  if (!expenseTransactions || expenseTransactions.length === 0) return []

  const categoryTotals = new Map<string, { name: string, amount: number, color: string }>()
  
  expenseTransactions.forEach(transaction => {
    const category = transaction.metadata.category
    if (typeof category === 'object' && category?.metadata) {
      const categoryName = category.metadata.name || 'Unknown Category'
      const categoryColor = category.metadata.color || '#999999'
      const amount = Math.abs(transaction.metadata.amount || 0)
      
      const existing = categoryTotals.get(categoryName)
      if (existing) {
        existing.amount += amount
      } else {
        categoryTotals.set(categoryName, {
          name: categoryName,
          amount,
          color: categoryColor
        })
      }
    }
  })

  const totalExpenses = Array.from(categoryTotals.values())
    .reduce((sum, item) => sum + item.amount, 0)

  return Array.from(categoryTotals.values()).map(item => ({
    ...item,
    percentage: totalExpenses > 0 ? Math.round((item.amount / totalExpenses) * 100) : 0
  }))
}

export const calculateMonthlyData = (transactions: Transaction[]): MonthlyDataItem[] => {
  if (!transactions || transactions.length === 0) return []

  const monthlyTotals = new Map<string, { income: number, expenses: number }>()
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.metadata.date)
    const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    const amount = transaction.metadata.amount || 0
    const type = transaction.metadata.type?.key
    
    const existing = monthlyTotals.get(monthKey) || { income: 0, expenses: 0 }
    
    if (type === 'income') {
      existing.income += amount
    } else if (type === 'expense') {
      existing.expenses += Math.abs(amount)
    }
    
    monthlyTotals.set(monthKey, existing)
  })

  return Array.from(monthlyTotals.entries())
    .map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses
    }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
}