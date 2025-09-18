import React from 'react'
import { PageHeading, PlaceholderPanel, TableSkeleton } from './components'

export default function UserTasksPage() {
  return (
    <div>
      <PageHeading title="My Tasks" subtitle="Assigned tasks and progress" />
      <PlaceholderPanel title="Progress Summary">Progress widget placeholder.</PlaceholderPanel>
      <div className="mt-6">
        <TableSkeleton columns={['Task','Project','Due','Priority','Status']} />
      </div>
    </div>
  )
}
