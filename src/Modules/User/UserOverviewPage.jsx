import React from 'react'
import { PageHeading, StatGrid, StatCard, PlaceholderPanel } from './components'
import { LayoutDashboard, Clock, CreditCard, Folder } from 'lucide-react'
import AnalogClock from '../../components/Prop/AnalogClock'
import DesignationLiveAttendance from '../../components/Prop/DesignationLiveAttendance'
import { useSelector } from 'react-redux'

export default function UserOverviewPage() {
  const auth = useSelector(s => s.auth)
  const companyId = auth?.company?.id
  const designationId = auth?.user?.designationId || auth?.user?.designation?.id || auth?.user?.designationParentId
  return (
    <div>
      <PageHeading title="My Dashboard" subtitle="Personal overview" />
      <StatGrid>
        <StatCard label="Pending Tasks" value={8} icon={LayoutDashboard} />
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="mb-2 text-xs text-gray-500 flex items-center gap-1"><Clock size={14}/> Today's Attendance</div>
            <AnalogClock />
          </div>
        </div>
        <StatCard label="Last Payroll" value="Aug 2025" icon={CreditCard} />
        <StatCard label="Active Projects" value={3} icon={Folder} />
      </StatGrid>
      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          {companyId && designationId ? (
            <DesignationLiveAttendance designationId={designationId} companyId={companyId} title="My Designation Live Attendance" />
          ) : (
            <PlaceholderPanel title="Live Attendance">Sign in to view your designation's live attendance.</PlaceholderPanel>
          )}
        </div>
        <PlaceholderPanel title="Quick Actions">Shortcut launcher coming soon.</PlaceholderPanel>
      </div>
    </div>
  )
}
