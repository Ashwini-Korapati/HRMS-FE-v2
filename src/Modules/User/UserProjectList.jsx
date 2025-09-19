import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProjects, selectProjects, selectProjectsListLoading, selectProjectsListError } from '../../Redux/Public/projectsSlice'
import { FolderKanban, RefreshCw } from 'lucide-react'

export default function UserProjectList() {
  const dispatch = useDispatch()
  const projects = useSelector(selectProjects)
  const loading = useSelector(selectProjectsListLoading)
  const error = useSelector(selectProjectsListError)

  useEffect(() => { dispatch(fetchProjects()) }, [dispatch])

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-lg font-semibold bg-gradient-to-r from-orange-400 via-rose-400 to-fuchsia-400 bg-clip-text text-transparent">My Projects</h1>
        <button onClick={() => dispatch(fetchProjects())} disabled={loading === 'loading'} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border border-orange-500/40 bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20 disabled:opacity-50">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>
      {error && <div className="text-xs text-rose-500">{error}</div>}
      <div className="rounded-xl border border-orange-500/20 dark:border-orange-500/30 bg-white/60 dark:bg-neutral-900/40 backdrop-blur overflow-hidden">
        <div className="grid text-[11px] font-medium uppercase tracking-wide text-neutral-600 dark:text-neutral-400 bg-neutral-100/60 dark:bg-neutral-900/60" style={{ gridTemplateColumns: '1.4fr 1fr 1fr' }}>
          <div className="px-2 py-2">Name</div>
          <div className="px-2 py-2">Code</div>
          <div className="px-2 py-2">Status</div>
        </div>
        {loading === 'loading' && <div className="p-4 text-xs text-neutral-500 animate-pulse">Loading…</div>}
        {loading === 'succeeded' && projects.length === 0 && <div className="p-4 text-xs text-neutral-500">You have no projects.</div>}
        {loading === 'succeeded' && projects.map(p => (
          <div key={p.id} className="grid items-center text-xs border-t border-neutral-200 dark:border-neutral-800/60 hover:bg-orange-500/5 dark:hover:bg-orange-500/10 transition-colors" style={{ gridTemplateColumns: '1.4fr 1fr 1fr' }}>
            <div className="px-2 py-2 flex items-center gap-2"><FolderKanban size={14} className="text-orange-500" /> <span className="font-medium text-neutral-700 dark:text-neutral-200 truncate">{p.name}</span></div>
            <div className="px-2 py-2 text-neutral-500 dark:text-neutral-400 truncate">{p.projectCode || '—'}</div>
            <div className="px-2 py-2"><span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-medium bg-orange-500/10 border border-orange-500/30 text-orange-600 dark:text-orange-400">{p.status || '—'}</span></div>
          </div>
        ))}
      </div>
    </div>
  )
}
