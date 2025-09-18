import React from 'react'
import { PageHeading, PlaceholderPanel, TableSkeleton } from './components'

export default function UserLeavesPage() {
  return (
    <div>
      <PageHeading title="My Leaves" subtitle="Leave balances and requests" />
      <PlaceholderPanel title="Balances">Leave balance cards placeholder.</PlaceholderPanel>
      <div className="mt-6">
        <TableSkeleton columns={['Type','Period','Days','Status','Applied On']} />
      </div>
    </div>
  )
}
