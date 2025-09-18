import React from 'react'
import { PageHeading, PlaceholderPanel, TableSkeleton } from './components'

export default function TasksPage() {
  return (
    <div>
      <PageHeading title="Tasks" subtitle="Task assignments" />
      <PlaceholderPanel title="Kanban / Board View">Future board & timeline integration.</PlaceholderPanel>
      <div className="mt-6">
        <TableSkeleton columns={['Task', 'Assignee', 'Due', 'Status']} />
      </div>
    </div>
  )
}
