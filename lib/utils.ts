export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateForInput(dateString: string): string {
  const date = new Date(dateString)
  return date.toISOString().split('T')[0]
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

// Calculate category breakdown for expenses
export function calculateCategoryBreakdown(transactions: any[]): Array<{
  name: string
  amount: number
  color: string
  percentage: number
}> {
  if (!transactions || transactions.length === 0) {
    return []
  }

  // Group transactions by category
  const categoryTotals: Record<string, { amount: number; color: string; name: string }> = {}
  
  transactions.forEach(transaction => {
    if (transaction.metadata?.type?.key === 'expense') {
      const categoryName = typeof transaction.metadata.category === 'object' 
        ? transaction.metadata.category?.metadata?.name || 'Unknown'
        : 'Unknown'
      const categoryColor = typeof transaction.metadata.category === 'object'
        ? transaction.metadata.category?.metadata?.color || '#999999'
        : '#999999'
      const amount = Math.abs(transaction.metadata.amount || 0)

      if (!categoryTotals[categoryName]) {
        categoryTotals[categoryName] = { amount: 0, color: categoryColor, name: categoryName }
      }
      categoryTotals[categoryName].amount += amount
    }
  })

  // Calculate totals and percentages
  const totalExpenses = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.amount, 0)
  
  return Object.values(categoryTotals).map(category => ({
    name: category.name,
    amount: category.amount,
    color: category.color,
    percentage: totalExpenses > 0 ? (category.amount / totalExpenses) * 100 : 0
  }))
}

// Calculate monthly data for cash flow chart
export function calculateMonthlyData(transactions: any[]): Array<{
  month: string
  income: number
  expenses: number
  net: number
}> {
  if (!transactions || transactions.length === 0) {
    return []
  }

  const monthlyTotals: Record<string, { income: number; expenses: number }> = {}

  transactions.forEach(transaction => {
    const date = new Date(transaction.metadata?.date || transaction.created_at)
    const monthKey = date.toISOString().slice(0, 7) // YYYY-MM format
    const amount = Math.abs(transaction.metadata?.amount || 0)

    if (!monthlyTotals[monthKey]) {
      monthlyTotals[monthKey] = { income: 0, expenses: 0 }
    }

    if (transaction.metadata?.type?.key === 'income') {
      monthlyTotals[monthKey].income += amount
    } else if (transaction.metadata?.type?.key === 'expense') {
      monthlyTotals[monthKey].expenses += amount
    }
  })

  return Object.entries(monthlyTotals)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses
    }))
}

// Environment variable getters with proper type safety
export function getCosmicBucketSlug(): string {
  const slug = process.env.COSMIC_BUCKET_SLUG
  if (!slug) {
    throw new Error('COSMIC_BUCKET_SLUG environment variable is required')
  }
  return slug
}

export function getCosmicReadKey(): string {
  const key = process.env.COSMIC_READ_KEY
  if (!key) {
    throw new Error('COSMIC_READ_KEY environment variable is required')
  }
  return key
}

export function getCosmicWriteKey(): string {
  const key = process.env.COSMIC_WRITE_KEY
  if (!key) {
    throw new Error('COSMIC_WRITE_KEY environment variable is required')
  }
  return key
}

export function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required')
  }
  return secret
}