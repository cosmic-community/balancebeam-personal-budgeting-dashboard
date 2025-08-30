import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

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

// Calculate category breakdown for pie chart
export function calculateCategoryBreakdown(transactions: any[]): any[] {
  const categoryTotals: { [key: string]: { amount: number; color: string; name: string } } = {}
  
  transactions.forEach(transaction => {
    const category = transaction.metadata.category
    const categoryName = typeof category === 'object' && category?.metadata?.name 
      ? category.metadata.name 
      : 'Unknown Category'
    const categoryColor = typeof category === 'object' && category?.metadata?.color 
      ? category.metadata.color 
      : '#999999'
    const amount = Math.abs(transaction.metadata.amount || 0)
    
    if (categoryTotals[categoryName]) {
      categoryTotals[categoryName].amount += amount
    } else {
      categoryTotals[categoryName] = {
        amount,
        color: categoryColor,
        name: categoryName
      }
    }
  })
  
  const total = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.amount, 0)
  
  return Object.values(categoryTotals).map(cat => ({
    ...cat,
    percentage: total > 0 ? Math.round((cat.amount / total) * 100) : 0
  }))
}

// Calculate monthly data for cash flow chart
export function calculateMonthlyData(transactions: any[]): any[] {
  const monthlyTotals: { [key: string]: { income: number; expenses: number } } = {}
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.metadata.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
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
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month: new Date(month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses
    }))
}