import React from 'react'
import { PageHeading, PlaceholderPanel, TableSkeleton } from './components'

export default function ReportsPage() {
  return (
    <div>
      <PageHeading title="Reports" subtitle="Operational & compliance reports" />
      <PlaceholderPanel title="Report Builder">Planned custom report designer.</PlaceholderPanel>
      <div className="mt-6">
        <TableSkeleton columns={['Name', 'Category', 'Created', 'Status']} />
      </div>
    </div>
  )
}
