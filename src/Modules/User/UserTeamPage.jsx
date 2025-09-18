import React from 'react'
import { PageHeading, PlaceholderPanel, TableSkeleton } from './components'

export default function UserTeamPage() {
  return (
    <div>
      <PageHeading title="My Team" subtitle="Colleagues and reporting lines" />
      <PlaceholderPanel title="Org Snapshot">Org chart preview placeholder.</PlaceholderPanel>
      <div className="mt-6">
        <TableSkeleton columns={['Name','Role','Department','Location','Status']} />
      </div>
    </div>
  )
}
