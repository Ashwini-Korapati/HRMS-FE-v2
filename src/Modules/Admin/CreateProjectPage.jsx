import React, { useState, useMemo } from 'react'
import SmartCreateProjectForm from '../../components/Forms/SmartCreateProjectForm'
import { Hash, CalendarRange, Layers, Folder as FolderIcon, Copy, Check, FileCode2, BadgeInfo } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { setLastCreatedFull, selectLastCreatedFull } from '../../Redux/Public/projectsSlice'

// Small pill badge component
function Badge({ children, color = 'neutral' }) {
  const map = {
    neutral: 'bg-neutral-200/70 text-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-300',
    success: 'bg-emerald-200/70 text-emerald-700 dark:bg-emerald-600/20 dark:text-emerald-400',
    info: 'bg-cyan-200/70 text-cyan-700 dark:bg-cyan-600/20 dark:text-cyan-400',
    warn: 'bg-amber-200/70 text-amber-800 dark:bg-amber-600/20 dark:text-amber-400',
    danger: 'bg-rose-200/70 text-rose-700 dark:bg-rose-600/20 dark:text-rose-400'
  }
  return <span className={`px-2 py-0.5 rounded-lg text-[10px] font-medium tracking-wide ${map[color] || map.neutral}`}>{children}</span>
}

// Simple stat card (inspired by PrimaryHorizantalCard styling tokens)
function StatCard({ icon: Icon, label, value, accent = 'orange' }) {
  const accentClasses = {
    orange: 'text-orange-600 dark:text-orange-400 bg-orange-500/10 ring-orange-400/30',
    cyan: 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 ring-cyan-400/30',
    rose: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 ring-rose-400/30',
    violet: 'text-violet-600 dark:text-violet-400 bg-violet-500/10 ring-violet-400/30'
  }
  return (
    <div className="rounded-xl border border-white/40 dark:border-neutral-800/80 bg-white/70 dark:bg-neutral-900/40 backdrop-blur p-4 flex items-center gap-3 shadow-sm">
      <span className={`w-11 h-11 rounded-xl grid place-items-center ring-1 ${accentClasses[accent]}`}>{Icon && <Icon size={18} />}</span>
      <div className="flex flex-col">
        <span className="text-[11px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">{label}</span>
        <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 break-all">{value}</span>
      </div>
    </div>
  )
}

function buildFolderTree(folders) {
  const byParent = new Map()
  folders.forEach(f => {
    const p = f.parentId || 'root'
    if (!byParent.has(p)) byParent.set(p, [])
    byParent.get(p).push(f)
  })
  const build = (parentId) => (byParent.get(parentId) || []).map(node => ({ ...node, children: build(node.id) }))
  return build('root')
}

function FolderTree({ nodes, depth = 0 }) {
  return (
    <ul className={depth === 0 ? 'space-y-1 text-xs' : 'pl-3 space-y-1 border-l border-neutral-300/40 dark:border-neutral-700/60'}>
      {nodes.map(n => (
        <li key={n.id} className="group">
          <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 bg-neutral-100/60 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/60 hover:border-orange-400/50 transition-colors">
            <FolderIcon size={14} className="text-orange-500/80" />
            <span className="text-neutral-700 dark:text-neutral-300 font-medium">{n.name}</span>
            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 tracking-wide">{n.path}</span>
          </div>
          {!!n.children.length && <FolderTree nodes={n.children} depth={depth + 1} />}
        </li>
      ))}
    </ul>
  )
}

export default function CreateProjectPage() {
  const dispatch = useDispatch()
  const lastCreatedFull = useSelector(selectLastCreatedFull)
  const [copied, setCopied] = useState(false)
  const project = lastCreatedFull?.project
  const folders = useMemo(() => lastCreatedFull?.folders || [], [lastCreatedFull])
  const mode = lastCreatedFull?.mode

  const tree = useMemo(() => (folders.length ? buildFolderTree(folders) : []), [folders])

  const statusColor = (status) => {
    if (!status) return 'neutral'
    if (['PLANNING','NEW','INIT'].includes(status)) return 'info'
    if (['ACTIVE','IN_PROGRESS','RUNNING'].includes(status)) return 'success'
    if (['ON_HOLD','PAUSED'].includes(status)) return 'warn'
    if (['CANCELLED','ARCHIVED','FAILED'].includes(status)) return 'danger'
    return 'neutral'
  }

  const formatDate = (d) => {
    try { return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) } catch { return d }
  }

  const handleCopy = (val) => {
    if (!val) return
    navigator.clipboard.writeText(val).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    }).catch(() => {})
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-lg font-semibold bg-gradient-to-r from-orange-400 via-rose-400 to-fuchsia-400 bg-clip-text text-transparent">Create Project</h1>
        {project && <Badge color="success">Created • {project.status}</Badge>}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* Form Card */}
        <div className="rounded-2xl border border-orange-500/30 bg-white/60 dark:bg-neutral-900/40 backdrop-blur p-4 md:p-6 shadow-sm">
          <SmartCreateProjectForm onCreated={(payload) => {
            // Normalize shape to { project, folders?, mode? }
            const full = payload?.project ? payload : (payload?.data?.project ? payload.data : { project: payload })
            // eslint-disable-next-line no-console
            console.log('Admin created project', full)
            dispatch(setLastCreatedFull(full))
          }} />
        </div>

        {/* Result Preview */}
        {project && (
          <div className="space-y-4 animate-slide-up">
            <div className="rounded-2xl border border-neutral-300/50 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/50 backdrop-blur p-4 md:p-5">          
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
                    <Layers size={14} className="text-orange-500" /> {project.name}
                  </h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-md leading-relaxed">{project.description || 'No description provided.'}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge color={statusColor(project.status)}>{project.status}</Badge>
                    {mode && <Badge color="info">Mode: {mode}</Badge>}
                    {project.currency && <Badge color="neutral">{project.currency}</Badge>}
                    {project.isActive === false && <Badge color="warn">Inactive</Badge>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(project.projectCode)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium border border-orange-500/40 bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20 transition-colors"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Code'}
                </button>
              </div>

              <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard icon={Hash} label="Project Code" value={project.projectCode} accent="orange" />
                <StatCard icon={CalendarRange} label="Start" value={formatDate(project.startDate)} accent="cyan" />
                <StatCard icon={CalendarRange} label="End" value={formatDate(project.endDate)} accent="rose" />
                <StatCard icon={FileCode2} label="Created" value={formatDate(project.createdAt)} accent="violet" />
                <StatCard icon={BadgeInfo} label="Updated" value={formatDate(project.updatedAt)} accent="cyan" />
                <StatCard icon={Layers} label="Root Folder" value={project.rootFolderId || '—'} accent="orange" />
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-300/50 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/50 backdrop-blur p-4 md:p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400 mb-3 flex items-center gap-2"><FolderIcon size={14} className="text-orange-500" /> Project Folders</h3>
              {tree.length === 0 ? (
                <div className="text-xs text-neutral-500 dark:text-neutral-500">No folders returned.</div>
              ) : (
                <FolderTree nodes={tree} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
