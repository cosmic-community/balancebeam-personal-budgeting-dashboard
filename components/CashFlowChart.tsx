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
          <h3 className="card-title">Cash Flow Trend</h3>
          <p className="card-subtitle">Monthly income vs expenses</p>
        </div>
        <div className="flex items-center justify-center h-64 text-text-secondary-light dark:text-text-secondary-dark">
          <p>No data available for chart</p>
        </div>
      </div>
    )
  }

  // Get max value for scaling
  const maxValue = Math.max(...data.flatMap(item => [item.income, item.expenses]))
  const maxHeight = 200

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Cash Flow Trend</h3>
        <p className="card-subtitle">Monthly income vs expenses</p>
      </div>
      
      <div className="p-card-padding pt-0">
        {/* Legend */}
        <div className="flex items-center justify-center space-x-6 mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-success rounded"></div>
            <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Income</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-error rounded"></div>
            <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Expenses</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary rounded"></div>
            <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Net</span>
          </div>
        </div>

        {/* Chart */}
        <div className="relative" style={{ height: `${maxHeight + 60}px` }}>
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
              <div 
                key={ratio}
                className="border-t border-border-light dark:border-border-dark opacity-30"
                style={{ 
                  position: 'absolute',
                  top: `${ratio * maxHeight}px`,
                  left: 0,
                  right: 0
                }}
              >
                <span className="absolute -left-12 -top-2 text-xs text-text-secondary-light dark:text-text-secondary-dark">
                  {formatCurrency(maxValue * (1 - ratio))}
                </span>
              </div>
            ))}
          </div>

          {/* Bars */}
          <div className="flex items-end justify-between h-full pt-4 pl-12">
            {data.slice(-6).map((item, index) => {
              const incomeHeight = maxValue > 0 ? (item.income / maxValue) * maxHeight : 0
              const expenseHeight = maxValue > 0 ? (item.expenses / maxValue) * maxHeight : 0
              const netHeight = maxValue > 0 ? (Math.abs(item.net) / maxValue) * maxHeight : 0

              return (
                <div key={index} className="flex flex-col items-center flex-1 max-w-16">
                  {/* Bars container */}
                  <div className="flex items-end space-x-1 mb-2" style={{ height: `${maxHeight}px` }}>
                    {/* Income bar */}
                    <div 
                      className="bg-success rounded-t w-3"
                      style={{ height: `${incomeHeight}px` }}
                      title={`Income: ${formatCurrency(item.income)}`}
                    />
                    {/* Expense bar */}
                    <div 
                      className="bg-error rounded-t w-3"
                      style={{ height: `${expenseHeight}px` }}
                      title={`Expenses: ${formatCurrency(item.expenses)}`}
                    />
                    {/* Net bar */}
                    <div 
                      className={`rounded-t w-3 ${item.net >= 0 ? 'bg-primary' : 'bg-warning'}`}
                      style={{ height: `${netHeight}px` }}
                      title={`Net: ${formatCurrency(item.net)}`}
                    />
                  </div>
                  
                  {/* Month label */}
                  <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark text-center">
                    {item.month}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-border-light dark:border-border-dark">
          <div className="text-center">
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Total Income</p>
            <p className="font-semibold text-success">
              {formatCurrency(data.reduce((sum, item) => sum + item.income, 0))}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Total Expenses</p>
            <p className="font-semibold text-error">
              {formatCurrency(data.reduce((sum, item) => sum + item.expenses, 0))}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Net Total</p>
            <p className={`font-semibold ${
              data.reduce((sum, item) => sum + item.net, 0) >= 0 ? 'text-success' : 'text-error'
            }`}>
              {formatCurrency(data.reduce((sum, item) => sum + item.net, 0))}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}