import React from 'react'
import { PageHeading, PlaceholderPanel, TableSkeleton } from './components'

export default function HolidaysPage() {
  return (
    <div>
      <PageHeading title="Holidays" subtitle="Company holiday calendar" />
      <PlaceholderPanel title="Calendar Sync">Planned: ICS export & region filters.</PlaceholderPanel>
      <div className="mt-6">
        <TableSkeleton columns={['Date', 'Name', 'Region', 'Active']} />
      </div>
    </div>
  )
}
