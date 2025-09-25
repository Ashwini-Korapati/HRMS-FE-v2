import React, {  useState } from 'react'
import {FolderKanban, FolderTree as FolderTreeIcon, ChevronDown, ChevronRight, MoreVertical } from 'lucide-react'
import { useSelector } from 'react-redux'
import {
  selectProjects
} from '../../Redux/Public/projectsSlice'



// Folder tree node (only one depth level in sample, but supports deeper)
function FolderNode({ node, depth = 0, onAction }) {
  const [open, setOpen] = useState(true)
  const [menu, setMenu] = useState(false)
  const hasChildren = Array.isArray(node.children) && node.children.length > 0
  const actions = node.kebabActions || node.permissionActions || []
  return (
    <div className="relative">
      <div
        className="flex items-center gap-1 text-[11px] px-1 py-1 rounded-md hover:bg-orange-500/10 cursor-default group"
        style={{ paddingLeft: depth * 10 + 4 }}
      >
        {hasChildren ? (
          <button
            onClick={() => setOpen(o => !o)}
            className="p-0.5 rounded hover:bg-orange-500/20 text-orange-600 dark:text-orange-400"
            title={open ? 'Collapse' : 'Expand'}
          >
            {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
        ) : (
          <span style={{ width: 16 }} />
        )}
        <FolderKanban size={12} className="text-orange-500/80" />
        <span className="truncate text-neutral-700 dark:text-neutral-300 flex-1">{node.name || node.title}</span>
        {node.folderType === 'system' && (
          <span className="ml-1 text-[9px] px-1 rounded bg-neutral-500/10 text-neutral-500">sys</span>
        )}
        {actions.length > 0 && (
          <button
            onClick={() => setMenu(m => !m)}
            className="p-0.5 rounded hover:bg-orange-500/20 text-orange-600 dark:text-orange-400"
            title="Actions"
          >
            <MoreVertical size={12} />
          </button>
        )}
      </div>
      {menu && actions.length > 0 && (
        <div className="absolute z-10 left-6 top-6 min-w-[140px] rounded-lg border border-orange-500/30 bg-white/95 dark:bg-neutral-900/95 shadow-lg backdrop-blur p-1 flex flex-col gap-0.5">
          {actions.map(a => (
            <button
              key={a}
              onClick={() => { onAction?.(a, node); setMenu(false) }}
              className="text-[11px] text-left px-2 py-1 rounded-md hover:bg-orange-500/10 text-neutral-700 dark:text-neutral-200"
            >{a.replace(/_/g,' ')}</button>
          ))}
        </div>
      )}
      {hasChildren && open && (
        <div className="mt-0.5">
          {node.children.map(ch => (
            <FolderNode key={ch.id} node={ch} depth={depth + 1} onAction={onAction} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function SmartRightBarSection({
  onCreate,
  onRefreshList,
  listLoading,
  selectedProject, // optional: currently focused project
  onProjectClick,  // (project) => void
  onFolderClick    // ({ project, folder }) => void
}) {

  const projects = useSelector(selectProjects)




  const [openProjects, setOpenProjects] = useState(() => new Set())
  const toggleProject = (id) => {
    setOpenProjects(s => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id); else n.add(id)
      return n
    })
  }
  const handleFolderAction = (action, folder) => {
    // Placeholder handlers
    console.log('Folder action:', action, folder.id)
  }

  return (
    <aside className="space-y-6">

      {/* All Projects & Folders */}
      <div className="rounded-2xl border border-orange-500/30 bg-white/70 dark:bg-neutral-900/50 backdrop-blur p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400 flex items-center gap-1"><FolderTreeIcon size={12} className="text-orange-500" /> Projects & Folders</h3>
          <span className="text-[10px] text-neutral-500 dark:text-neutral-400">{projects.length}</span>
        </div>
        {projects.length === 0 && (
          <div className="text-[11px] text-neutral-500">No projects.</div>
        )}
        {projects.length > 0 && (
          <div className="max-h-64 overflow-auto pr-1 custom-scrollbar space-y-1">
            {projects.map(p => {
              const isOpen = openProjects.has(p.id)
              const folderTree = Array.isArray(p.folderTree) ? p.folderTree : []
              const totalFolders = p.folderCounts?.total ?? folderTree.length
              return (
                <div key={p.id} className="rounded-md border border-orange-500/20 dark:border-orange-500/30 bg-white/60 dark:bg-neutral-900/40">
                  <button
                    onClick={() => {
                      toggleProject(p.id)
                      onProjectClick?.(p)
                    }}
                    className="w-full flex items-center gap-2 text-left px-2 py-1.5 hover:bg-orange-500/10 rounded-t-md"
                  >
                    {isOpen ? <ChevronDown size={12} className="text-orange-500" /> : <ChevronRight size={12} className="text-orange-500" />}
                    <span className="text-[11px] font-medium text-neutral-700 dark:text-neutral-200 truncate flex-1">{p.name}</span>
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400">{totalFolders}</span>
                  </button>
                  {isOpen && folderTree.length > 0 && (
                    <div className="pb-1">
                      {folderTree.map(f => (
                        <div key={f.id} onClick={() => onFolderClick?.({ project: p, folder: f })}>
                          <FolderNode node={f} depth={0} onAction={handleFolderAction} />
                        </div>
                      ))}
                    </div>
                  )}
                  {isOpen && folderTree.length === 0 && (
                    <div className="px-2 pb-2 text-[10px] text-neutral-500">No folders</div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </aside>
  )
}