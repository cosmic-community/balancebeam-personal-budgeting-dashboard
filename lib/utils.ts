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

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date))
}

// Fixed: Add proper null checks for environment variables
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

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

export function formatDateForInput(dateInput: string | Date): string {
  const date = new Date(dateInput)
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    // Return current date if invalid
    const today = new Date()
    return today.toISOString().split('T')[0]
  }
  
  return date.toISOString().split('T')[0]
}

export function calculateMonthlyData(transactions: any[]): any[] {
  const monthlyMap = new Map()
  
  transactions.forEach(transaction => {
    if (!transaction?.metadata?.date || !transaction?.metadata?.amount) {
      return // Skip invalid transactions
    }
    
    const date = new Date(transaction.metadata.date)
    if (isNaN(date.getTime())) {
      return // Skip invalid dates
    }
    
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const amount = transaction.metadata.amount
    
    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, {
        month: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        income: 0,
        expenses: 0,
        net: 0
      })
    }
    
    const monthData = monthlyMap.get(monthKey)
    if (amount > 0) {
      monthData.income += amount
    } else {
      monthData.expenses += Math.abs(amount)
    }
    monthData.net = monthData.income - monthData.expenses
  })
  
  return Array.from(monthlyMap.values()).sort((a, b) => {
    const dateA = new Date(a.month + ' 1')
    const dateB = new Date(b.month + ' 1')
    return dateA.getTime() - dateB.getTime()
  })
}

// Fixed: Add proper null checks for the JWT signing function
export async function signJWT(payload: any): Promise<string> {
  const { SignJWT } = await import('jose')
  const secret = process.env.JWT_SECRET
  const issuer = process.env.JWT_ISSUER
  
  // Add proper null checks for environment variables
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required')
  }
  if (!issuer) {
    throw new Error('JWT_ISSUER environment variable is required')  
  }
  
  const alg = 'HS256'
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setIssuer(issuer)
    .setAudience('budgeting-app')
    .setExpirationTime('24h')
    .sign(new TextEncoder().encode(secret))
  
  return jwt
}

export async function verifyJWT(token: string): Promise<any> {
  try {
    const { jwtVerify } = await import('jose')
    const secret = process.env.JWT_SECRET
    const issuer = process.env.JWT_ISSUER
    
    // Add proper null checks for environment variables
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required')
    }
    if (!issuer) {
      throw new Error('JWT_ISSUER environment variable is required')
    }
    
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
      {
        issuer,
        audience: 'budgeting-app'
      }
    )
    
    return payload
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}