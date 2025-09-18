import React from 'react'
import { PageHeading, PlaceholderPanel, TableSkeleton } from './components'

export default function UsersPage() {
  return (
    <div>
      <PageHeading title="Employees" subtitle="Manage employee records" />
      <PlaceholderPanel title="Directory">
        A searchable, filterable employee directory will appear here.
      </PlaceholderPanel>
      <div className="mt-6">
        <TableSkeleton columns={['Name', 'Department', 'Role', 'Status']} />
      </div>
    </div>
  )
}
