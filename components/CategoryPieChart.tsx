'use client'

import { CategoryBreakdownItem } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface CategoryPieChartProps {
  data: CategoryBreakdownItem[]
}

export default function CategoryPieChart({ data }: CategoryPieChartProps) {
  // If no data, show placeholder
  if (!data || data.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Expense Categories</h3>
          <p className="card-subtitle">Breakdown by category</p>
        </div>
        <div className="flex items-center justify-center h-64 text-text-secondary-light dark:text-text-secondary-dark">
          <p>No expense data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Expense Categories</h3>
        <p className="card-subtitle">Breakdown by category</p>
      </div>
      
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <div>
                <p className="font-medium text-text-primary-light dark:text-text-primary-dark">
                  {item.name}
                </p>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  {item.percentage}% of expenses
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-text-primary-light dark:text-text-primary-dark">
                {formatCurrency(item.amount)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}