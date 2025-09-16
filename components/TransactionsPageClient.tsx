'use client'

import { useState } from 'react'
import { Transaction, Category } from '@/types'
import TransactionForm from './TransactionForm'
import TransactionsList from './TransactionsList'

interface TransactionsPageClientProps {
  initialTransactions: Transaction[]
  categories: Category[]
}

export default function TransactionsPageClient({ 
  initialTransactions, 
  categories 
}: TransactionsPageClientProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  const handleTransactionSuccess = async () => {
    // Refresh transactions from the server
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

    // Clear editing state
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-grid-gap">
      {/* Transaction Form */}
      <div className="lg:col-span-1">
        <TransactionForm 
          categories={categories}
          onSuccess={handleTransactionSuccess}
          editTransaction={editingTransaction}
        />
      </div>

      {/* Transactions List */}
      <div className="lg:col-span-2">
        <TransactionsList 
          transactions={transactions}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  )
}