import React from 'react'
import { PageHeading, PlaceholderPanel } from './components'
import { BarChart3 } from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <div>
      <PageHeading title="Analytics" subtitle="Data insights & dashboards" />
      <PlaceholderPanel title="Coming Soon">
        <div className="flex items-center gap-2 text-neutral-300 text-xs"><BarChart3 size={14} /> Interactive analytics modules pending implementation.</div>
      </PlaceholderPanel>
    </div>
  )
}
