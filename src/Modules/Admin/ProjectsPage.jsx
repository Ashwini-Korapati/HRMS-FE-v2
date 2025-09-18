import React from 'react'
import { PageHeading, PlaceholderPanel, TableSkeleton } from './components'

export default function ProjectsPage() {
  return (
    <div>
      <PageHeading title="Projects" subtitle="Project portfolio" />
      <PlaceholderPanel title="Utilization">Planned: allocation & workload insights.</PlaceholderPanel>
      <div className="mt-6">
        <TableSkeleton columns={['Project', 'Owner', 'Progress', 'Status']} />
      </div>
    </div>
  )
}
