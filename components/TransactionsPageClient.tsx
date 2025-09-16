'use client'

import { useState } from 'react'
import TransactionForm from '@/components/TransactionForm'
import TransactionsList from '@/components/TransactionsList'
import { Transaction, Category } from '@/types'

export interface TransactionsPageClientProps {
  initialTransactions: Transaction[]
  categories: Category[]
}

export default function TransactionsPageClient({ 
  initialTransactions, 
  categories 
}: TransactionsPageClientProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  const refreshTransactions = async () => {
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch('/api/transactions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions)
      }
    } catch (error) {
      console.error('Failed to refresh transactions:', error)
    }
  }

  const handleTransactionSuccess = () => {
    refreshTransactions()
    setEditingTransaction(null)
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
  }

  const handleDelete = async (transactionId: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return

    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setTransactions(prev => prev.filter(t => t.id !== transactionId))
      } else {
        throw new Error('Failed to delete transaction')
      }
    } catch (error) {
      console.error('Transaction deletion error:', error)
      alert('Failed to delete transaction. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
          Transactions
        </h1>
        <p className="text-text-secondary-light dark:text-text-secondary-dark">
          Manage your income and expenses
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TransactionForm 
          categories={categories} 
          onSuccess={handleTransactionSuccess}
          editTransaction={editingTransaction}
        />
        <TransactionsList 
          transactions={transactions}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  )
}