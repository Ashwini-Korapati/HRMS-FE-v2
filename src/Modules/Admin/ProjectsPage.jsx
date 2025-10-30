import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { PageHeading, TableSkeleton } from './components'
import SmartStatusDonutGraph from '../../components/Graph/SmartStatusDonutGraph'
import { 
  fetchProjectsInsights, 
  selectProjectsInsights, 
  selectProjectsInsightsLoading, 
  selectProjectsInsightsError,
  selectProjects,
  selectProjectsListLoading,
  selectActiveProject,
  selectActiveProjectMembers,
  selectProjectMembersLoading,
  setActiveProject,
  fetchProjects
} from '../../Redux/Public/projectsSlice'

// Create a simple SVG avatar as data URL to avoid external requests
const DEFAULT_AVATAR_SVG = `data:image/svg+xml;base64,${btoa(`
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#f97316"/>
    <circle cx="16" cy="12" r="5" fill="white"/>
    <path d="M16 32C22 32 26 28 26 22H6C6 28 10 32 16 32Z" fill="white"/>
  </svg>
`)}`;

// Base URL for API - adjust according to your environment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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
    <div className={`flex flex-col rounded-lg ${color} bg-white dark:bg-neutral-900 p-3 min-w-[130px] border`}> 
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
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-[10px] font-medium ${cls}`}>
      {label}: <strong className="font-semibold">{value}</strong>
    </span>
  )
}

function ProjectSidebar({ projects, loading, activeProject, onProjectSelect }) {
  return (
    <div className="w-64 bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 h-full p-4">
      <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 mb-3">Projects</h3>
      
      {loading === 'loading' && (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"></div>
          ))}
        </div>
      )}
      
      <div className="space-y-1">
        {projects.map(project => (
          <button
            key={project.id}
            onClick={() => onProjectSelect(project.id)}
            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
              activeProject?.id === project.id
                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
            }`}
          >
            <div className="font-medium truncate">{project.name || 'Unnamed Project'}</div>
            <div className="text-xs text-neutral-500 dark:text-neutral-500 truncate">
              {project.code || 'No code'}
            </div>
          </button>
        ))}
        
        {projects.length === 0 && loading === 'succeeded' && (
          <div className="text-center text-neutral-500 dark:text-neutral-400 text-sm py-4">
            No projects found
          </div>
        )}
      </div>
    </div>
  )
}

// Fixed Avatar Component
function UserAvatar({ src, alt, className = "w-8 h-8" }) {
  const [imgSrc, setImgSrc] = useState(DEFAULT_AVATAR_SVG);

  useEffect(() => {
    if (src) {
      // Build the correct image URL
      let imageUrl = src;
      
      // If it's a relative path (starts with /), prepend the API base URL
      if (src.startsWith('/') && !src.startsWith('http')) {
        imageUrl = `${API_BASE_URL}${src}`;
      }
      
      // Test if the image loads successfully
      const img = new Image();
      img.onload = () => {
        setImgSrc(imageUrl);
      };
      img.onerror = () => {
        console.warn(`Failed to load avatar: ${imageUrl}`);
        setImgSrc(DEFAULT_AVATAR_SVG);
      };
      img.src = imageUrl;
    } else {
      setImgSrc(DEFAULT_AVATAR_SVG);
    }
  }, [src]);

  return (
    <img 
      src={imgSrc}
      alt={alt}
      className={`rounded-full object-cover ${className}`}
      loading="lazy"
      onError={() => setImgSrc(DEFAULT_AVATAR_SVG)}
    />
  );
}

function ProjectMembers({ members, loading }) {
  if (loading === 'loading') {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 animate-pulse"></div>
            <div className="flex-1">
              <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse mb-1"></div>
              <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {members.items.map(member => (
        <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg bg-white dark:bg-neutral-800 border border-orange-500/10 dark:border-orange-500/20">
          <UserAvatar 
            src={member.user?.avatar} 
            alt={member.user?.name || 'User avatar'}
          />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-neutral-700 dark:text-neutral-200 truncate">
              {member.user?.name || 'Unknown User'}
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
              {member.user?.designation?.title || 'No designation'} • {member.role}
            </div>
          </div>
        </div>
      ))}
      
      {members.items.length === 0 && (
        <div className="text-center text-neutral-500 dark:text-neutral-400 text-sm py-4">
          No team members found
        </div>
      )}
    </div>
  )
}

// ProjectDetails Component
function ProjectDetails({ project, members, membersLoading }) {
  if (!project) return null

  return (
    <div className="mt-6 p-4 rounded-lg border border-orange-500/20 dark:border-orange-500/30 bg-white/60 dark:bg-neutral-900/40">
      <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 mb-3">
        Active Project: {project.name}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project Info */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-2">
            Project Details
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-600 dark:text-neutral-400">Code:</span>
              <span className="font-medium text-neutral-700 dark:text-neutral-200">{project.code || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600 dark:text-neutral-400">Status:</span>
              <span className="font-medium">
                <Pill label={project.status} value={project.status} color={
                  project.status === 'PLANNING' ? 'amber' : 
                  project.status === 'ACTIVE' ? 'emerald' : 
                  project.status === 'COMPLETED' ? 'sky' : 'orange'
                } />
              </span>
            </div>
            {project.startDate && (
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Start Date:</span>
                <span className="font-medium text-neutral-700 dark:text-neutral-200">
                  {new Date(project.startDate).toLocaleDateString()}
                </span>
              </div>
            )}
            {project.endDate && (
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">End Date:</span>
                <span className="font-medium text-neutral-700 dark:text-neutral-200">
                  {new Date(project.endDate).toLocaleDateString()}
                </span>
              </div>
            )}
            {project.description && (
              <div className="flex flex-col">
                <span className="text-neutral-600 dark:text-neutral-400 mb-1">Description:</span>
                <span className="font-medium text-neutral-700 dark:text-neutral-200 text-xs">
                  {project.description}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Team Members */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-2">
            Team Members ({members.total})
          </h4>
          <ProjectMembers 
            members={members} 
            loading={membersLoading}
          />
        </div>
      </div>
    </div>
  )
}

// PortfolioStatistics Component
function PortfolioStatistics({ insights, insightsLoading, statusMap, tasksStatusMap }) {
  const summary = insights?.summary || {}
  const tasks = insights?.tasks || {}
  const workload = insights?.workload || {}

  const totalProjects = summary.totalProjects
  const planningCount = statusMap.PLANNING || 0
  const upcomingDeadlines = summary.upcomingDeadlines
  const totalTasks = tasks.totalTasks
  const avgTasksPerProject = tasks.avgTasksPerProject
  const topUsers = workload.topUsers || []

  return (
    <>
      {/* Insights Overview */}
      <div className="mt-4 flex flex-wrap gap-3">
        <StatBox label="Total Projects" value={totalProjects} loading={insightsLoading==='loading'} accent="orange" />
        <StatBox label="Planning" value={planningCount} loading={insightsLoading==='loading'} accent="amber" />
        <StatBox label="Upcoming Deadlines" value={upcomingDeadlines} loading={insightsLoading==='loading'} accent="rose" />
        <StatBox label="Total Tasks" value={totalTasks} loading={insightsLoading==='loading'} accent="sky" />
        <StatBox label="Avg Tasks/Project" value={avgTasksPerProject} loading={insightsLoading==='loading'} accent="emerald" />
      </div>

      {/* Portfolio-wide Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Status Distribution */}
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-2">
              Project Status
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(statusMap).length === 0 && insightsLoading==='succeeded' && 
                <span className="text-[11px] text-neutral-500">No status data.</span>
              }
              {Object.entries(statusMap).map(([k,v]) => (
                <Pill key={k} label={k} value={v} color={
                  k==='PLANNING'?'amber': k==='ACTIVE'?'emerald': k==='COMPLETED'?'sky': 'orange'
                } />
              ))}
            </div>
          </div>

          {/* Task Status Distribution */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-2">
              Task Status
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(tasksStatusMap).length === 0 && insightsLoading==='succeeded' && 
                <span className="text-[11px] text-neutral-500">No task data.</span>
              }
              {Object.entries(tasksStatusMap).map(([k,v]) => (
                <Pill key={k} label={k} value={v} color={
                  k==='DONE'?'sky': k==='IN_PROGRESS'?'emerald': k==='BACKLOG'?'rose':'orange'
                } />
              ))}
            </div>
          </div>
        </div>

        {/* Status Distribution Donut */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-3">
            Status Distribution
          </h3>
          <div className="rounded-lg border border-orange-500/20 dark:border-orange-500/30 bg-white/60 dark:bg-neutral-900/40 p-3 flex justify-center">
            <SmartStatusDonutGraph data={statusMap} size={180} strokeWidth={18} />
          </div>
        </div>
      </div>

      {/* Workload Top Users */}
      <div className="mt-6">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-2">
          Top Contributors
        </h3>
        {topUsers.length === 0 && (
          <div className="text-[11px] text-neutral-500">No contributor data yet.</div>
        )}
        {topUsers.length > 0 && (
          <ul className="space-y-1 text-[11px]">
            {topUsers.map(u => (
              <li key={u.id || u.userId} className="flex items-center justify-between rounded-md bg-white/50 dark:bg-neutral-900/40 border border-orange-500/10 dark:border-orange-500/20 px-2 py-1">
                <span className="text-neutral-600 dark:text-neutral-300 truncate">
                  {u.name || u.fullName || u.email || u.id}
                </span>
                <span className="text-neutral-500 dark:text-neutral-400">
                  {u.count || u.load || u.tasks || 0}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}

// Main ProjectsPage Component
export default function ProjectsPage() {
  const dispatch = useDispatch()
  const insights = useSelector(selectProjectsInsights)
  const insightsLoading = useSelector(selectProjectsInsightsLoading)
  const insightsError = useSelector(selectProjectsInsightsError)
  const projects = useSelector(selectProjects)
  const projectsLoading = useSelector(selectProjectsListLoading)
  const activeProject = useSelector(selectActiveProject)
  const activeMembers = useSelector(selectActiveProjectMembers)
  const membersLoading = useSelector(selectProjectMembersLoading)

  const statusMap = insights?.summary?.projectsByStatus || {}
  const tasksStatusMap = insights?.tasks?.tasksByStatus || {}

  useEffect(() => { 
    // Fetch insights and projects on component mount
    dispatch(fetchProjectsInsights())
    dispatch(fetchProjects())
  }, [dispatch])

  const handleProjectSelect = (projectId) => {
    // Set active project and fetch its members via HTTP
    dispatch(setActiveProject(projectId))
  }

  const handleRefreshData = () => {
    // Manual refresh functionality
    dispatch(fetchProjectsInsights())
    dispatch(fetchProjects())
    if (activeProject) {
      dispatch(setActiveProject(activeProject.id))
    }
  }

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Projects Sidebar */}
      <ProjectSidebar
        projects={projects}
        loading={projectsLoading}
        activeProject={activeProject}
        onProjectSelect={handleProjectSelect}
      />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center">
            <PageHeading title="Projects" subtitle="Project portfolio" />
            <button
              onClick={handleRefreshData}
              className="px-3 py-2 text-xs bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
            >
              Refresh Data
            </button>
          </div>
          
          {/* Active Project Details */}
          <ProjectDetails 
            project={activeProject}
            members={activeMembers}
            membersLoading={membersLoading}
          />

          {/* Portfolio Statistics */}
          <PortfolioStatistics 
            insights={insights}
            insightsLoading={insightsLoading}
            statusMap={statusMap}
            tasksStatusMap={tasksStatusMap}
          />

          {/* Error Handling */}
          {insightsError && (
            <div className="mt-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
              <div className="text-rose-700 dark:text-rose-300 text-sm">
                <strong>Error loading insights:</strong> {insightsError}
              </div>
              <button
                onClick={() => dispatch(fetchProjectsInsights())}
                className="mt-2 px-3 py-1 text-xs bg-rose-500 text-white rounded hover:bg-rose-600"
              >
                Retry
              </button>
            </div>
          )}

          {/* Projects Table Skeleton */}
          <div className="mt-6">
            <TableSkeleton columns={['Project', 'Owner', 'Progress', 'Status']} />
          </div>
        </div>
      </div>
    </div>
  )
}
