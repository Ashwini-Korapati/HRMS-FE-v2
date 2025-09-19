import React from 'react'
import { PageHeading, PlaceholderPanel, TableSkeleton } from './components'

export default function UserTasksAssignedPage() {
  return (
    <div>
      <PageHeading title="Assigned Tasks" subtitle="Tasks delegated specifically to you" />
      <PlaceholderPanel title="Summary">
        <div className="text-xs space-y-2">
          <p>Breakdown by status & priority will appear here.</p>
          <p className="text-neutral-500 dark:text-neutral-400">Can reuse donut / semi-donut graph patterns in future.</p>
        </div>
      </PlaceholderPanel>
      <div className="mt-6">
        <TableSkeleton columns={['Task','Project','Assigned By','Due','Priority','Status']} />
      </div>
    </div>
  )
}
