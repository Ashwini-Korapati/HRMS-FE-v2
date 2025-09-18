import React from 'react'
import { PageHeading, PlaceholderPanel, TableSkeleton } from './components'

export default function DesignationsPage() {
  return (
    <div>
      <PageHeading title="Designations" subtitle="Job titles and levels" />
      <PlaceholderPanel title="Levels Framework">Planned competency mapping & leveling.</PlaceholderPanel>
      <div className="mt-6">
        <TableSkeleton columns={['Title', 'Level', 'Department', 'Active']} />
      </div>
    </div>
  )
}
