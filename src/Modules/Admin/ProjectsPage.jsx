import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { PageHeading, TableSkeleton } from './components'
import SmartStatusDonutGraph from '../../components/Graph/SmartStatusDonutGraph'
import { fetchProjectsInsights, selectProjectsInsights, selectProjectsInsightsLoading, selectProjectsInsightsError } from '../../Redux/Public/projectsSlice'

function StatBox({ label, value, loading, accent='orange' }) {
  const color = {
    orange: 'border-orange-500/25 dark:border-orange-500/40',
    sky: 'border-sky-500/25 dark:border-sky-500/40',
    amber: 'border-amber-500/25 dark:border-amber-500/40',
    emerald: 'border-emerald-500/25 dark:border-emerald-500/40',
    fuchsia: 'border-fuchsia-500/25 dark:border-fuchsia-500/40',
    rose: 'border-rose-500/25 dark:border-rose-500/40'
  }[accent] || 'border-orange-500/25 dark:border-orange-500/40'
  return (
    <div className={`flex flex-col rounded-lg ${color} bg-white/60 dark:bg-neutral-900/40 backdrop-blur p-3 min-w-[130px]`}> 
      <span className="text-[10px] uppercase tracking-wide font-medium text-neutral-500 dark:text-neutral-400">{label}</span>
      <span className="mt-1 text-sm font-semibold text-neutral-700 dark:text-neutral-100">{loading ? '…' : (value ?? '—')}</span>
    </div>
  )
}

function Pill({ label, value, color='orange' }) {
  const cls = {
    orange: 'bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400',
    amber: 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400',
    sky: 'bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
    rose: 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400',
    fuchsia: 'bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-600 dark:text-fuchsia-400'
  }[color] || 'bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400'
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-[10px] font-medium ${cls}`}>{label}: <strong className="font-semibold">{value}</strong></span>
  )
}

export default function ProjectsPage() {
  const dispatch = useDispatch()
  const insights = useSelector(selectProjectsInsights)
  const insightsLoading = useSelector(selectProjectsInsightsLoading)
  const insightsError = useSelector(selectProjectsInsightsError)

  useEffect(() => { dispatch(fetchProjectsInsights()) }, [dispatch])

  const summary = insights?.summary || {}
  const tasks = insights?.tasks || {}
  const workload = insights?.workload || {}
  const statusMap = summary.projectsByStatus || {}
  const tasksStatusMap = tasks.tasksByStatus || {}

  const totalProjects = summary.totalProjects
  const planningCount = statusMap.PLANNING || 0
  const upcomingDeadlines = summary.upcomingDeadlines
  const totalTasks = tasks.totalTasks
  const avgTasksPerProject = tasks.avgTasksPerProject
  const topUsers = workload.topUsers || []
  // Data prepared for donut graph (status distribution)

  return (
    <div>
      <PageHeading title="Projects" subtitle="Project portfolio" />
      <div className="mt-4 flex flex-wrap gap-3">
        <StatBox label="Total Projects" value={totalProjects} loading={insightsLoading==='loading'} accent="orange" />
        <StatBox label="Planning" value={planningCount} loading={insightsLoading==='loading'} accent="amber" />
        <StatBox label="Upcoming Deadlines" value={upcomingDeadlines} loading={insightsLoading==='loading'} accent="rose" />
        <StatBox label="Total Tasks" value={totalTasks} loading={insightsLoading==='loading'} accent="sky" />
        <StatBox label="Avg Tasks/Project" value={avgTasksPerProject} loading={insightsLoading==='loading'} accent="emerald" />
      </div>
      {/* Status Distribution */}
      <div className="mt-6">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-2">Project Status</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(statusMap).length === 0 && insightsLoading==='succeeded' && <span className="text-[11px] text-neutral-500">No status data.</span>}
          {Object.entries(statusMap).map(([k,v]) => (
            <Pill key={k} label={k} value={v} color={k==='PLANNING'?'amber': k==='ACTIVE'?'emerald': k==='COMPLETED'?'sky': 'orange'} />
          ))}
        </div>
      </div>
      {/* Task Status Distribution */}
      <div className="mt-6">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-2">Task Status</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(tasksStatusMap).length === 0 && insightsLoading==='succeeded' && <span className="text-[11px] text-neutral-500">No task data.</span>}
          {Object.entries(tasksStatusMap).map(([k,v]) => (
            <Pill key={k} label={k} value={v} color={k==='DONE'?'sky': k==='IN_PROGRESS'?'emerald': k==='BACKLOG'?'rose':'orange'} />
          ))}
        </div>
      </div>
      {/* Status Distribution Donut */}
      <div className="mt-8">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-3">Status Distribution</h3>
        <div className="rounded-lg border border-orange-500/20 dark:border-orange-500/30 bg-white/60 dark:bg-neutral-900/40 p-3 flex">
          <SmartStatusDonutGraph data={statusMap} size={180} strokeWidth={18} />
        </div>
      </div>
      {/* Workload Top Users */}
      <div className="mt-6">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-2">Top Contributors</h3>
        {topUsers.length === 0 && (
          <div className="text-[11px] text-neutral-500">No contributor data yet.</div>
        )}
        {topUsers.length > 0 && (
          <ul className="space-y-1 text-[11px]">
            {topUsers.map(u => (
              <li key={u.id || u.userId} className="flex items-center justify-between rounded-md bg-white/50 dark:bg-neutral-900/40 border border-orange-500/10 dark:border-orange-500/20 px-2 py-1">
                <span className="text-neutral-600 dark:text-neutral-300 truncate">{u.name || u.fullName || u.email || u.id}</span>
                <span className="text-neutral-500 dark:text-neutral-400">{u.count || u.load || u.tasks || 0}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {insightsError && <div className="mt-2 text-xs text-rose-500">{insightsError}</div>}
      {insightsError && insightsLoading!=='loading' && !insights && (
        <div className="mt-3 text-[10px] font-mono p-2 rounded bg-rose-50/80 dark:bg-rose-950/30 border border-rose-300/40 dark:border-rose-800/40 text-rose-600 dark:text-rose-400">Failed to load insights.</div>
      )}
      <div className="mt-6">
        <TableSkeleton columns={['Project', 'Owner', 'Progress', 'Status']} />
      </div>
    </div>
  )
}
