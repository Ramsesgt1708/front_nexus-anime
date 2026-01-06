import type { ReactNode } from 'react'

interface DashboardCardProps {
  title: string
  subtitle?: string
  children: ReactNode
  customHeight?: string
}

function DashboardCard({ title, subtitle, children, customHeight }: DashboardCardProps) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm ring-1 ring-black/5 dark:ring-white/10 p-4 sm:p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        )}
      </div>
      <div className={customHeight || "h-64 sm:h-72 md:h-80"}>
        {children}
      </div>
    </div>
  )
}

export default DashboardCard
