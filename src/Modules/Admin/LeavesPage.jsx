import React from 'react'
import { PageHeading, PlaceholderPanel, TableSkeleton } from './components'

export default function LeavesPage() {
  return (
    <div>
      <PageHeading title="Leaves" subtitle="Leave requests & policies" />
      <PlaceholderPanel title="Policy Summary">Configuration UI for leave policies pending.</PlaceholderPanel>
      <div className="mt-6">
        <TableSkeleton columns={['Employee', 'Type', 'From', 'To', 'Status']} />
      </div>
    </div>
  )
}
