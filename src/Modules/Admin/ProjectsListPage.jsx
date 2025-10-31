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
  uploadFolderDocuments 
} from '../../Redux/Public/foldersSlice'
import KebabMenu from '../../components/Kebab/KebabMenu'

// Utility functions for formatting
const sliceName = (name, maxLength = 35) => name && name.length > maxLength ? `${name.substring(0, maxLength)}...` : name
const formatFileSize = (bytes) => {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}
const formatDate = (dateString) => {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('en-US', { year: '2-digit', month: 'short', day: 'numeric' })
}

function FolderTreeNodeAdmin({ folder, onFolderClick, project, level = 0, userRole = 'ADMIN' }) {
  const [expanded, setExpanded] = useState(false)

  // Check if user has view permission
  // For child folders without permissionActions set, allow viewing if parent has access
  const userPermission = folder.permissions?.find(p => p.role === userRole)
  const hasPermissionActionsSet = folder.permissionActions !== null && folder.permissionActions !== undefined
  const hasViewAccess = 
    !hasPermissionActionsSet || // Child folders without permission data inherit parent access
    folder.permissionActions?.includes('view') || 
    userPermission?.actions?.includes('view')
  
  if (!hasViewAccess) return null

  const handleFolderClick = () => {
    if (hasViewAccess) {
      onFolderClick({ project, folder })
      setExpanded(!expanded)
    }
  }

  const handleActionComplete = (actionId, result) => {
    console.log(`Action ${actionId} completed:`, result)
  }

  return (
    <div>
      <div className="flex items-center gap-1 group relative">
        <button
          onClick={handleFolderClick}
          disabled={!hasViewAccess}
          className="flex-1 flex items-center gap-1 px-3 py-1.5 text-sm text-left hover:bg-orange-500/10 dark:hover:bg-orange-500/10 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          style={{ paddingLeft: `${12 + level * 16}px` }}
        >
          {folder.children?.length > 0 && (
            <ChevronRight size={12} className={`transition-transform ${expanded ? 'rotate-90' : ''}`} />
          )}
          {!folder.children?.length && <div className="w-3" />}
          <Folder size={14} className="text-orange-500 shrink-0" />
          <span className="truncate text-neutral-800 dark:text-neutral-100 text-xs font-medium">{folder.title || folder.name}</span>
        </button>
        
        {/* Only show kebab menu if actions are available */}
        {folder.kebabActions && folder.kebabActions.length > 0 && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <KebabMenu
              folder={folder}
              projectId={project?.id}
              onActionComplete={handleActionComplete}
              userRole={userRole}
              currentUserPermissions={folder.permissionActions || []}
            />
          </div>
        )}
      </div>
      {expanded && folder.children && folder.children.length > 0 && folder.children.map(child => (
        <FolderTreeNodeAdmin
          key={child.id || child.urn || `child-${level}-${child.name}`}
          folder={child}
          onFolderClick={onFolderClick}
          project={project}
          level={level + 1}
          userRole={userRole}
        />
      ))}
    </div>
  )
}

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
      <div className="flex items-center justify-between px-4 py-2 border-b bg-white dark:bg-neutral-900">
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
          <div className="px-3 py-2 text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 uppercase">Projects</div>
          {loading === 'loading' && <div className="px-3 py-2 text-[11px] text-neutral-500 dark:text-neutral-400">Loading…</div>}
          {projects.map(p => {
            const isFocused = p.id === focusedProjectId
            return (
              <div key={p.id} onClick={() => onProjectClick(p)} 
                   className={`px-3 py-2 flex items-center gap-2 text-sm cursor-pointer truncate
                   ${isFocused ? 'bg-orange-500/15 ring-1 ring-orange-500/30 text-orange-700 dark:text-orange-300' : 'hover:bg-orange-500/5 text-neutral-900 dark:text-neutral-100'}`}>
                <FolderKanban size={14} className="text-orange-500 shrink-0" />
                <span className="truncate font-medium text-black dark:text-neutral-100">{p.name}</span>
              </div>
            )
          })}
        </div>

        {/* Middle: Folder Tree */}
        <div className="w-72 border-r border-neutral-200 dark:border-neutral-800 overflow-y-auto relative">
          <div className="px-3 py-2 text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 uppercase sticky top-0 bg-white dark:bg-neutral-900 z-10">Folders</div>
          {focusedTreeState?.loading === 'loading' && <div className="px-3 py-2 text-[11px] text-neutral-500 dark:text-neutral-400">Loading folders…</div>}
          <div className="relative">
            {focusedTree.map(f => (
              <FolderTreeNodeAdmin key={f.id || f.urn} folder={f} onFolderClick={onFolderClick} project={focusedProject} userRole="ADMIN" />
            ))}
          </div>
        </div>

        {/* Right: Folder Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Breadcrumb & Actions */}
          {folderContent && (
            <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-200 dark:border-neutral-800">
              <div className="text-[12px] text-neutral-600 dark:text-neutral-300 flex items-center gap-1">
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
                          className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded">
                    <MoreVertical size={16} className="text-neutral-700 dark:text-neutral-300" />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded shadow w-40 z-10">
                      <button className="w-full px-3 py-2 text-left hover:bg-orange-500/10 text-[11px] text-neutral-700 dark:text-neutral-200" onClick={() => alert('Add Subfolder')}>Add Subfolder</button>
                      <button className="w-full px-3 py-2 text-left hover:bg-orange-500/10 text-[11px] text-neutral-700 dark:text-neutral-200" onClick={() => fileInputRef.current?.click()}>Upload Files</button>
                      <button className="w-full px-3 py-2 text-left hover:bg-orange-500/10 text-[11px] text-neutral-700 dark:text-neutral-200" onClick={() => alert('Download All')}>Download All</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Folder Content Table */}
          {!folderContentState && <div className="p-4 text-xs text-neutral-500 dark:text-neutral-400">Select a folder to view content.</div>}
          {folderContentState?.loading === 'loading' && <div className="p-4 text-xs text-neutral-500 dark:text-neutral-400">Loading folder…</div>}
          {folderContentState?.loading === 'failed' && <div className="p-4 text-xs text-rose-500 dark:text-rose-400">{folderContentState?.error || 'Failed to load folder'}</div>}
          
          {folderContentState?.loading === 'succeeded' && (
            <div className="p-4">
              <div className="border rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="grid text-[11px] font-medium uppercase tracking-wide text-neutral-600 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800"
                     style={{ gridTemplateColumns: '2.5fr 0.8fr 1fr 1fr 60px' }}>
                  <div className="px-3 py-2">File Name</div>
                  <div className="px-3 py-2">Type</div>
                  <div className="px-3 py-2">Size</div>
                  <div className="px-3 py-2">Modified</div>
                  <div className="px-3 py-2 text-center">Action</div>
                </div>

                {(folderContent?.children || []).concat(folderContent?.documents || []).map(item => {
                  const isFolder = !!item.children || item.type === 'folder'
                  if (isFolder) {
                    return (
                      <div key={item.id || item.name} 
                           className="grid items-center text-xs border-t border-neutral-200 dark:border-neutral-800/60 hover:bg-orange-500/5"
                           style={{ gridTemplateColumns: '2.5fr 0.8fr 1fr 1fr 60px' }}>
                        <div className="px-3 py-2 truncate flex items-center gap-2">
                          <Folder size={14} className="text-orange-500" />
                          <span className="text-black dark:text-neutral-100 font-medium">{sliceName(item.title || item.name, 40)}</span>
                        </div>
                        <div className="px-3 py-2 uppercase text-[10px] text-neutral-500 dark:text-neutral-400">Folder</div>
                        <div className="px-3 py-2 text-neutral-500 dark:text-neutral-400">—</div>
                        <div className="px-3 py-2 text-neutral-500 dark:text-neutral-400">—</div>
                        <div className="px-3 py-2 text-center">
                          <button className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 text-[11px]" 
                                  onClick={() => onFolderClick({ project: focusedProject, folder: item })}>Open</button>
                        </div>
                      </div>
                    )
                  }
                  // Document rendering
                  const fileSize = parseInt(item.sizeBytes || item.size || 0)
                  const fileName = item.name || item.fileName || 'Untitled'
                  const fileExtension = fileName.split('.').pop()?.toUpperCase() || 'FILE'
                  return (
                    <div key={item.id || item.name} 
                         className="grid items-center text-xs border-t border-neutral-200 dark:border-neutral-800/60 hover:bg-orange-500/5 transition-colors"
                         style={{ gridTemplateColumns: '2.5fr 0.8fr 1fr 1fr 60px' }}>
                      <div className="px-3 py-2 flex items-center gap-2 truncate">
                        <FileText size={14} className="text-orange-500 shrink-0" />
                        <span title={fileName} className="truncate text-black dark:text-neutral-100 font-medium">{sliceName(fileName, 40)}</span>
                      </div>
                      <div className="px-3 py-2 text-neutral-500 dark:text-neutral-400 uppercase text-[10px]">{fileExtension}</div>
                      <div className="px-3 py-2 text-neutral-500 dark:text-neutral-400">{formatFileSize(fileSize)}</div>
                      <div className="px-3 py-2 text-neutral-500 dark:text-neutral-400">{formatDate(item.createdAt || item.updatedAt)}</div>
                      <div className="px-3 py-2 flex justify-center">
                        <button className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 p-1">
                          <MoreVertical size={14} />
                        </button>
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

