import React from 'react'
import { PageHeading, PlaceholderPanel, TableSkeleton } from './components'

export default function DepartmentsPage() {
  return (
    <div>
      <PageHeading title="Departments" subtitle="Organizational structure" />
      <PlaceholderPanel title="Hierarchy">Visual department org chart planned.</PlaceholderPanel>
      <div className="mt-6">
        <TableSkeleton columns={['Department', 'Head', 'Employees', 'Active']} />
      </div>
    </div>
  )
}
