'use client'

import { MonthlyDataItem } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface CashFlowChartProps {
  data: MonthlyDataItem[]
}

export default function CashFlowChart({ data }: CashFlowChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Cash Flow</h3>
          <p className="card-subtitle">Monthly income vs expenses</p>
        </div>
        <div className="flex items-center justify-center h-64 text-text-secondary-light dark:text-text-secondary-dark">
          <p>No data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Cash Flow</h3>
        <p className="card-subtitle">Monthly income vs expenses</p>
      </div>
      
      <div className="p-6 pt-0 space-y-4">
        {data.slice(-6).map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-text-primary-light dark:text-text-primary-dark">
                {item.month}
              </span>
              <span className={`font-medium ${
                item.net >= 0 ? 'text-income' : 'text-expense'
              }`}>
                {formatCurrency(item.net)}
              </span>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-income">Income: {formatCurrency(item.income)}</span>
                <span className="text-expense">Expenses: {formatCurrency(item.expenses)}</span>
              </div>
              
              <div className="relative h-2 bg-background-light dark:bg-background-dark rounded-full overflow-hidden">
                <div 
                  className="absolute left-0 top-0 h-full bg-income rounded-full"
                  style={{ width: `${Math.max((item.income / Math.max(item.income, item.expenses)) * 100, 5)}%` }}
                />
                <div 
                  className="absolute right-0 top-0 h-full bg-expense rounded-full"
                  style={{ width: `${Math.max((item.expenses / Math.max(item.income, item.expenses)) * 100, 5)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}