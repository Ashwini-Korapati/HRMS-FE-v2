import React from 'react'
import { PageHeading, StatGrid, StatCard, PlaceholderPanel } from './components'
import { Users, Folder, CalendarDays, Clock, BarChart3 } from 'lucide-react'

export default function OverviewPage() {
  return (
    <div>
      <PageHeading title="Dashboard" subtitle="Snapshot of key HR metrics" />
      <StatGrid>
        <StatCard label="Employees" value="--" icon={Users} />
        <StatCard label="Departments" value="--" icon={Folder} />
        <StatCard label="Leave Requests" value="--" icon={CalendarDays} />
        <StatCard label="Today Attendance" value="--" icon={Clock} />
      </StatGrid>
      <div className="grid gap-6 lg:grid-cols-3 mb-10">
        <PlaceholderPanel title="Headcount Trend">Coming soon: charts summarizing growth.</PlaceholderPanel>
        <PlaceholderPanel title="Attendance Heat">Planned: visualization of check-ins.</PlaceholderPanel>
        <PlaceholderPanel title="Leave Balance">Upcoming aggregated leave balance widget.</PlaceholderPanel>
      </div>
      <PlaceholderPanel title="Analytics Quick View">
        <div className="flex items-center gap-2 text-neutral-300 text-xs"><BarChart3 size={14} /> Rich analytics widgets will appear here.</div>
      </PlaceholderPanel>
    </div>
  )
}
