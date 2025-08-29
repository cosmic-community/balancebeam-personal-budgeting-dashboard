'use client'

import { MonthlyDataItem } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface CashFlowChartProps {
  data: MonthlyDataItem[]
}

export default function CashFlowChart({ data }: CashFlowChartProps) {
  // If no data, show placeholder
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

  // Find the maximum value for scaling
  const maxValue = Math.max(
    ...data.map(item => Math.max(item.income, item.expenses))
  )

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Cash Flow</h3>
        <p className="card-subtitle">Monthly income vs expenses</p>
      </div>
      
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-text-primary-light dark:text-text-primary-dark">
                {item.month}
              </span>
              <span className={`font-medium ${
                item.net >= 0 ? 'text-success' : 'text-error'
              }`}>
                {formatCurrency(item.net)}
              </span>
            </div>
            
            <div className="space-y-1">
              {/* Income Bar */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-success w-16">Income</span>
                <div className="flex-1 bg-surface-light dark:bg-surface-dark rounded-full h-2">
                  <div 
                    className="bg-success h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(item.income / maxValue) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-success w-20 text-right">
                  {formatCurrency(item.income)}
                </span>
              </div>
              
              {/* Expenses Bar */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-error w-16">Expenses</span>
                <div className="flex-1 bg-surface-light dark:bg-surface-dark rounded-full h-2">
                  <div 
                    className="bg-error h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(item.expenses / maxValue) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-error w-20 text-right">
                  {formatCurrency(item.expenses)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}