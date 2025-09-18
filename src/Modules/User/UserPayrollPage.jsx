import React from 'react'
import { PageHeading, PlaceholderPanel, TableSkeleton } from './components'

export default function UserPayrollPage() {
  return (
    <div>
      <PageHeading title="My Payroll" subtitle="Salary and payout history" />
      <PlaceholderPanel title="Latest Payslip">Payslip summary placeholder.</PlaceholderPanel>
      <div className="mt-6">
        <TableSkeleton columns={['Month','Gross','Net','Status','Download']} />
      </div>
    </div>
  )
}
