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
          <h3 className="card-title">Employee Information Details</h3>
          <p className="card-subtitle">Detailed Information of job seekers</p>
        </div>
        <div className="flex items-center justify-center h-64 text-text-secondary-light dark:text-text-secondary-dark">
          <p>No expense data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <div>
          <h3 className="card-title">Employee Information Details</h3>
          <p className="card-subtitle">Detailed Information of job seekers</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            Search employee, staff...
          </span>
          <button className="p-2 hover:bg-background-light dark:hover:bg-background-dark rounded-card transition-colors">
            <span>🔍</span>
          </button>
        </div>
      </div>
      
      <div className="p-card-padding pt-0">
        {/* Table Header */}
        <div className="grid grid-cols-7 gap-4 py-3 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark border-b border-border-light dark:border-border-dark mb-4">
          <div>Employee ID</div>
          <div>Full Name</div>
          <div>Job Levels</div>
          <div>Monthly Payout</div>
          <div>Overtime Paid</div>
          <div>Status</div>
          <div>Action</div>
        </div>

        {/* Mock Employee Data Rows */}
        <div className="space-y-3">
          {data.slice(0, 5).map((item, index) => (
            <div key={index} className="grid grid-cols-7 gap-4 py-3 text-body items-center hover:bg-background-light dark:hover:bg-background-dark rounded-card transition-colors">
              <div className="text-text-secondary-light dark:text-text-secondary-dark">
                EM-{48772 + index}
              </div>
              <div className="text-text-primary-light dark:text-text-primary-dark font-medium">
                {item.name} Employee
              </div>
              <div className="text-text-secondary-light dark:text-text-secondary-dark">
                Employee
              </div>
              <div className="text-text-primary-light dark:text-text-primary-dark">
                {formatCurrency(item.amount)}
              </div>
              <div className="text-text-secondary-light dark:text-text-secondary-dark">
                14:00
              </div>
              <div>
                <span className={`status-badge ${
                  index % 2 === 0 ? 'status-badge-success' : 'status-badge-danger'
                }`}>
                  {index % 2 === 0 ? 'Paid' : 'Pending'}
                </span>
              </div>
              <div>
                <button className="text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark">
                  ⋮
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}