import React from 'react'
import { PageHeading, PlaceholderPanel, TableSkeleton } from './components'

export default function AnnouncementsPage() {
  return (
    <div>
      <PageHeading title="Announcements" subtitle="Internal communication" />
      <PlaceholderPanel title="Recent Posts">Coming soon: rich announcement editor.</PlaceholderPanel>
      <div className="mt-6">
        <TableSkeleton columns={['Title', 'Audience', 'Published', 'Status']} />
      </div>
    </div>
  )
}
