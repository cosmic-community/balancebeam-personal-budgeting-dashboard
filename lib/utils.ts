export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateForInput(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
}

export function getCosmicBucketSlug(): string {
  const slug = process.env.COSMIC_BUCKET_SLUG
  if (!slug) {
    throw new Error('COSMIC_BUCKET_SLUG environment variable is not set')
  }
  return slug
}

export function getCosmicReadKey(): string {
  const key = process.env.COSMIC_READ_KEY
  if (!key) {
    throw new Error('COSMIC_READ_KEY environment variable is not set')
  }
  return key
}

export function getCosmicWriteKey(): string {
  const key = process.env.COSMIC_WRITE_KEY
  if (!key) {
    throw new Error('COSMIC_WRITE_KEY environment variable is not set')
  }
  return key
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Dashboard calculation utilities
export function calculateCategoryBreakdown(transactions: any[]): any[] {
  const categoryTotals: Record<string, { amount: number; color: string; name: string }> = {}
  
  transactions.forEach(transaction => {
    const categoryName = typeof transaction.metadata.category === 'object' 
      ? transaction.metadata.category?.metadata?.name 
      : 'Unknown'
    const categoryColor = typeof transaction.metadata.category === 'object' 
      ? transaction.metadata.category?.metadata?.color 
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
  
  const totalExpenses = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.amount, 0)
  
  return Object.values(categoryTotals).map(category => ({
    ...category,
    percentage: totalExpenses > 0 ? (category.amount / totalExpenses) * 100 : 0
  }))
}

export function calculateMonthlyData(transactions: any[]): any[] {
  const monthlyTotals: Record<string, { income: number; expenses: number }> = {}
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.metadata.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    
    if (!monthlyTotals[monthKey]) {
      monthlyTotals[monthKey] = { income: 0, expenses: 0 }
    }
    
    const amount = transaction.metadata.amount || 0
    if (transaction.metadata.type?.key === 'income') {
      monthlyTotals[monthKey].income += amount
    } else {
      monthlyTotals[monthKey].expenses += Math.abs(amount)
    }
  })
  
  return Object.entries(monthlyTotals)
    .map(([month, data]) => ({
      month,
      ...data,
      net: data.income - data.expenses
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
}