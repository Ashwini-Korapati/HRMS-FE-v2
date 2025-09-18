import React from 'react'
import { PageHeading, PlaceholderPanel, TableSkeleton } from './components'

export default function UserAttendancePage() {
  return (
    <div>
      <PageHeading title="My Attendance" subtitle="Your check-ins and working hours" />
      <PlaceholderPanel title="Summary">Graph & metrics placeholder.</PlaceholderPanel>
      <div className="mt-6">
        <TableSkeleton columns={['Date','Check In','Check Out','Hours','Status']} />
      </div>
    </div>
  )
}
