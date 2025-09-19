import React, { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  fetchProjects, 
  deleteProject, 
  deleteProjectsBulk, 
  selectProjects, 
  selectProjectsListLoading, 
  selectProjectsListError, 
  selectProjectDeleting,
  selectProjectsPagination
} from '../../Redux/Public/projectsSlice'
import { Trash2, RefreshCw, FolderKanban, CheckSquare, Square, Calendar, DollarSign, User as UserIcon } from 'lucide-react'

function ToolbarButton({ icon: Icon, children, disabled, onClick, variant = 'default' }) {
  const base = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-colors'
  const styles = variant === 'danger'
    ? 'border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20'
    : 'border-orange-500/40 bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20'
  return (
    <button disabled={disabled} onClick={onClick} className={`${base} ${styles} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      {Icon && <Icon size={14} />}{children}
    </button>
  )
}

export default function ProjectsListPage() {
  const dispatch = useDispatch()
  const projects = useSelector(selectProjects)
  const loading = useSelector(selectProjectsListLoading)
  const listError = useSelector(selectProjectsListError)
  const deleting = useSelector(selectProjectDeleting)
  const pagination = useSelector(selectProjectsPagination)
  const [selectedIds, setSelectedIds] = useState(() => new Set())

  useEffect(() => {
    dispatch(fetchProjects())
  }, [dispatch])

  const allSelected = useMemo(() => projects.length > 0 && selectedIds.size === projects.length, [projects, selectedIds])

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds(new Set())
    else setSelectedIds(new Set(projects.map(p => p.id)))
  }

  const handleBulkDelete = () => {
    if (!selectedIds.size) return
    dispatch(deleteProjectsBulk(Array.from(selectedIds))).then(() => setSelectedIds(new Set()))
  }

  const statusColor = (status) => {
    switch ((status || '').toUpperCase()) {
      case 'PLANNING': return 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
      case 'ACTIVE': return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
      case 'ON_HOLD': return 'bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-600 dark:text-fuchsia-400'
      case 'COMPLETED': return 'bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400'
      default: return 'bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400'
    }
  }

  const total = pagination?.total || projects.length
  const page = pagination?.page || 1
  const pages = pagination?.pages || 1
  const limit = pagination?.limit || projects.length || 0

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold bg-gradient-to-r from-orange-400 via-rose-400 to-fuchsia-400 bg-clip-text text-transparent">Projects</h1>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-3">
            <span>Total: <strong>{total}</strong></span>
            {pagination && <span>Page {page} of {pages}</span>}
            {pagination && <span>Showing {(page - 1) * limit + 1}-{Math.min(page * limit, total)}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <ToolbarButton icon={RefreshCw} disabled={loading === 'loading'} onClick={() => dispatch(fetchProjects())}>Refresh</ToolbarButton>
          <ToolbarButton icon={Trash2} variant="danger" disabled={!selectedIds.size || deleting === 'loading'} onClick={handleBulkDelete}>Delete Selected</ToolbarButton>
        </div>
      </div>

      {listError && <div className="text-xs text-rose-500">{listError}</div>}

      <div className="rounded-xl border border-orange-500/20 dark:border-orange-500/30 bg-white/60 dark:bg-neutral-900/40 backdrop-blur overflow-hidden">
        <div className="grid text-[11px] font-medium uppercase tracking-wide text-neutral-600 dark:text-neutral-400 bg-neutral-100/60 dark:bg-neutral-900/60" style={{ gridTemplateColumns: '40px 1.2fr 1fr 0.9fr 0.9fr 0.8fr 0.8fr 120px' }}>
          <div className="px-2 py-2 flex items-center justify-center">
            <button onClick={toggleSelectAll} className="text-orange-600 dark:text-orange-400">
              {allSelected ? <CheckSquare size={14} /> : <Square size={14} />}
            </button>
          </div>
          <div className="px-2 py-2">Name</div>
            <div className="px-2 py-2">Code</div>
            <div className="px-2 py-2">Status</div>
            <div className="px-2 py-2">Owner</div>
            <div className="px-2 py-2">Dates</div>
            <div className="px-2 py-2">Folders</div>
            <div className="px-2 py-2 text-right pr-4">Actions</div>
        </div>
        {loading === 'loading' && (
          <div className="p-4 text-xs text-neutral-500 animate-pulse">Loading projects…</div>
        )}
        {loading === 'succeeded' && projects.length === 0 && (
            <div className="p-4 text-xs text-neutral-500">No projects found.</div>
        )}
        {loading === 'succeeded' && projects.map(p => {
          const owner = p.createdBy || p.owner || null
          const foldersCount = Array.isArray(p.folders) ? p.folders.length : (p.folderCount || 0)
          const start = p.startDate ? new Date(p.startDate) : null
          const end = p.endDate ? new Date(p.endDate) : null
          const dateFmt = (d) => d ? d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'
          return (
            <div key={p.id} className="grid items-center text-xs border-t border-neutral-200 dark:border-neutral-800/60 hover:bg-orange-500/5 dark:hover:bg-orange-500/10 transition-colors" style={{ gridTemplateColumns: '40px 1.2fr 1fr 0.9fr 0.9fr 0.8fr 0.8fr 120px' }}>
              <div className="px-2 py-2 flex items-center justify-center">
                <button onClick={() => toggleSelect(p.id)} className="text-orange-600 dark:text-orange-400">
                  {selectedIds.has(p.id) ? <CheckSquare size={14} /> : <Square size={14} />}
                </button>
              </div>
              <div className="px-2 py-2 flex items-center gap-2"><FolderKanban size={14} className="text-orange-500" /> <span className="font-medium text-neutral-700 dark:text-neutral-200 truncate">{p.name}</span></div>
              <div className="px-2 py-2 text-neutral-500 dark:text-neutral-400 truncate">{p.projectCode || '—'}</div>
              <div className="px-2 py-2">
                <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-medium border ${statusColor(p.status)}`}>{p.status || '—'}</span>
              </div>
              <div className="px-2 py-2 flex items-center gap-1 text-neutral-600 dark:text-neutral-300 truncate">
                <UserIcon size={12} className="text-orange-500" />
                <span>{owner ? (owner.firstName ? owner.firstName + (owner.lastName ? ' ' + owner.lastName : '') : owner.email || '—') : '—'}</span>
              </div>
              <div className="px-2 py-2 flex flex-col gap-0.5 text-[10px] text-neutral-500 dark:text-neutral-400">
                <span className="inline-flex items-center gap-1"><Calendar size={12} /> {dateFmt(start)} → {dateFmt(end)}</span>
                {p.budget && <span className="inline-flex items-center gap-1"><DollarSign size={12} /> {p.budget}{p.currency ? ' ' + p.currency : ''}</span>}
              </div>
              <div className="px-2 py-2 text-neutral-600 dark:text-neutral-300">{foldersCount}</div>
              <div className="px-2 py-2 flex items-center justify-end gap-2 pr-4">
                <button onClick={() => dispatch(deleteProject(p.id))} className="text-rose-500 hover:text-rose-400" title="Delete"><Trash2 size={14} /></button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
