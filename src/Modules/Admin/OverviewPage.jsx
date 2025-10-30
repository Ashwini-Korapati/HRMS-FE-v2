

import React from 'react'
import { PageHeading, StatGrid, StatCard, PlaceholderPanel } from './components'
import { Users, Folder, CalendarDays, Clock, BarChart3, Zap, TrendingUp } from 'lucide-react'
import AnalogClock from '../../components/Prop/AnalogClock'
import DesignationLiveAttendance from '../../components/Prop/DesignationLiveAttendance'
import { useSelector } from 'react-redux'

export default function OverviewPage() {
  const auth = useSelector(s => s.auth)
  const companyId = auth?.company?.id
  const designationId = auth?.user?.designationId || auth?.user?.designation?.id || auth?.user?.designationParentId
  
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6  dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-900 min-h-screen">
      {/* Header + Clock Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Left Column - Page Heading and Stats */}
        <div className="xl:col-span-2 space-y-6">
          <div className="space-y-2">
            <PageHeading title="Dashboard" subtitle="Snapshot of key HR metrics" />
          </div>
          
          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-20">
            <div className="bg-gradient-to-br from-orange-500/10 to-rose-500/10 backdrop-blur-lg rounded-2xl p-5 border border-orange-200/40 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] dark:from-orange-500/5 dark:to-rose-500/5 dark:border-orange-700/30 group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl flex items-center justify-center shadow-md">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-4 h-4 text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="text-3xl font-bold text-slate-800 dark:text-white mb-1">--</div>
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">Employees</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Total team members</div>
            </div>

            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-lg rounded-2xl p-5 border border-blue-200/40 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] dark:from-blue-500/5 dark:to-cyan-500/5 dark:border-blue-700/30 group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
                  <Folder className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="text-3xl font-bold text-slate-800 dark:text-white mb-1">--</div>
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">Departments</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Organized teams</div>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-lg rounded-2xl p-5 border border-green-200/40 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] dark:from-green-500/5 dark:to-emerald-500/5 dark:border-green-700/30 group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
                  <CalendarDays className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-4 h-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="text-3xl font-bold text-slate-800 dark:text-white mb-1">--</div>
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">Leave Requests</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Pending approval</div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-lg rounded-2xl p-5 border border-purple-200/40 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] dark:from-purple-500/5 dark:to-pink-500/5 dark:border-purple-700/30 group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-4 h-4 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="text-3xl font-bold text-slate-800 dark:text-white mb-1">--</div>
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">Today Attendance</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Present employees</div>
            </div>
          </div>
        </div>

        {/* Right Column - Analog Clock - Properly Aligned */}
        <div className="flex justify-center xl:justify-end">
          <div className="w-full max-w-[280px] bg-gradient-to-br from-slate-100/80 to-blue-100/50 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/60 shadow-lg dark:from-neutral-800/80 dark:to-blue-900/20 dark:border-neutral-700/50">
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Current Time</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Local Time Zone</p>
            </div>
            <div className="flex justify-center mb-4">
              <div className="w-48 h-48 bg-white dark:bg-neutral-800 rounded-full shadow-inner border border-slate-200/50 dark:bg-neutral-800 dark:border-neutral-600/50 flex items-center justify-center">
                <AnalogClock />
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                {new Date().toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true 
                })}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Attendance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Live Attendance */}
        <div className="lg:col-span-2">
          {companyId && designationId ? (
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-slate-200/50 shadow-sm dark:bg-neutral-800/80 dark:border-neutral-700/50 p-6 h-full">
              <DesignationLiveAttendance 
                designationId={designationId}
                companyId={companyId}
                title="Designation Live Attendance"
                className="h-full"
              />
            </div>
          ) : (
            <PlaceholderPanel 
              title="Live Attendance" 
              className="h-full flex items-center justify-center min-h-[300px] bg-white/80 backdrop-blur-lg border border-slate-200/50 dark:bg-neutral-800/80 dark:border-neutral-700/50"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md dark:from-orange-900/20 dark:to-rose-900/20">
                  <Clock className="w-10 h-10 text-orange-500 dark:text-orange-400" />
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-base justify-center mb-2 font-medium">
                  <Clock size={18} />
                  Attendance data unavailable
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-500 max-w-md">
                  Designation information required to show live attendance tracking
                </p>
              </div>
            </PlaceholderPanel>
          )}
        </div>

        {/* Side Panel - Leave Balance */}
        {/* <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 backdrop-blur-lg rounded-2xl p-6 border border-blue-200/40 shadow-sm h-full min-h-[300px] flex flex-col dark:from-blue-500/5 dark:to-cyan-500/5 dark:border-blue-700/30">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Leave Balance</h3>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md dark:from-blue-900/20 dark:to-cyan-900/20">
                  <CalendarDays className="w-10 h-10 text-blue-500 dark:text-blue-400" />
                </div>
                <p className="text-base text-slate-600 dark:text-slate-400 mb-2 font-medium">
                  Leave Management
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  Comprehensive leave tracking
                </p>
              </div>
            </div>
          </div>
        </div> */}
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 backdrop-blur-lg rounded-2xl p-6 border border-purple-200/40 shadow-sm min-h-[200px] dark:from-purple-500/5 dark:to-pink-500/5 dark:border-purple-700/30">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Analytics Quick View</h3>
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md dark:from-purple-900/20 dark:to-pink-900/20">
                <BarChart3 className="w-7 h-7 text-purple-500 dark:text-purple-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                  Rich analytics widgets
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  Performance metrics and insights
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 backdrop-blur-lg rounded-2xl p-6 border border-green-200/40 shadow-sm min-h-[200px] dark:from-green-500/5 dark:to-emerald-500/5 dark:border-green-700/30">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Quick Actions</h3>
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md dark:from-green-900/20 dark:to-emerald-900/20">
                <Zap className="w-7 h-7 text-green-500 dark:text-green-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                  Quick access to actions
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  Employee management shortcuts
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
