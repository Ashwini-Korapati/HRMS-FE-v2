import React from 'react'
import { PageHeading, PlaceholderPanel, TableSkeleton } from './components'

export default function PayrollPage() {
  return (
    <div>
      <PageHeading title="Payroll" subtitle="Compensation processing" />
      <PlaceholderPanel title="Upcoming Runs">Automation & approval pipeline coming soon.</PlaceholderPanel>
      <div className="mt-6">
        <TableSkeleton columns={['Run', 'Period', 'Employees', 'Status']} />
      </div>
    </div>
  )
}
