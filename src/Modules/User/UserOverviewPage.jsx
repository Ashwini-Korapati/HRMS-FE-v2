import React from 'react'
import { PageHeading, StatGrid, StatCard, PlaceholderPanel } from './components'
import { LayoutDashboard, Clock, CreditCard, Folder } from 'lucide-react'

export default function UserOverviewPage() {
  return (
    <div>
      <PageHeading title="My Dashboard" subtitle="Personal overview" />
      <StatGrid>
        <StatCard label="Pending Tasks" value={8} icon={LayoutDashboard} />
        <StatCard label="Today's Attendance" value="9:15 AM" icon={Clock} />
        <StatCard label="Last Payroll" value="Aug 2025" icon={CreditCard} />
        <StatCard label="Active Projects" value={3} icon={Folder} />
      </StatGrid>
      <div className="grid lg:grid-cols-2 gap-6">
        <PlaceholderPanel title="Recent Activity">Timeline feed coming soon.</PlaceholderPanel>
        <PlaceholderPanel title="Quick Actions">Shortcut launcher coming soon.</PlaceholderPanel>
      </div>
    </div>
  )
}
