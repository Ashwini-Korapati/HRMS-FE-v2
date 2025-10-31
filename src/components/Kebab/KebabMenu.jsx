import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useDispatch } from 'react-redux'
import { MoreVertical } from 'lucide-react'
import AddSubfolderPopover from './AddSubfolderPopover'
import UploadFilesPopover from './UploadFilesPopover'
import ShareFolderPopover from './ShareFolderPopover'
import RenameFolderPopover from './RenameFolderPopover'
import DeleteFolderConfirm from './DeleteFolderConfirm'
import MoveFolderPopover from './MoveFolderPopover'
import ViewDetailsPopover from './ViewDetailsPopover'
import DownloadAllPopover from './DownloadAllPopover'
import { fetchProjectFolderTree, fetchFolderContent } from '../../Redux/Public/foldersSlice'

/**
 * KebabMenu Component
 * Main dropdown menu for folder actions with improved UX
 * Features:
 * - No scrolling or overflow (intelligent positioning)
 * - Popover-based action dialogs
 * - Keyboard navigation
 * - Click outside handling
 */
export default function KebabMenu({
  folder,
  projectId,
  onActionComplete,
  currentUserPermissions = ['view', 'upload', 'download', 'share'],
  userRole = 'USER'
}) {
  const dispatch = useDispatch()
  const [isOpen, setIsOpen] = useState(false)
  const [activePopover, setActivePopover] = useState(null)
  // pixel coordinates for the floating menu
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const menuRef = useRef(null)
  const buttonRef = useRef(null)

  // Available actions and their labels
  const actions = [
    { id: 'add_subfolder', label: 'New Subfolder', permission: 'upload' },
    { id: 'upload_files', label: 'Upload Files', permission: 'upload' },
    { id: 'rename', label: 'Rename', permission: 'upload' },
    { id: 'move', label: 'Move', permission: 'upload' },
    { id: 'share', label: 'Share', permission: 'share' },
    { id: 'view_details', label: 'Details', permission: 'view' },
    { id: 'download_all', label: 'Download', permission: 'download' },
    { id: 'delete', label: 'Delete', permission: 'delete', danger: true }
  ]

  // Filter actions based on user permissions
  const availableActions = actions.filter((action) => {
    const isOwner = folder?.createdById === localStorage.getItem('userId')
    const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'IT'].includes(userRole)

    if (isOwner || isAdmin) {
      return true
    }
    return currentUserPermissions.includes(action.permission)
  })

  // Compute pixel-perfect position after the menu mounts (align right edge to button)
  useEffect(() => {
    if (!isOpen || !buttonRef.current) return

    const computePosition = () => {
      const rect = buttonRef.current.getBoundingClientRect()
      // Temporarily ensure the menu exists for measurement
      const el = menuRef.current
      let menuW = 220
      let menuH = Math.min(availableActions.length * 44 + 8, 360)
      if (el) {
        menuW = el.offsetWidth || menuW
        menuH = el.offsetHeight || menuH
      }

      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      const positionIsTop = (spaceBelow < menuH + 10 && spaceAbove > menuH + 10)
      const top = positionIsTop ? rect.top - 8 - menuH : rect.bottom + 4
      // Align the right edge of the menu to the button's right edge with viewport clamping
      let left = rect.right - menuW
      left = Math.min(left, window.innerWidth - menuW - 8)
      left = Math.max(8, left)
      setCoords({ top: Math.max(8, top), left })
    }

    // Initial compute and on resize/scroll
    computePosition()
    const onScroll = () => computePosition()
    const onResize = () => computePosition()
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onResize)
    }
  }, [isOpen, availableActions.length])

  // Handle clicks outside menu
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target) &&
          buttonRef.current && !buttonRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }

    // If a popover is active, keep the menu open and ignore outside clicks
    if (isOpen && !activePopover) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, activePopover])

  // Handle keyboard navigation
  useEffect(() => {
    function handleKeydown(e) {
      if (e.key === 'Escape') {
        setIsOpen(false)
        setActivePopover(null)
      }
    }

    if (isOpen || activePopover) {
      document.addEventListener('keydown', handleKeydown)
      return () => document.removeEventListener('keydown', handleKeydown)
    }
  }, [isOpen, activePopover])

  const handleActionClick = (actionId) => {
    // Close the dropdown immediately and open the corresponding popover
    setIsOpen(false)
    setActivePopover(actionId)
  }

  const handlePopoverClose = () => {
    setActivePopover(null)
  }

  const handleActionSuccess = (actionId, result) => {
    // Refetch folder tree to show updated structure (new subfolders, deletions, etc.)
    dispatch(fetchProjectFolderTree(projectId))
    // Refetch folder content if we're viewing this folder's contents
    if (folder?.urn) {
      dispatch(fetchFolderContent({ projectId, folderUrn: folder.urn }))
    }
    onActionComplete?.(actionId, result)
    handlePopoverClose()
  }

  // Guard: return if missing required props or no available actions
  if (!folder || !projectId || availableActions.length === 0) {
    return null
  }

  return (
    <>
      {/* Kebab Button */}
      <div className="inline-block">
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md transition-all duration-200 text-neutral-500 dark:text-neutral-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-100/50 dark:hover:bg-orange-900/30 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
          title="More actions"
          aria-label="More actions"
          aria-expanded={isOpen}
        >
          <MoreVertical size={18} className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
        </button>
      </div>

      {/* Dropdown Menu - Render via portal to avoid transformed parents affecting fixed positioning */}
      {isOpen && createPortal(
        (
          <div
            ref={menuRef}
            className={`fixed min-w-[200px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl z-[9999] py-1 animate-in fade-in zoom-in-95 duration-150 text-black dark:text-neutral-300`}
            style={{ position: 'fixed', top: `${coords.top}px`, left: `${coords.left}px` }}
            role="menu"
            aria-orientation="vertical"
          >
            {availableActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleActionClick(action.id)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-all duration-150 flex items-center gap-3 whitespace-nowrap
                  ${action.danger
                    ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20'
                    : 'text-black dark:text-neutral-300 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                  }`}
                role="menuitem"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${action.danger ? 'bg-rose-500' : 'bg-orange-500'} opacity-70`} />
                <span className="font-medium text-xs uppercase tracking-wide text-black dark:text-neutral-200">{action.label}</span>
              </button>
            ))}
          </div>
        ),
        document.body
      )}

      {/* Popovers - Rendered Outside Menu to Prevent Clipping */}
      {activePopover === 'add_subfolder' && (
        <AddSubfolderPopover
          isOpen
          onClose={handlePopoverClose}
          folder={folder}
          projectId={projectId}
          onSuccess={(result) => handleActionSuccess('add_subfolder', result)}
        />
      )}

      {activePopover === 'upload_files' && (
        <UploadFilesPopover
          isOpen
          onClose={handlePopoverClose}
          folder={folder}
          projectId={projectId}
          onSuccess={(result) => handleActionSuccess('upload_files', result)}
        />
      )}

      {activePopover === 'rename' && (
        <RenameFolderPopover
          isOpen
          onClose={handlePopoverClose}
          folder={folder}
          projectId={projectId}
          onSuccess={(result) => handleActionSuccess('rename', result)}
        />
      )}

      {activePopover === 'move' && (
        <MoveFolderPopover
          isOpen
          onClose={handlePopoverClose}
          folder={folder}
          projectId={projectId}
          onSuccess={(result) => handleActionSuccess('move', result)}
        />
      )}

      {activePopover === 'share' && (
        <ShareFolderPopover
          isOpen
          onClose={handlePopoverClose}
          folder={folder}
          projectId={projectId}
          onSuccess={(result) => handleActionSuccess('share', result)}
        />
      )}

      {activePopover === 'view_details' && (
        <ViewDetailsPopover
          isOpen
          onClose={handlePopoverClose}
          folder={folder}
          projectId={projectId}
        />
      )}

      {activePopover === 'download_all' && (
        <DownloadAllPopover
          isOpen
          onClose={handlePopoverClose}
          folder={folder}
          projectId={projectId}
          onSuccess={(result) => handleActionSuccess('download_all', result)}
        />
      )}

      {activePopover === 'delete' && (
        <DeleteFolderConfirm
          isOpen
          onClose={handlePopoverClose}
          folder={folder}
          projectId={projectId}
          onSuccess={(result) => handleActionSuccess('delete', result)}
        />
      )}
    </>
  )
}
