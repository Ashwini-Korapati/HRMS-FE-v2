import React, { useEffect, useState, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  fetchProjects, 
  deleteProjectsBulk, 
  selectProjects, 
  selectProjectsListLoading,
  selectProjectDeleting,
  fetchProjectsInsights
} from '../../Redux/Public/projectsSlice'
import { 
  Trash2, RefreshCw, FolderKanban, Folder, FileText, ChevronRight, MoreVertical, Upload 
} from 'lucide-react'
import { 
  fetchProjectFolderTree, 
  selectFolderTrees, 
  selectFolderContents, 
  fetchFolderContent, 
  selectFolderDocuments, 
  uploadFolderDocuments 
} from '../../Redux/Public/foldersSlice'

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
  const navigate = useNavigate()
  const { companyUuid, projectId, urn } = useParams()
  const projects = useSelector(selectProjects)
  const loading = useSelector(selectProjectsListLoading)
  const deleting = useSelector(selectProjectDeleting)
  const folderTrees = useSelector(selectFolderTrees)
  const folderContents = useSelector(selectFolderContents)
  const folderDocuments = useSelector(selectFolderDocuments)

  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const [focusedProjectId, setFocusedProjectId] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const fileInputRef = useRef(null)

  const onProjectClick = (p) => {
    setFocusedProjectId(p.id)
    if (companyUuid) navigate(`/${companyUuid}/projects/list/${p.id}`)
    dispatch(fetchProjectFolderTree(p.id))
  }

  const onFolderClick = ({ project, folder }) => {
    const folderUrn = folder?.urn || folder?.id || folder?.name || ''
    if (companyUuid) navigate(`/${companyUuid}/projects/list/${project.id}/folders/${encodeURIComponent(folderUrn)}`)
  }

  useEffect(() => {
    if (projectId) {
      setFocusedProjectId(projectId)
      dispatch(fetchProjectFolderTree(projectId))
    }
  }, [projectId, dispatch])

  useEffect(() => {
    if (projectId && typeof urn !== 'undefined') {
      dispatch(fetchFolderContent({ projectId, folderUrn: urn }))
    }
  }, [projectId, urn, dispatch])

  useEffect(() => {
    dispatch(fetchProjects())
    dispatch(fetchProjectsInsights())
  }, [dispatch])

  const allSelected = useMemo(() => projects.length > 0 && selectedIds.size === projects.length, [projects, selectedIds])
  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }
  const toggleSelectAll = () => {
    allSelected ? setSelectedIds(new Set()) : setSelectedIds(new Set(projects.map(p => p.id)))
  }
  const handleBulkDelete = () => {
    if (!selectedIds.size) return
    dispatch(deleteProjectsBulk(Array.from(selectedIds))).then(() => setSelectedIds(new Set()))
  }

  const focusedProject = useMemo(() => projects.find(p => p.id === focusedProjectId), [projects, focusedProjectId])
  const focusedTreeState = focusedProjectId ? folderTrees[focusedProjectId] : null
  const focusedTree = (focusedTreeState?.data?.tree || focusedTreeState?.data?.folders || [])
  const contentKey = projectId ? `${projectId}::${urn || ''}` : null
  const folderContentState = contentKey ? folderContents[contentKey] : null
  const folderContent = folderContentState?.data?.folder

  const handleFileUpload = (e) => {
    if (!e.target.files.length) return
    dispatch(uploadFolderDocuments({ projectId, folderUrn: urn, files: e.target.files }))
      .then(() => dispatch(fetchFolderContent({ projectId, folderUrn: urn })))
    e.target.value = null
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-white/80 dark:bg-neutral-900/80 backdrop-blur">
        <div className="flex items-center gap-2">
          <ToolbarButton icon={RefreshCw} disabled={loading === 'loading'} onClick={() => dispatch(fetchProjects())}>Refresh</ToolbarButton>
          <ToolbarButton icon={Trash2} variant="danger" disabled={!selectedIds.size || deleting === 'loading'} onClick={handleBulkDelete}>Delete</ToolbarButton>
        </div>
        <div className="text-[11px] text-neutral-500 dark:text-neutral-400">{projects.length} Projects</div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Projects */}
        <div className="w-64 border-r border-neutral-200 dark:border-neutral-800 overflow-y-auto">
          <div className="px-3 py-2 text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 uppercase">Projects</div>
          {loading === 'loading' && <div className="px-3 py-2 text-[11px] text-neutral-500">Loading…</div>}
          {projects.map(p => {
            const isFocused = p.id === focusedProjectId
            return (
              <div key={p.id} onClick={() => onProjectClick(p)} 
                   className={`px-3 py-2 flex items-center gap-2 text-sm cursor-pointer truncate
                   ${isFocused ? 'bg-orange-500/15 ring-1 ring-orange-500/30 text-orange-700 dark:text-orange-300' : 'hover:bg-orange-500/5'}`}>
                <FolderKanban size={14} className="text-orange-500 shrink-0" />
                <span className="truncate">{p.name}</span>
              </div>
            )
          })}
        </div>

        {/* Middle: Folder Tree */}
        <div className="w-72 border-r border-neutral-200 dark:border-neutral-800 overflow-y-auto">
          <div className="px-3 py-2 text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 uppercase">Folders</div>
          {focusedTreeState?.loading === 'loading' && <div className="px-3 py-2 text-[11px] text-neutral-500">Loading folders…</div>}
          {focusedTree.map(f => (
            <button key={f.id || f.urn} onClick={() => onFolderClick({ project: focusedProject, folder: f })}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left hover:bg-orange-500/10">
              <ChevronRight size={12} className="text-neutral-400" />
              <Folder size={16} className="text-orange-500" />
              <span className="truncate">{f.title || f.name}</span>
            </button>
          ))}
        </div>

        {/* Right: Folder Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Breadcrumb & Actions */}
          {folderContent && (
            <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-200 dark:border-neutral-800">
              <div className="text-[12px] text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
                {folderContent.path?.split('/')?.map((seg, i) => (
                  <span key={i} className="flex items-center gap-1">
                    {i > 0 && <ChevronRight size={12} />}
                    {seg}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 relative">
                <button className="inline-flex items-center gap-1 px-2 py-1 border rounded text-[11px] hover:bg-orange-500/10"
                        onClick={() => fileInputRef.current?.click()}>
                  <Upload size={14} /> Upload
                </button>
                <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileUpload} />

                <div className="relative">
                  <button onClick={() => setDropdownOpen(!dropdownOpen)} 
                          className="p-1 hover:bg-neutral-200 rounded">
                    <MoreVertical size={16} />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-1 bg-white dark:bg-neutral-800 border rounded shadow w-40 z-10">
                      <button className="w-full px-3 py-2 text-left hover:bg-orange-500/10 text-[11px]" onClick={() => alert('Add Subfolder')}>Add Subfolder</button>
                      <button className="w-full px-3 py-2 text-left hover:bg-orange-500/10 text-[11px]" onClick={() => fileInputRef.current?.click()}>Upload Files</button>
                      <button className="w-full px-3 py-2 text-left hover:bg-orange-500/10 text-[11px]" onClick={() => alert('Download All')}>Download All</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Folder Content Table */}
          {!folderContentState && <div className="p-4 text-xs text-neutral-500">Select a folder to view content.</div>}
          {folderContentState?.loading === 'loading' && <div className="p-4 text-xs text-neutral-500">Loading folder…</div>}
          {folderContentState?.loading === 'failed' && <div className="p-4 text-xs text-rose-500">{folderContentState?.error || 'Failed to load folder'}</div>}
          
          {folderContentState?.loading === 'succeeded' && (
            <div className="p-4">
              <div className="border rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="grid text-[11px] font-medium uppercase tracking-wide text-neutral-600 dark:text-neutral-400 bg-neutral-100/60 dark:bg-neutral-900/60"
                     style={{ gridTemplateColumns: '1.2fr 0.6fr 0.6fr 0.6fr 100px' }}>
                  <div className="px-2 py-2">Name</div>
                  <div className="px-2 py-2">Type</div>
                  <div className="px-2 py-2">Size</div>
                  <div className="px-2 py-2">Updated</div>
                  <div className="px-2 py-2 text-right pr-2">Actions</div>
                </div>

                {(folderContent?.children || []).concat(folderContent?.documents || []).map(item => {
                  const isFolder = !!item.children || item.type === 'folder'
                  return (
                    <div key={item.id || item.name} 
                         className="grid items-center text-xs border-t border-neutral-200 dark:border-neutral-800/60 hover:bg-orange-500/5"
                         style={{ gridTemplateColumns: '1.2fr 0.6fr 0.6fr 0.6fr 100px' }}>
                      <div className="px-2 py-2 truncate flex items-center gap-2">
                        {isFolder ? <Folder size={14} className="text-orange-500" /> : <FileText size={14} className="text-blue-500" />}
                        {item.title || item.name}
                      </div>
                      <div className="px-2 py-2">{isFolder ? 'Folder' : item.mimeType || 'Document'}</div>
                      <div className="px-2 py-2">{isFolder ? '—' : item.sizeReadable || (item.sizeBytes ? `${Math.round(item.sizeBytes/1024)} KB` : '—')}</div>
                      <div className="px-2 py-2">{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : '—'}</div>
                      <div className="px-2 py-2 text-right pr-2">
                        {isFolder ? (
                          <button className="text-orange-600 hover:text-orange-500 text-[11px]" 
                                  onClick={() => onFolderClick({ project: focusedProject, folder: item })}>Open</button>
                        ) : (
                          <>
                            <button className="text-orange-600 hover:text-orange-500 mr-2 text-[11px]">View</button>
                            <button className="text-orange-600 hover:text-orange-500 text-[11px]">Download</button>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}



// import React, { useEffect, useState, useMemo } from 'react'
// import { useDispatch, useSelector } from 'react-redux'
// import { useNavigate, useParams } from 'react-router-dom'
// import { 
//   fetchProjects, 
//   deleteProjectsBulk, 
//   selectProjects, 
//   selectProjectsListLoading, 
//   selectProjectsListError, 
//   selectProjectDeleting,
//   selectProjectsPagination,
//   fetchProjectsInsights
// } from '../../Redux/Public/projectsSlice'
// import { 
//   Trash2, RefreshCw, FolderKanban, 
//   Folder, FileText, ChevronRight 
// } from 'lucide-react'
// import { 
//   fetchProjectFolderTree, 
//   selectFolderTrees, 
//   selectFolderContents, 
//   fetchFolderContent, 
//   selectFolderDocuments, 
//   fetchFolderDocuments, 
//   uploadFolderDocuments 
// } from '../../Redux/Public/foldersSlice'

// function ToolbarButton({ icon: Icon, children, disabled, onClick, variant = 'default' }) {
//   const base = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-colors'
//   const styles = variant === 'danger'
//     ? 'border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20'
//     : 'border-orange-500/40 bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20'
//   return (
//     <button disabled={disabled} onClick={onClick} className={`${base} ${styles} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
//       {Icon && <Icon size={14} />}{children}
//     </button>
//   )
// }

// export default function ProjectsListPage() {
//   const dispatch = useDispatch()
//   const navigate = useNavigate()
//   const { companyUuid, projectId, urn } = useParams()
//   const projects = useSelector(selectProjects)
//   const loading = useSelector(selectProjectsListLoading)
//   const listError = useSelector(selectProjectsListError)
//   const deleting = useSelector(selectProjectDeleting)
//   const pagination = useSelector(selectProjectsPagination)
//   const folderTrees = useSelector(selectFolderTrees)
//   const folderContents = useSelector(selectFolderContents)
//   const folderDocuments = useSelector(selectFolderDocuments)

//   const [selectedIds, setSelectedIds] = useState(() => new Set())
//   const [focusedProjectId, setFocusedProjectId] = useState(null)

//   const onProjectClick = (p) => {
//     setFocusedProjectId(p.id)
//     if (companyUuid) {
//       navigate(`/${companyUuid}/projects/list/${p.id}`)
//     }
//     dispatch(fetchProjectFolderTree(p.id))
//   }

//   const onFolderClick = ({ project, folder }) => {
//     const urn = folder?.urn || folder?.id || folder?.name || ''
//     if (companyUuid) {
//       navigate(`/${companyUuid}/projects/list/${project.id}/folders/${encodeURIComponent(urn)}`)
//     }
//   }

//   // Effects
//   useEffect(() => {
//     if (projectId) {
//       setFocusedProjectId(projectId)
//       dispatch(fetchProjectFolderTree(projectId))
//     }
//   }, [projectId, dispatch])

//   useEffect(() => {
//     if (projectId && typeof urn !== 'undefined') {
//       dispatch(fetchFolderContent({ projectId, folderUrn: urn }))
//     }
//   }, [projectId, urn, dispatch])

//   useEffect(() => {
//     dispatch(fetchProjects())
//     dispatch(fetchProjectsInsights())
//   }, [dispatch])

//   const allSelected = useMemo(() => projects.length > 0 && selectedIds.size === projects.length, [projects, selectedIds])

//   const toggleSelect = (id) => {
//     setSelectedIds(prev => {
//       const next = new Set(prev)
//       if (next.has(id)) next.delete(id); else next.add(id)
//       return next
//     })
//   }

//   const toggleSelectAll = () => {
//     if (allSelected) setSelectedIds(new Set())
//     else setSelectedIds(new Set(projects.map(p => p.id)))
//   }

//   const handleBulkDelete = () => {
//     if (!selectedIds.size) return
//     dispatch(deleteProjectsBulk(Array.from(selectedIds))).then(() => setSelectedIds(new Set()))
//   }

//   const focusedProject = useMemo(
//     () => projects.find(p => p.id === focusedProjectId),
//     [projects, focusedProjectId]
//   )
//   const focusedTreeState = focusedProjectId ? folderTrees[focusedProjectId] : null
//   const focusedTree = (focusedTreeState?.data?.tree || focusedTreeState?.data?.folders || [])
//   const contentKey = projectId ? `${projectId}::${urn || ''}` : null
//   const folderContentState = contentKey ? folderContents[contentKey] : null
//   const folderContent = folderContentState?.data?.folder

//   return (
//     <div className="flex flex-col h-full">
//       {/* Top Toolbar */}
//       <div className="flex items-center justify-between px-4 py-2 border-b bg-white/80 dark:bg-neutral-900/80 backdrop-blur">
//         <div className="flex items-center gap-2">
//           <ToolbarButton icon={RefreshCw} disabled={loading === 'loading'} onClick={() => dispatch(fetchProjects())}>Refresh</ToolbarButton>
//           <ToolbarButton icon={Trash2} variant="danger" disabled={!selectedIds.size || deleting === 'loading'} onClick={handleBulkDelete}>Delete</ToolbarButton>
//         </div>
//         <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
//           {projects.length} Projects
//         </div>
//       </div>

//       {/* Main Layout: 3 Panels */}
//       <div className="flex flex-1 overflow-hidden">
        
//         {/* Left: Projects Explorer */}
//         <div className="w-64 border-r border-neutral-200 dark:border-neutral-800 overflow-y-auto">
//           <div className="px-3 py-2 text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 uppercase">Projects</div>
//           {loading === 'loading' && <div className="px-3 py-2 text-[11px] text-neutral-500">Loading…</div>}
//           {projects.map(p => {
//             const isFocused = p.id === focusedProjectId
//             return (
//               <div 
//                 key={p.id} 
//                 onClick={() => onProjectClick(p)} 
//                 className={`px-3 py-2 flex items-center gap-2 text-sm cursor-pointer truncate
//                   ${isFocused ? 'bg-orange-500/15 ring-1 ring-orange-500/30 text-orange-700 dark:text-orange-300' : 'hover:bg-orange-500/5'}`}
//               >
//                 <FolderKanban size={14} className="text-orange-500 shrink-0" />
//                 <span className="truncate">{p.name}</span>
//               </div>
//             )
//           })}
//         </div>

//         {/* Middle: Folder Tree */}
//         <div className="w-72 border-r border-neutral-200 dark:border-neutral-800 overflow-y-auto">
//           <div className="px-3 py-2 text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 uppercase">Folders</div>
//           {focusedTreeState?.loading === 'loading' && <div className="px-3 py-2 text-[11px] text-neutral-500">Loading folders…</div>}
//           {focusedTree.map(f => (
//             <button 
//               key={f.id || f.urn} 
//               onClick={() => onFolderClick({ project: focusedProject, folder: f })}
//               className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left hover:bg-orange-500/10"
//             >
//               <ChevronRight size={12} className="text-neutral-400" />
//               <Folder size={16} className="text-orange-500" />
//               <span className="truncate">{f.title || f.name}</span>
//             </button>
//           ))}
//         </div>

//         {/* Right: Folder Content */}
//         <div className="flex-1 overflow-y-auto">
//           {/* Breadcrumb */}
//           {folderContent && (
//             <div className="px-4 py-2 border-b border-neutral-200 dark:border-neutral-800 text-[12px] text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
//               {folderContent.path?.split('/')?.map((seg, i) => (
//                 <span key={i} className="flex items-center gap-1">
//                   {i > 0 && <ChevronRight size={12} />}
//                   {seg}
//                 </span>
//               ))}
//             </div>
//           )}

//           {/* Content */}
//           {!folderContentState && <div className="p-4 text-xs text-neutral-500">Select a folder to view content.</div>}
//           {folderContentState?.loading === 'loading' && <div className="p-4 text-xs text-neutral-500">Loading folder…</div>}
//           {folderContentState?.loading === 'failed' && <div className="p-4 text-xs text-rose-500">{folderContentState?.error || 'Failed to load folder'}</div>}
          
//           {folderContentState?.loading === 'succeeded' && (
//             <div className="p-4">
//               <div className="border rounded-lg overflow-hidden">
//                 {/* Table Header */}
//                 <div className="grid text-[11px] font-medium uppercase tracking-wide text-neutral-600 dark:text-neutral-400 bg-neutral-100/60 dark:bg-neutral-900/60" 
//                   style={{ gridTemplateColumns: '1.2fr 0.6fr 0.6fr 0.6fr 100px' }}>
//                   <div className="px-2 py-2">Name</div>
//                   <div className="px-2 py-2">Type</div>
//                   <div className="px-2 py-2">Size</div>
//                   <div className="px-2 py-2">Updated</div>
//                   <div className="px-2 py-2 text-right pr-2">Actions</div>
//                 </div>

//                 {(() => {
//                   const rows = [
//                     ...(folderContent?.children || []).map(f => ({
//                       id: f.id,
//                       name: f.title || f.name,
//                       type: 'Folder',
//                       size: '—',
//                       updatedAt: f.updatedAt,
//                       icon: <Folder size={14} className="text-orange-500" />,
//                     })),
//                     ...(folderContent?.documents || []).map(d => ({
//                       id: d.id,
//                       name: d.title || d.originalName || d.name,
//                       type: d.mimeType || d.type || 'Document',
//                       size: d.sizeReadable || (d.sizeBytes ? `${Math.round(d.sizeBytes/1024)} KB` : '—'),
//                       updatedAt: d.updatedAt || d.createdAt,
//                       icon: <FileText size={14} className="text-blue-500" />,
//                     }))
//                   ]

//                   if (!rows.length) {
//                     return <div className="p-3 text-[11px] text-neutral-500">No folders or documents.</div>
//                   }

//                   return rows.map(r => (
//                     <div key={r.id} 
//                       className="grid items-center text-xs border-t border-neutral-200 dark:border-neutral-800/60 hover:bg-orange-500/5"
//                       style={{ gridTemplateColumns: '1.2fr 0.6fr 0.6fr 0.6fr 100px' }}>
//                       <div className="px-2 py-2 truncate flex items-center gap-2">
//                         {r.icon}
//                         {r.name}
//                       </div>
//                       <div className="px-2 py-2">{r.type}</div>
//                       <div className="px-2 py-2">{r.size}</div>
//                       <div className="px-2 py-2">{r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : '—'}</div>
//                       <div className="px-2 py-2 text-right pr-2">
//                         {r.type === 'Folder' ? (
//                           <button 
//                             onClick={() => onFolderClick({ project: focusedProject, folder: { id: r.id, urn: r.id, name: r.name } })} 
//                             className="text-orange-600 hover:text-orange-500 text-[11px]">
//                             Open
//                           </button>
//                         ) : (
//                           <>
//                             <button className="text-orange-600 hover:text-orange-500 mr-2 text-[11px]">View</button>
//                             <button className="text-orange-600 hover:text-orange-500 text-[11px]">Download</button>
//                           </>
//                         )}
//                       </div>
//                     </div>
//                   ))
//                 })()}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }




// import React, { useEffect, useState, useMemo } from 'react'
// import { useDispatch, useSelector } from 'react-redux'
// import { useNavigate, useParams } from 'react-router-dom'
// import { 
//   fetchProjects, 
//   deleteProject, 
//   deleteProjectsBulk, 
//   selectProjects, 
//   selectProjectsListLoading, 
//   selectProjectsListError, 
//   selectProjectDeleting,
//   selectProjectsPagination,
//   fetchProjectsInsights
// } from '../../Redux/Public/projectsSlice'
// import { Trash2, RefreshCw, FolderKanban, CheckSquare, Square, Calendar, DollarSign, User as UserIcon, Folder, FileText } from 'lucide-react'
// import { fetchProjectFolderTree, selectFolderTrees, selectFolderContents, fetchFolderContent, selectFolderDocuments, fetchFolderDocuments, uploadFolderDocuments } from '../../Redux/Public/foldersSlice'
// import SmartRightBarSection from '../../components/Prop/SmartRightBarSection'

// function ToolbarButton({ icon: Icon, children, disabled, onClick, variant = 'default' }) {
//   const base = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-colors'
//   const styles = variant === 'danger'
//     ? 'border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20'
//     : 'border-orange-500/40 bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20'
//   return (
//     <button disabled={disabled} onClick={onClick} className={`${base} ${styles} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
//       {Icon && <Icon size={14} />}{children}
//     </button>
//   )
// }

// export default function ProjectsListPage() {
//   const dispatch = useDispatch()
//   const navigate = useNavigate()
//   const { companyUuid, projectId, urn } = useParams()
//   const projects = useSelector(selectProjects)
//   const loading = useSelector(selectProjectsListLoading)
//   const listError = useSelector(selectProjectsListError)
//   const deleting = useSelector(selectProjectDeleting)
//   const pagination = useSelector(selectProjectsPagination)
//   const folderTrees = useSelector(selectFolderTrees)
//   const folderContents = useSelector(selectFolderContents)
//   const folderDocuments = useSelector(selectFolderDocuments)
//   const [selectedIds, setSelectedIds] = useState(() => new Set())
//   const [focusedProjectId, setFocusedProjectId] = useState(null) // NEW
  
//   const onProjectClick = (p) => {
//     setFocusedProjectId(p.id)
//     if (companyUuid) {
//       navigate(`/${companyUuid}/projects/list/${p.id}`)
//     }
//     dispatch(fetchProjectFolderTree(p.id))
//   }

//   const onFolderClick = ({ project, folder }) => {
//     const urn = folder?.urn || folder?.id || folder?.name || ''
//     if (companyUuid) {
//       navigate(`/${companyUuid}/projects/list/${project.id}/folders/${encodeURIComponent(urn)}`)
//     }
//   }

//   // Sync focused project and fetch tree when route has projectId
//   useEffect(() => {
//     if (projectId) {
//       setFocusedProjectId(projectId)
//       dispatch(fetchProjectFolderTree(projectId))
//     }
//   }, [projectId, dispatch])

//   // Fetch folder content when route has urn
//   useEffect(() => {
//     if (projectId && typeof urn !== 'undefined') {
//       dispatch(fetchFolderContent({ projectId, folderUrn: urn }))
//     }
//   }, [projectId, urn, dispatch])

//   useEffect(() => {
//     dispatch(fetchProjects())
//     dispatch(fetchProjectsInsights())
//   }, [dispatch])

//   const allSelected = useMemo(() => projects.length > 0 && selectedIds.size === projects.length, [projects, selectedIds])

//   const toggleSelect = (id) => {
//     setSelectedIds(prev => {
//       const next = new Set(prev)
//       if (next.has(id)) next.delete(id); else next.add(id)
//       return next
//     })
//   }

//   const toggleSelectAll = () => {
//     if (allSelected) setSelectedIds(new Set())
//     else setSelectedIds(new Set(projects.map(p => p.id)))
//   }

//   const handleBulkDelete = () => {
//     if (!selectedIds.size) return
//     dispatch(deleteProjectsBulk(Array.from(selectedIds))).then(() => setSelectedIds(new Set()))
//   }

//   const statusColor = (status) => {
//     switch ((status || '').toUpperCase()) {
//       case 'PLANNING': return 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
//       case 'ACTIVE': return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
//       case 'ON_HOLD': return 'bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-600 dark:text-fuchsia-400'
//       case 'COMPLETED': return 'bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400'
//       default: return 'bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400'
//     }
//   }

//   const total = pagination?.total || projects.length
//   const page = pagination?.page || 1
//   const pages = pagination?.pages || 1
//   const limit = pagination?.limit || projects.length || 0

//   const focusedProject = useMemo(
//     () => projects.find(p => p.id === focusedProjectId),
//     [projects, focusedProjectId]
//   )
//   const focusedTreeState = focusedProjectId ? folderTrees[focusedProjectId] : null
//   const focusedTree = (focusedTreeState?.data?.tree || focusedTreeState?.data?.folders || [])
//   const contentKey = projectId ? `${projectId}::${urn || ''}` : null
//   const folderContentState = contentKey ? folderContents[contentKey] : null
  

//   // Helper to render folder tree node
//   function renderFolderTree(folder) {
//     return (
//       <div key={folder.id} className="ml-4">
//         <div className="flex items-center gap-2 py-1">
//           <Folder size={18} className="text-orange-500" />
//           <span className="font-semibold">{folder.name}</span>
//         </div>
//         {/* Render subfolders if any */}
//         {folder.children && folder.children.length > 0 && (
//           <div className="ml-4 border-l border-orange-200">
//             {folder.children.map(child => renderFolderTree(child))}
//           </div>
//         )}
//         {/* Render documents if any */}
//         {folder.documents && folder.documents.length > 0 && (
//           <div className="ml-6">
//             {folder.documents.map(doc => (
//               <div key={doc.id || doc.name} className="flex items-center gap-2 py-0.5">
//                 <FileText size={16} className="text-blue-500" />
//                 <span>{doc.name || doc.title}</span>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     )
//   }

//   // UI for folder content tree
//   const folderContent = folderContentState?.data?.folder

//   return (
//     <div className="p-4 md:p-6">
//       <div className="grid xl:grid-cols-[1fr_340px] gap-6 items-start">
//         <div className="space-y-5">
//           {/* Header + List (Left Section) */}
//           <div className="flex items-center justify-between flex-wrap gap-3">
//             <div className="space-y-1">
//               <h1 className="text-lg font-semibold bg-gradient-to-r from-orange-400 via-rose-400 to-fuchsia-400 bg-clip-text text-transparent">Projects</h1>
//               <div className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-3">
//                 <span>Total: <strong>{total}</strong></span>
//                 {pagination && <span>Page {page} of {pages}</span>}
//                 {pagination && <span>Showing {(page - 1) * limit + 1}-{Math.min(page * limit, total)}</span>}
//               </div>
//             </div>
//             <div className="flex items-center gap-2 flex-wrap">
//               <ToolbarButton icon={RefreshCw} disabled={loading === 'loading'} onClick={() => dispatch(fetchProjects())}>Refresh</ToolbarButton>
//               <ToolbarButton icon={Trash2} variant="danger" disabled={!selectedIds.size || deleting === 'loading'} onClick={handleBulkDelete}>Delete Selected</ToolbarButton>
//             </div>
//           </div>

//           {listError && <div className="text-xs text-rose-500">{listError}</div>}

//           <div className="rounded-xl border border-orange-500/20 dark:border-orange-500/30 bg-white/60 dark:bg-neutral-900/40 backdrop-blur overflow-hidden">
//             <div className="grid text-[11px] font-medium uppercase tracking-wide text-neutral-600 dark:text-neutral-400 bg-neutral-100/60 dark:bg-neutral-900/60" style={{ gridTemplateColumns: '40px 1.2fr 1fr 0.9fr 0.9fr 0.8fr 0.8fr 120px' }}>
//               <div className="px-2 py-2 flex items-center justify-center">
//                 <button onClick={toggleSelectAll} className="text-orange-600 dark:text-orange-400">
//                   {allSelected ? <CheckSquare size={14} /> : <Square size={14} />}
//                 </button>
//               </div>
//               <div className="px-2 py-2">Name</div>
//                 <div className="px-2 py-2">Code</div>
//                 <div className="px-2 py-2">Status</div>
//                 <div className="px-2 py-2">Owner</div>
//                 <div className="px-2 py-2">Dates</div>
//                 <div className="px-2 py-2">Folders</div>
//                 <div className="px-2 py-2 text-right pr-4">Actions</div>
//             </div>
//             {loading === 'loading' && (
//               <div className="p-4 text-xs text-neutral-500 animate-pulse">Loading projects…</div>
//             )}
//             {loading === 'succeeded' && projects.length === 0 && (
//                 <div className="p-4 text-xs text-neutral-500">No projects found.</div>
//             )}
//             {loading === 'succeeded' && projects.map(p => {
//               const owner = p.createdBy || p.owner || null
//               const foldersCount = Array.isArray(p.folders) ? p.folders.length : (p.folderCount || 0)
//               const start = p.startDate ? new Date(p.startDate) : null
//               const end = p.endDate ? new Date(p.endDate) : null
//               const dateFmt = (d) => d ? d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'
//               const isFocused = p.id === focusedProjectId
//               return (
//                 <div
//                   key={p.id}
//                   onClick={() => setFocusedProjectId(p.id)}
//                   className={`grid items-center text-xs border-t border-neutral-200 dark:border-neutral-800/60 cursor-pointer transition-colors
//                     ${isFocused ? 'bg-orange-500/15 dark:bg-orange-500/20 ring-1 ring-orange-500/30' : 'hover:bg-orange-500/5 dark:hover:bg-orange-500/10'}`}
//                   style={{ gridTemplateColumns: '40px 1.2fr 1fr 0.9fr 0.9fr 0.8fr 0.8fr 120px' }}
//                 >
//                   <div className="px-2 py-2 flex items-center justify-center" onClick={(e) => { e.stopPropagation(); toggleSelect(p.id) }}>
//                     <button className="text-orange-600 dark:text-orange-400">
//                       {selectedIds.has(p.id) ? <CheckSquare size={14} /> : <Square size={14} />}
//                     </button>
//                   </div>
//                   <div className="px-2 py-2 flex items-center gap-2">
//                     <FolderKanban size={14} className="text-orange-500" />
//                     <span className="font-medium text-neutral-700 dark:text-neutral-200 truncate">{p.name}</span>
//                   </div>
//                   <div className="px-2 py-2 text-neutral-500 dark:text-neutral-400 truncate">{p.projectCode || '—'}</div>
//                   <div className="px-2 py-2">
//                     <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-medium border ${statusColor(p.status)}`}>{p.status || '—'}</span>
//                   </div>
//                   <div className="px-2 py-2 flex items-center gap-1 text-neutral-600 dark:text-neutral-300 truncate">
//                     <UserIcon size={12} className="text-orange-500" />
//                     <span>{owner ? (owner.firstName ? owner.firstName + (owner.lastName ? ' ' + owner.lastName : '') : owner.email || '—') : '—'}</span>
//                   </div>
//                   <div className="px-2 py-2 flex flex-col gap-0.5 text-[10px] text-neutral-500 dark:text-neutral-400">
//                     <span className="inline-flex items-center gap-1"><Calendar size={12} /> {dateFmt(start)} → {dateFmt(end)}</span>
//                     {p.budget && <span className="inline-flex items-center gap-1"><DollarSign size={12} /> {p.budget}{p.currency ? ' ' + p.currency : ''}</span>}
//                   </div>
//                   <div className="px-2 py-2 text-neutral-600 dark:text-neutral-300">
//                     {p.folderCounts?.total ?? (Array.isArray(p.folderTree) ? p.folderTree.length : foldersCount)}
//                   </div>
//                   <div className="px-2 py-2 flex items-center justify-end gap-2 pr-4" onClick={(e) => e.stopPropagation()}>
//                     <button onClick={() => dispatch(deleteProject(p.id))} className="text-rose-500 hover:text-rose-400" title="Delete"><Trash2 size={14} /></button>
//                   </div>
//                 </div>
//               )
//             })}
//           </div>
//         </div>

//         {/* Left: Focused Project Folder Tree */}
//         {focusedProject && (
//           <div className="rounded-xl border border-orange-500/20 dark:border-orange-500/30 bg-white/60 dark:bg-neutral-900/40 backdrop-blur overflow-hidden">
//             <div className="px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-neutral-600 dark:text-neutral-400">{focusedProject.name} • Folders</div>
//             <div className="max-h-64 overflow-auto">
//               {focusedTreeState?.loading === 'loading' && <div className="px-3 py-2 text-[11px] text-neutral-500">Loading folders…</div>}
//               {focusedTreeState?.loading === 'failed' && <div className="px-3 py-2 text-[11px] text-rose-500">{focusedTreeState?.error || 'Failed to load tree'}</div>}
//               {focusedTreeState?.loading === 'succeeded' && focusedTree.length === 0 && <div className="px-3 py-2 text-[11px] text-neutral-500">No folders</div>}
//               {focusedTreeState?.loading === 'succeeded' && focusedTree.length > 0 && (
//                 <ul className="px-2 py-2 space-y-1">
//                   {focusedTree.map(f => (
//                     <li key={f.id || f.urn || f.name}>
//                       <button onClick={() => onFolderClick({ project: focusedProject, folder: f })} className="w-full text-left text-[11px] px-2 py-1 rounded hover:bg-orange-500/10">
//                         {f.title || f.name || f.urn}
//                       </button>
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Folder Content Details */}
//         {focusedProject && (
//           <div className="rounded-xl border border-orange-500/20 dark:border-orange-500/30 bg-white/60 dark:bg-neutral-900/40 backdrop-blur overflow-hidden">
//             <div className="px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-neutral-600 dark:text-neutral-400">Folder Content</div>
//             <div className="px-3 py-2 border-t border-neutral-200/60 dark:border-neutral-800/60">
//               {/* Top actions bar: permissions + upload */}
//               <div className="flex items-center justify-between gap-2 flex-wrap">
//                 <div className="flex items-center gap-1">
//                   {folderContentState?.data?.folder?.permissionActions?.map(a => (
//                     <button key={a} className="px-2 py-1 rounded-md border text-[10px] border-neutral-400/30 text-neutral-700 dark:text-neutral-300 bg-neutral-400/10 capitalize">
//                       {a}
//                     </button>
//                   ))}
//                 </div>
//                 <div className="flex items-center gap-2">
//                   {/* Upload via input */}
//                   <label className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-orange-500/40 bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] cursor-pointer">
//                     <input
//                       type="file"
//                       multiple
//                       accept=".ppt,.pptx,.doc,.docx,.pdf,.xls,.xlsx,.png,.jpg,.jpeg"
//                       className="hidden"
//                       onChange={(e) => {
//                         const files = Array.from(e.target.files || [])
//                         if (!files.length || !projectId || !urn) return
//                         dispatch(uploadFolderDocuments({ projectId, folderUrn: urn, files }))
//                           .unwrap()
//                           .then(() => dispatch(fetchFolderDocuments({ projectId, folderUrn: urn })))
//                         e.target.value = ''
//                       }}
//                     />
//                     <span>Upload</span>
//                   </label>
//                 </div>
//               </div>
//             </div>
//             {!folderContentState && (
//               <div className="px-3 py-2 text-[11px] text-neutral-500">Select a folder to view details</div>
//             )}
//             {folderContentState?.loading === 'loading' && (
//               <div className="px-3 py-2 text-[11px] text-neutral-500">Loading folder content…</div>
//             )}
//             {folderContentState?.loading === 'failed' && (
//               <div className="px-3 py-2 text-[11px] text-rose-500">{folderContentState?.error || 'Failed to load folder'}</div>
//             )}
//             {folderContentState?.loading === 'succeeded' && folderContentState?.data && (
//               <div className="px-3 py-3 space-y-3 text-[12px]">
//                 {/* Header row with folder summary */}
//                 {folderContentState.data.folder && (
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">{folderContentState.data.folder.title || folderContentState.data.folder.name}</div>
//                       <div className="text-[11px] text-neutral-500">{folderContentState.data.folder.path}</div>
//                     </div>
//                     <div className="inline-flex items-center gap-1">
//                       {folderContentState.data.folder.docType && (
//                         <span className="px-2 py-0.5 rounded-md border border-orange-500/30 text-orange-600 dark:text-orange-400 bg-orange-500/10 text-[10px]">{folderContentState.data.folder.docType}</span>
//                       )}
//                       {folderContentState.data.folder.viewOption && (
//                         <span className="px-2 py-0.5 rounded-md border border-fuchsia-500/30 text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-500/10 text-[10px]">{folderContentState.data.folder.viewOption}</span>
//                       )}
//                       {typeof folderContentState.data.folder.isRoot === 'boolean' && (
//                         <span className="px-2 py-0.5 rounded-md border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 text-[10px]">{folderContentState.data.folder.isRoot ? 'Root' : 'Child'}</span>
//                       )}
//                     </div>
//                   </div>
//                 )}

//                 {/* Smart Table for Documents */}
//                 <div className="border rounded-lg overflow-hidden">
//                   <div className="grid text-[11px] font-medium uppercase tracking-wide text-neutral-600 dark:text-neutral-400 bg-neutral-100/60 dark:bg-neutral-900/60" style={{ gridTemplateColumns: '1.2fr 0.8fr 0.8fr 0.6fr 100px' }}>
//                     <div className="px-2 py-2">Name</div>
//                     <div className="px-2 py-2">Type</div>
//                     <div className="px-2 py-2">Size</div>
//                     <div className="px-2 py-2">Updated</div>
//                     <div className="px-2 py-2 text-right pr-2">Actions</div>
//                   </div>
//                   {/* Documents rows */}
//                   {(() => {
//                     const docKey = projectId && urn ? `${projectId}::${urn}` : null
//                     const docsState = docKey ? folderDocuments[docKey] : null
//                     if (!docsState) return <div className="p-3 text-[11px] text-neutral-500">No documents loaded yet.</div>
//                     if (docsState.loading === 'loading') return <div className="p-3 text-[11px] text-neutral-500 animate-pulse">Loading documents…</div>
//                     if (docsState.loading === 'failed') return <div className="p-3 text-[11px] text-rose-500">{docsState.error || 'Failed to load documents'}</div>
//                     const items = docsState.items || []
//                     if (!items.length) return <div className="p-3 text-[11px] text-neutral-500">No documents</div>
//                     return items.map((d) => (
//                       <div key={d.id || d.name} className="grid items-center text-xs border-t border-neutral-200 dark:border-neutral-800/60" style={{ gridTemplateColumns: '1.2fr 0.8fr 0.8fr 0.6fr 100px' }}>
//                         <div className="px-2 py-2 truncate">{d.title || d.name}</div>
//                         <div className="px-2 py-2 text-neutral-600 dark:text-neutral-300">{d.mimeType || d.type || '—'}</div>
//                         <div className="px-2 py-2 text-neutral-600 dark:text-neutral-300">{d.sizeReadable || (d.size ? `${Math.round(d.size/1024)} KB` : '—')}</div>
//                         <div className="px-2 py-2 text-neutral-600 dark:text-neutral-300">{d.updatedAt ? new Date(d.updatedAt).toLocaleString() : '—'}</div>
//                         <div className="px-2 py-2 text-right pr-2">
//                           <button className="text-orange-600 hover:text-orange-500 mr-2 text-[11px]">View</button>
//                           <button className="text-orange-600 hover:text-orange-500 text-[11px]">Download</button>
//                         </div>
//                       </div>
//                     ))
//                   })()}
//                 </div>
//               </div>
//             )}
//           </div>
//         )}

//         {/* Right Sidebar */}
//         <SmartRightBarSection
//           onCreate={() => { /* navigation can be added here */ }}
//           onRefreshList={() => dispatch(fetchProjects())}
//           listLoading={loading === 'loading'}
//           selectedProject={focusedProject} // NEW
//           onProjectClick={onProjectClick}
//           onFolderClick={onFolderClick}
//         />
//       </div>

//       {/* Folder Content Tree UI */}
//       <div className="mt-6">
//         <h3 className="text-lg font-bold mb-2">Folder Content</h3>
//         {folderContent ? (
//           <div className="border rounded-lg p-3 bg-orange-50">
//             {renderFolderTree(folderContent)}
//           </div>
//         ) : (
//           <div className="text-gray-400">No folder content available.</div>
//         )}
//       </div>
//     </div>
//   )
// }
