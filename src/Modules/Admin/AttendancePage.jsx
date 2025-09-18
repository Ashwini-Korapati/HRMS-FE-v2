import React from 'react'
import { PageHeading, PlaceholderPanel, TableSkeleton } from './components'

export default function AttendancePage() {
  return (
    <div>
      <PageHeading title="Attendance" subtitle="Daily presence tracking" />
      <PlaceholderPanel title="Geo Check-ins">Upcoming map & shift attendance analytics.</PlaceholderPanel>
      <div className="mt-6">
        <TableSkeleton columns={['Employee', 'Date', 'In', 'Out', 'Status']} />
      </div>
    </div>
  )
}
