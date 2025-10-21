import React from 'react'
import { PageHeading, StatGrid, StatCard, PlaceholderPanel } from './components'
import { Users, Folder, CalendarDays, Clock, BarChart3 } from 'lucide-react'
import AnalogClock from '../../components/Prop/AnalogClock'
import DesignationLiveAttendance from '../../components/Prop/DesignationLiveAttendance'
import { useSelector } from 'react-redux'

export default function OverviewPage() {
  const auth = useSelector(s => s.auth)
  const companyId = auth?.company?.id
  const designationId = auth?.user?.designationId || auth?.user?.designation?.id || auth?.user?.designationParentId
  return (
    <div className="flex flex-col gap-8">
      {/* Header + Clock Row */}
      <div className="grid gap-6 xl:grid-cols-3 items-start">
        <div className="space-y-6 xl:col-span-2">
          <PageHeading title="Dashboard" subtitle="Snapshot of key HR metrics" />
          <StatGrid>
            <StatCard label="Employees" value="--" icon={Users} />
            <StatCard label="Departments" value="--" icon={Folder} />
            <StatCard label="Leave Requests" value="--" icon={CalendarDays} />
            <StatCard label="Today Attendance" value="--" icon={Clock} />
          </StatGrid>
        </div>
        <div className="flex justify-center xl:justify-end">
          <AnalogClock />
        </div>
      </div>

      {/* Analytics Panels */}
      <div >
        {companyId && designationId ? (
          <div className="lg:col-span-1">
            <DesignationLiveAttendance 
              designationId={designationId}
              companyId={companyId}
              title="Designation Live Attendance"
            />
          </div>
        ) : (
          <PlaceholderPanel title="Leave Balance">Upcoming aggregated leave balance widget.</PlaceholderPanel>
        )}
      </div>

      <PlaceholderPanel title="Analytics Quick View">
        <div className="flex items-center gap-2 text-neutral-300 text-xs"><BarChart3 size={14} /> Rich analytics widgets will appear here.</div>
      </PlaceholderPanel>
    </div>
  )
}
