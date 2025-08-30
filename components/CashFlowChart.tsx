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
          <h3 className="card-title">Cashflow Report</h3>
          <p className="card-subtitle">Monthly cash flow of company</p>
        </div>
        <div className="flex items-center justify-center h-64 text-text-secondary-light dark:text-text-secondary-dark">
          <p>No data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <div>
          <h3 className="card-title">Cashflow Report</h3>
          <p className="card-subtitle">Monthly cash flow of company</p>
        </div>
        <select className="form-input text-sm w-auto">
          <option>Last Month</option>
          <option>Last 3 Months</option>
          <option>Last 6 Months</option>
        </select>
      </div>
      
      <div className="p-card-padding pt-0 space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-surface-light dark:bg-surface-dark rounded-card mb-2 mx-auto">
              <span className="text-lg">📊</span>
            </div>
            <p className="stats-value text-text-primary-light dark:text-text-primary-dark">
              {formatCurrency(data.reduce((sum, item) => sum + item.income, 0))}
            </p>
            <p className="stats-label">Inventory Valuation</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-surface-light dark:bg-surface-dark rounded-card mb-2 mx-auto">
              <span className="text-lg">💰</span>
            </div>
            <p className="stats-value text-text-primary-light dark:text-text-primary-dark">
              {formatCurrency(data.reduce((sum, item) => sum + item.expenses, 0))}
            </p>
            <p className="stats-label">Payroll Expenses</p>
          </div>
        </div>

        {/* Monthly Breakdown */}
        <div className="space-y-4">
          {data.slice(-6).map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-body font-medium text-text-primary-light dark:text-text-primary-dark">
                  {item.month}
                </span>
                <span className={`text-body font-medium ${
                  item.net >= 0 ? 'text-income' : 'text-expense'
                }`}>
                  {formatCurrency(item.net)}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-income">Income: {formatCurrency(item.income)}</span>
                  <span className="text-expense">Expenses: {formatCurrency(item.expenses)}</span>
                </div>
                
                <div className="relative h-3 bg-background-light dark:bg-background-dark rounded-card overflow-hidden">
                  <div 
                    className="absolute left-0 top-0 h-full bg-income rounded-card"
                    style={{ width: `${Math.max((item.income / Math.max(item.income, item.expenses)) * 100, 5)}%` }}
                  />
                  <div 
                    className="absolute right-0 top-0 h-full bg-expense rounded-card"
                    style={{ width: `${Math.max((item.expenses / Math.max(item.income, item.expenses)) * 100, 5)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}