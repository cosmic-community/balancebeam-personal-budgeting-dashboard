import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Environment variable helpers with proper null checks
export function getCosmicBucketSlug(): string {
  const slug = process.env.COSMIC_BUCKET_SLUG
  if (!slug) {
    throw new Error('COSMIC_BUCKET_SLUG environment variable is required')
  }
  return slug
}

export function getCosmicReadKey(): string {
  const readKey = process.env.COSMIC_READ_KEY
  if (!readKey) {
    throw new Error('COSMIC_READ_KEY environment variable is required')
  }
  return readKey
}

export function getCosmicWriteKey(): string {
  const writeKey = process.env.COSMIC_WRITE_KEY
  if (!writeKey) {
    throw new Error('COSMIC_WRITE_KEY environment variable is required')
  }
  return writeKey
}

export function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required')
  }
  return secret
}

// Currency formatting
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

// Date formatting helpers
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateForInput(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return new Date().toISOString().split('T')[0]
  }
  
  return date.toISOString().split('T')[0]
}

// Slug generation
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Number formatting
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

// Percentage calculation
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

// Color utilities
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

export function getRandomColor(): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// Array utilities
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const value = String(item[key])
    groups[value] = groups[value] || []
    groups[value].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

// Data processing helpers with proper null checks
export function processMonthlyData(data: any[]): any[] {
  // Add null check for data parameter
  if (!data || !Array.isArray(data)) {
    return []
  }
  
  return data.map(item => {
    // Add null checks for item properties
    if (!item) {
      return { month: 'Unknown', income: 0, expenses: 0, net: 0 }
    }
    
    const income = typeof item.income === 'number' ? item.income : 0
    const expenses = typeof item.expenses === 'number' ? item.expenses : 0
    
    return {
      month: item.month || 'Unknown',
      income,
      expenses,
      net: income - expenses
    }
  })
}

export function processCategoryData(data: any[]): any[] {
  // Add null check for data parameter
  if (!data || !Array.isArray(data)) {
    return []
  }
  
  const total = data.reduce((sum, item) => {
    // Add null check for item and amount property
    if (!item || typeof item.amount !== 'number') {
      return sum
    }
    return sum + Math.abs(item.amount)
  }, 0)
  
  return data.map(item => {
    // Add null check for item properties
    if (!item) {
      return { name: 'Unknown', amount: 0, percentage: 0, color: '#999999' }
    }
    
    const amount = typeof item.amount === 'number' ? Math.abs(item.amount) : 0
    
    return {
      name: item.name || 'Unknown Category',
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
      color: item.color || '#999999'
    }
  })
}

// Transaction helpers
export function isExpense(amount: number): boolean {
  return amount < 0
}

export function isIncome(amount: number): boolean {
  return amount > 0
}

// Validation helpers
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidAmount(amount: any): boolean {
  return typeof amount === 'number' && !isNaN(amount) && isFinite(amount)
}

// Safe string operations
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) {
    return text || ''
  }
  return text.slice(0, maxLength) + '...'
}

// Date range helpers
export function getStartOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function getEndOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

export function getMonthName(monthIndex: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return months[monthIndex] || 'Unknown'
}

// Error handling helpers
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}

export function isApiError(error: unknown): error is { message: string; status?: number } {
  return typeof error === 'object' && error !== null && 'message' in error
}