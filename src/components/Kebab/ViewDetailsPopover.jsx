import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import KebabOverlay from './KebabOverlay'
import { getActionDetails, selectDetailsLoading, selectDetailMetadata } from '../../Redux/Public/kebabActionsSlice'
import { Info, Folder, FileText, Users, Calendar } from 'lucide-react'

/**
 * ViewDetailsPopover Component
 * Shows detailed information about a folder
 */
export default function ViewDetailsPopover({ isOpen, onClose, folder, projectId }) {
  const dispatch = useDispatch()
  const loading = useSelector(selectDetailsLoading)
  const details = useSelector(selectDetailMetadata)

  // Fetch details when modal opens
  useEffect(() => {
    if (isOpen && folder?.id) {
      dispatch(
        getActionDetails({
          action: 'view_details',
          projectId,
          folderId: folder.id
        })
      )
    }
  }, [isOpen, folder?.id, projectId, dispatch])

  const formatDate = (dateString) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatBytes = (bytes) => {
    if (!bytes || bytes === '0') return '0 B'
    // Handle string input from API
    const numBytes = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes
    if (isNaN(numBytes)) return '0 B'
    if (numBytes < 1024) return `${numBytes} B`
    if (numBytes < 1024 * 1024) return `${(numBytes / 1024).toFixed(1)} KB`
    if (numBytes < 1024 * 1024 * 1024) return `${(numBytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(numBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }

  return (
    <KebabOverlay isOpen={isOpen} onClose={onClose} title="Folder Details" size="lg">
      <div className="p-6 space-y-5">
        {loading === 'loading' ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <Info className="w-6 h-6 text-orange-500" />
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-3">Loading details...</p>
          </div>
        ) : details ? (
          <>
            {/* Folder Name */}
            <div className="flex items-start gap-3">
              <Folder className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Name</p>
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-1 break-words">
                  {details.name}
                </p>
              </div>
            </div>

            {/* Path */}
            <div className="flex items-start gap-3">
              <Folder className="w-5 h-5 text-neutral-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Path</p>
                <p className="text-xs text-neutral-700 dark:text-neutral-300 mt-1 break-all font-mono">
                  {details.path || '—'}
                </p>
              </div>
            </div>

            {/* Files & Subfolders */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                <p className="text-xs font-medium text-orange-700 dark:text-orange-400 uppercase tracking-wide">Files</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-300 mt-2">
                  {details.files || 0}
                </p>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-xs font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wide">Subfolders</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-300 mt-2">
                  {details.childFolders || 0}
                </p>
              </div>
            </div>

            {/* Total Size */}
            <div className="bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-800/50 dark:to-neutral-800/30 rounded-lg p-4 flex items-start gap-3 border border-neutral-200 dark:border-neutral-700">
              <FileText className="w-5 h-5 text-neutral-600 dark:text-neutral-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">Total Size</p>
                <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mt-1">
                  {formatBytes(details.totalSize)}
                </p>
              </div>
            </div>

            {/* Owner */}
            {details.owner && (
              <div className="flex items-start gap-3 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                <Users className="w-5 h-5 text-neutral-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">Owner</p>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 mt-1 break-all font-mono">
                    {details.owner}
                  </p>
                </div>
              </div>
            )}

            {/* Created & Modified */}
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-neutral-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">Created</p>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-1">
                    {formatDate(details.created)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-neutral-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">Modified</p>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-1">
                    {formatDate(details.modified)}
                  </p>
                </div>
              </div>
            </div>

            {/* Permissions */}
            {details.permissions && details.permissions.length > 0 && (
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-blue-500" />
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Permissions by Role</p>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {details.permissions.map((perm) => (
                    <div
                      key={perm.id || perm.role}
                      className="text-xs bg-neutral-50 dark:bg-neutral-800/50 rounded p-3 border border-neutral-200 dark:border-neutral-700"
                    >
                      <p className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">{perm.role}</p>
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(perm.actions) && perm.actions.length > 0 ? (
                          perm.actions.map((action) => (
                            <span
                              key={action}
                              className="inline-block px-2.5 py-1 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 rounded text-xs font-medium hover:bg-orange-200 dark:hover:bg-orange-900/60 transition-colors"
                            >
                              {action}
                            </span>
                          ))
                        ) : (
                          <span className="text-neutral-500 dark:text-neutral-400 italic text-xs">No permissions</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Configurations */}
            {details.configurations && (
              <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4 mt-2">
                <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide mb-3">Settings</p>
                <div className="space-y-2.5 text-xs">
                  {details.configurations.autoSync !== undefined && (
                    <div className="flex justify-between items-center p-2.5 bg-neutral-50 dark:bg-neutral-800/50 rounded border border-neutral-200 dark:border-neutral-700">
                      <span className="text-neutral-700 dark:text-neutral-300 font-medium">Auto Sync</span>
                      <span className={`font-semibold ${details.configurations.autoSync ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {details.configurations.autoSync ? '✓ Enabled' : '✗ Disabled'}
                      </span>
                    </div>
                  )}
                  {details.configurations.maxFileSize && (
                    <div className="flex justify-between items-center p-2.5 bg-neutral-50 dark:bg-neutral-800/50 rounded border border-neutral-200 dark:border-neutral-700">
                      <span className="text-neutral-700 dark:text-neutral-300 font-medium">Max File Size</span>
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100">{details.configurations.maxFileSize}</span>
                    </div>
                  )}
                  {details.configurations.allowedTypes && (
                    <div className="flex justify-between items-center p-2.5 bg-neutral-50 dark:bg-neutral-800/50 rounded border border-neutral-200 dark:border-neutral-700">
                      <span className="text-neutral-700 dark:text-neutral-300 font-medium">Allowed Types</span>
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {Array.isArray(details.configurations.allowedTypes) 
                          ? details.configurations.allowedTypes.length > 0 && details.configurations.allowedTypes[0] === '*'
                            ? 'All'
                            : details.configurations.allowedTypes.join(', ')
                          : 'All'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 py-8 text-center">Unable to load details</p>
        )}

        {/* Close Button - Sticky Footer */}
        <div className="sticky bottom-0 pt-4 pb-1 flex justify-end border-t border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </KebabOverlay>
  )
}
