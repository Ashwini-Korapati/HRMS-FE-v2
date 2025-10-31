import React, { useEffect, useState, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import {
  fetchProjects,
  selectProjects,
  selectProjectsListLoading,
  selectProjectsListError,
  deleteProjectsBulk,
  selectProjectDeleting,
  fetchProjectsInsights
} from '../../Redux/Public/projectsSlice'
import {
  fetchProjectFolderTree,
  selectFolderTrees,
  selectFolderContents,
  fetchFolderContent,
  uploadFolderDocuments
} from '../../Redux/Public/foldersSlice'
import { FolderKanban, RefreshCw, Trash2, Folder, FileText, ChevronRight, Upload, MoreVertical } from 'lucide-react'
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

function FolderTreeNode({ folder, onFolderClick, project, level = 0, userRole = 'USER' }) {
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
        <FolderTreeNode
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

export default function UserProjectList() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { companyUuid, userId, projectId, urn } = useParams()
  const projects = useSelector(selectProjects)
  const loading = useSelector(selectProjectsListLoading)
  const error = useSelector(selectProjectsListError)
  const deleting = useSelector(selectProjectDeleting)
  const folderTrees = useSelector(selectFolderTrees)
  const folderContents = useSelector(selectFolderContents)

  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const [focusedProjectId, setFocusedProjectId] = useState(null)
  const fileInputRef = useRef(null)

  const onProjectClick = (p) => {
    setFocusedProjectId(p.id)
    if (companyUuid && userId) {
      navigate(`/${companyUuid}/auth/${userId}/projects/list/${p.id}`)
    } else if (companyUuid) {
      navigate(`/${companyUuid}/projects/list/${p.id}`)
    }
    dispatch(fetchProjectFolderTree(p.id))
  }

  const onFolderClick = ({ project, folder }) => {
    const folderUrn = folder?.urn || folder?.id || folder?.name || ''
    if (companyUuid && userId) {
      navigate(`/${companyUuid}/auth/${userId}/projects/list/${project.id}/folders/${encodeURIComponent(folderUrn)}`)
    } else if (companyUuid) {
      navigate(`/${companyUuid}/projects/list/${project.id}/folders/${encodeURIComponent(folderUrn)}`)
    }
  }

  // Effects
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

  // Selectors
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
  const focusedTree = (focusedTreeState?.data?.folderTree || focusedTreeState?.data?.tree || [])
  const contentKey = projectId ? `${projectId}::${urn || ''}` : null
  const folderContentState = contentKey ? folderContents[contentKey] : null
  const folderContent = folderContentState?.data?.folder || folderContentState?.data
  // Extract documents from folderContent (backend includes them in the folder response)
  const docs = folderContent?.documents || folderContent?.files || []

  const handleFileUpload = (e) => {
    const files = e.target.files
    if (!files || !projectId || !urn) return
    dispatch(uploadFolderDocuments({ projectId, folderUrn: urn, files: Array.from(files) }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  if (!projectId) {
    // List View - All Projects
    return (
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-lg font-semibold bg-gradient-to-r from-orange-400 via-rose-400 to-fuchsia-400 bg-clip-text text-transparent">My Projects</h1>
          <div className="flex items-center gap-2">
            <ToolbarButton icon={RefreshCw} disabled={loading === 'loading'} onClick={() => dispatch(fetchProjects())}>Refresh</ToolbarButton>
            {selectedIds.size > 0 && (
              <ToolbarButton icon={Trash2} variant="danger" disabled={deleting === 'loading'} onClick={handleBulkDelete}>Delete ({selectedIds.size})</ToolbarButton>
            )}
          </div>
        </div>
        {error && <div className="text-xs text-rose-500">{error}</div>}
        <div className="rounded-xl border border-orange-500/20 dark:border-orange-500/30 bg-white dark:bg-neutral-900 overflow-hidden">
          <div className="grid text-[11px] font-medium uppercase tracking-wide text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800" style={{ gridTemplateColumns: '40px 1.4fr 1fr 1fr' }}>
            <div className="px-2 py-2">
              <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="rounded" />
            </div>
            <div className="px-2 py-2">Name</div>
            <div className="px-2 py-2">Code</div>
            <div className="px-2 py-2">Status</div>
          </div>
          {loading === 'loading' && <div className="p-4 text-xs text-neutral-500 dark:text-neutral-400 animate-pulse">Loading…</div>}
          {loading === 'succeeded' && projects.length === 0 && <div className="p-4 text-xs text-neutral-500 dark:text-neutral-400">You have no projects.</div>}
          {loading === 'succeeded' && projects.map(p => (
            <div key={p.id} className="grid items-center text-xs border-t border-neutral-200 dark:border-neutral-800/60 hover:bg-orange-500/5 dark:hover:bg-orange-500/10 transition-colors" style={{ gridTemplateColumns: '40px 1.4fr 1fr 1fr' }}>
              <div className="px-2 py-2">
                <input type="checkbox" checked={selectedIds.has(p.id)} onChange={() => toggleSelect(p.id)} className="rounded" />
              </div>
              <div className="px-2 py-2 cursor-pointer" onClick={() => onProjectClick(p)}>
                <div className="flex items-center gap-2">
                  <FolderKanban size={14} className="text-orange-500" />
                  <span className="font-medium text-black dark:text-neutral-200 truncate">{p.name}</span>
                </div>
              </div>
              <div className="px-2 py-2 text-neutral-500 dark:text-neutral-400 truncate">{p.projectCode || '—'}</div>
              <div className="px-2 py-2">
                <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-medium bg-orange-500/10 border border-orange-500/30 text-orange-600 dark:text-orange-400">
                  {p.status || '—'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Detail View - Project + Folders + Documents
  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-white dark:bg-neutral-900">
        <div className="flex items-center gap-2">
          <ToolbarButton icon={RefreshCw} disabled={loading === 'loading'} onClick={() => dispatch(fetchProjects())}>Refresh</ToolbarButton>
          <button 
            onClick={() => {
              if (companyUuid && userId) {
                navigate(`/${companyUuid}/auth/${userId}/projects/list`)
              } else if (companyUuid) {
                navigate(`/${companyUuid}/projects/list`)
              }
            }} 
            className="text-[11px] font-medium text-orange-600 dark:text-orange-400 hover:underline"
          >
            ← Back to Projects
          </button>
        </div>
        <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
          {focusedProject?.name}
        </div>
      </div>

      {/* Main Layout: 3 Panels */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Projects Explorer */}
        <div className="w-56 border-r border-neutral-200 dark:border-neutral-800 overflow-y-auto bg-neutral-50 dark:bg-neutral-950">
          <div className="px-3 py-2 text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 uppercase sticky top-0 bg-white dark:bg-neutral-900 border-b">Projects</div>
          {loading === 'loading' && <div className="px-3 py-2 text-[11px] text-neutral-500 dark:text-neutral-400">Loading…</div>}
          {projects.map(p => {
            const isFocused = p.id === focusedProjectId
            return (
              <div
                key={p.id}
                onClick={() => onProjectClick(p)}
                className={`px-3 py-2 flex items-center gap-2 text-sm cursor-pointer truncate border-l-2 transition-colors
                  ${isFocused ? 'bg-orange-500/15 border-orange-500 text-orange-700 dark:text-orange-300' : 'border-transparent hover:bg-orange-500/5 text-neutral-900 dark:text-neutral-100'}`}
              >
                <FolderKanban size={14} className="text-orange-500 shrink-0" />
                <span className="truncate font-medium text-black dark:text-neutral-100">{p.name}</span>
              </div>
            )
          })}
        </div>

        {/* Middle: Folder Tree */}
        <div className="w-64 border-r border-neutral-200 dark:border-neutral-800 overflow-y-auto relative">
          <div className="px-3 py-2 text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 uppercase sticky top-0 bg-white dark:bg-neutral-900 z-10">Folders</div>
          {focusedTreeState?.loading === 'loading' && <div className="px-3 py-2 text-[11px] text-neutral-500 dark:text-neutral-400">Loading folders…</div>}
          <div className="relative">
            {focusedTreeState?.error && <div className="px-3 py-2 text-[11px] text-rose-500">{focusedTreeState.error}</div>}
            {focusedTree.map(f => (
              <FolderTreeNode key={f.id || f.urn} folder={f} onFolderClick={onFolderClick} project={focusedProject} userRole="USER" />
            ))}
          </div>
        </div>

        {/* Right: Folder Content & Documents */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* Breadcrumb */}
          {folderContent && (
            <div className="px-4 py-2 border-b border-neutral-200 dark:border-neutral-800 text-[12px] text-neutral-600 dark:text-neutral-300 flex items-center gap-1 sticky top-0 bg-white dark:bg-neutral-900">
              {folderContent.path?.split('/')?.filter(Boolean).map((seg, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight size={12} />}
                  <span className="truncate">{seg}</span>
                </span>
              )) || (
                <span>Root</span>
              )}
            </div>
          )}

          {/* Content */}
          {!folderContentState && (
            <div className="p-4 text-xs text-neutral-500 dark:text-neutral-400">Select a folder to view documents.</div>
          )}
          {folderContentState?.loading === 'loading' && (
            <div className="p-4 text-xs text-neutral-500 dark:text-neutral-400 animate-pulse">Loading folder…</div>
          )}
          {folderContentState?.error && (
            <div className="p-4 text-xs text-rose-500 dark:text-rose-400">{folderContentState.error}</div>
          )}

          {folderContentState?.loading === 'succeeded' && (
            <div className="flex-1 flex flex-col p-4">
              {/* Toolbar */}
              <div className="flex items-center gap-2 mb-3">
                <ToolbarButton
                  icon={Upload}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!urn}
                >
                  Upload
                </ToolbarButton>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Documents Table */}
              <div className="border rounded-lg overflow-hidden flex-1 flex flex-col">
                {/* Header */}
                <div className="grid text-[11px] font-medium uppercase tracking-wide text-neutral-600 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800 border-b" style={{ gridTemplateColumns: '2.5fr 0.8fr 1fr 1fr 60px' }}>
                  <div className="px-3 py-2">File Name</div>
                  <div className="px-3 py-2">Type</div>
                  <div className="px-3 py-2">Size</div>
                  <div className="px-3 py-2">Modified</div>
                  <div className="px-3 py-2 text-center">Action</div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto">
                  {docs.length === 0 && (
                    <div className="p-4 text-xs text-neutral-500 dark:text-neutral-400 text-center">No documents in this folder.</div>
                  )}
                  {docs.map(doc => {
                    const fileSize = parseInt(doc.sizeBytes || doc.size || 0)
                    const fileName = doc.name || doc.fileName || 'Untitled'
                    const fileExtension = fileName.split('.').pop()?.toUpperCase() || 'FILE'
                    
                    return (
                      <div key={doc.id || doc.name} className="grid text-xs border-t border-neutral-200 dark:border-neutral-800/60 hover:bg-orange-500/5 dark:hover:bg-orange-500/10 transition-colors items-center" style={{ gridTemplateColumns: '2.5fr 0.8fr 1fr 1fr 60px' }}>
                        <div className="px-3 py-2 flex items-center gap-2 truncate">
                          <FileText size={14} className="text-orange-500 shrink-0" />
                          <span title={fileName} className="truncate text-black dark:text-neutral-100 font-medium">{sliceName(fileName, 40)}</span>
                        </div>
                        <div className="px-3 py-2 text-neutral-500 dark:text-neutral-400 uppercase text-[10px]">{fileExtension}</div>
                        <div className="px-3 py-2 text-neutral-500 dark:text-neutral-400">{formatFileSize(fileSize)}</div>
                        <div className="px-3 py-2 text-neutral-500 dark:text-neutral-400">{formatDate(doc.createdAt || doc.updatedAt)}</div>
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
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
