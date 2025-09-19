import React from 'react'
import { PageHeading, PlaceholderPanel, TableSkeleton } from './components'

export default function UserLeavesHistoryPage() {
  return (
    <div>
      <PageHeading title="Leave History" subtitle="All past leave applications" />
      <PlaceholderPanel title="Filters">
        <div className="text-xs space-y-2">
          <p>Date range, type filters & status chips planned here.</p>
          <p className="text-neutral-500 dark:text-neutral-400">Borrowing subtle panel + grid spacing conventions.</p>
        </div>
      </PlaceholderPanel>
      <div className="mt-6">
        <TableSkeleton columns={['Ref','Type','From','To','Days','Status','Applied On']} />
      </div>
    </div>
  )
}
