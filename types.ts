// Base Cosmic object interface
export interface CosmicObject {
  id: string
  slug: string
  title: string
  content?: string
  metadata: Record<string, any>
  type: string
  created_at: string
  modified_at: string
  status?: string
  bucket?: string
  published_at?: string
  modified_by?: string
  created_by?: string
  publish_at?: string | null
  thumbnail?: string
}

// User object type
export interface User extends CosmicObject {
  type: 'users'
  metadata: {
    full_name: string
    email: string
    password_hash: string
    dark_mode?: boolean
    created_at: string
  }
}

// Category object type
export interface Category extends CosmicObject {
  type: 'categories'
  metadata: {
    user: User | string
    name: string
    color: string
    type: {
      key: 'income' | 'expense'
      value: 'Income' | 'Expense'
    }
  }
}

// Transaction object type
export interface Transaction extends CosmicObject {
  type: 'transactions'
  metadata: {
    user: User | string
    type: {
      key: 'income' | 'expense'
      value: 'Income' | 'Expense'
    }
    amount: number
    category: Category | string
    description?: string
    date: string
  }
}

// API response types
export interface CosmicResponse<T> {
  objects: T[]
  total: number
  limit: number
  skip?: number
}

// Auth types
export interface AuthUser {
  id: string
  email: string
  full_name: string
  dark_mode: boolean
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  full_name: string
  email: string
  password: string
  confirmPassword: string
}

// JWT payload interface compatible with jose library
export interface JWTPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
  [key: string]: any
}

// Dashboard data types
export interface DashboardStats {
  totalIncome: number
  totalExpenses: number
  netBalance: number
  recentTransactions: Transaction[]
  categoryBreakdown: CategoryBreakdownItem[]
  monthlyData: MonthlyDataItem[]
}

export interface CategoryBreakdownItem {
  name: string
  amount: number
  color: string
  percentage: number
}

export interface MonthlyDataItem {
  month: string
  income: number
  expenses: number
  net: number
}

// Form data types
export interface TransactionFormData {
  type: 'income' | 'expense'
  amount: number
  category: string
  description?: string
  date: string
}

export interface CategoryFormData {
  name: string
  color: string
  type: 'income' | 'expense'
}

// Helper functions for safe property access
export function getTransactionCategoryName(transaction: Transaction): string {
  if (typeof transaction.metadata.category === 'object' && transaction.metadata.category?.metadata?.name) {
    return transaction.metadata.category.metadata.name
  }
  return 'Unknown Category'
}

export function getTransactionCategoryColor(transaction: Transaction): string {
  if (typeof transaction.metadata.category === 'object' && transaction.metadata.category?.metadata?.color) {
    return transaction.metadata.category.metadata.color
  }
  return '#999999'
}

export function getTransactionUserName(transaction: Transaction): string {
  if (typeof transaction.metadata.user === 'object' && transaction.metadata.user?.metadata?.full_name) {
    return transaction.metadata.user.metadata.full_name
  }
  return 'Unknown User'
}

export function getTransactionDescription(transaction: Transaction): string {
  return transaction.metadata.description || 'No description'
}

export function getCategoryColor(category: Category): string {
  return category.metadata.color || '#999999'
}

export function getCategoryName(category: Category): string {
  return category.metadata.name || 'Unknown Category'
}

// Type guards for runtime validation
export function isUser(obj: CosmicObject): obj is User {
  return obj.type === 'users'
}

export function isTransaction(obj: CosmicObject): obj is Transaction {
  return obj.type === 'transactions'
}

export function isCategory(obj: CosmicObject): obj is Category {
  return obj.type === 'categories'
}

export function isPopulatedUser(user: User | string): user is User {
  return typeof user === 'object' && user !== null && 'metadata' in user
}

export function isPopulatedCategory(category: Category | string): category is Category {
  return typeof category === 'object' && category !== null && 'metadata' in category
}