import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import KebabOverlay from './KebabOverlay'
import { executeKebabAction, getActionDetails, selectKebabLoading, selectDetails } from '../../Redux/Public/kebabActionsSlice'
import { AlertTriangle, Trash2 } from 'lucide-react'

/**
 * DeleteFolderConfirm Component
 * Confirmation dialog for deleting a folder with information about consequences
 */
export default function DeleteFolderConfirm({ isOpen, onClose, folder, projectId, onSuccess }) {
  const dispatch = useDispatch()
  const [confirmed, setConfirmed] = useState(false)
  const loading = useSelector(selectKebabLoading)
  const details = useSelector(selectDetails)

  // Fetch deletion details when modal opens
  useEffect(() => {
    if (isOpen && folder?.id) {
      dispatch(
        getActionDetails({
          action: 'delete',
          projectId,
          folderId: folder.id
        })
      )
      setConfirmed(false)
    }
  }, [isOpen, folder?.id, projectId, dispatch])

  const handleDelete = async () => {
    if (!confirmed) return

    try {
      const result = await dispatch(
        executeKebabAction({
          action: 'delete',
          projectId,
          folderId: folder.id,
          payload: {}
        })
      ).unwrap()

      onSuccess?.(result)
      onClose()
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  const deletionDetails = details?.details || {}

  return (
    <KebabOverlay isOpen={isOpen} onClose={onClose} title="Delete Folder" size="sm">
      <div className="p-6 space-y-4">
        {/* Warning Icon & Message */}
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-rose-500 mt-0.5" />
          </div>
          <div>
            <p className="font-medium text-neutral-900 dark:text-neutral-100">
              Delete "{folder?.title || folder?.name}"?
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              This action cannot be undone. This will permanently delete this folder and all its contents.
            </p>
          </div>
        </div>

        {/* Deletion Info */}
        {deletionDetails.childFolders !== undefined && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium text-rose-700 dark:text-rose-400">
              This will delete:
            </p>
            <ul className="text-xs text-neutral-700 dark:text-neutral-300 space-y-1">
              {deletionDetails.files > 0 && (
                <li>• {deletionDetails.files} file{deletionDetails.files !== 1 ? 's' : ''}</li>
              )}
              {deletionDetails.childFolders > 0 && (
                <li>• {deletionDetails.childFolders} subfolder{deletionDetails.childFolders !== 1 ? 's' : ''}</li>
              )}
              {deletionDetails.totalItemsToDelete === 0 && (
                <li>• This empty folder</li>
              )}
            </ul>
          </div>
        )}

        {/* Confirmation Checkbox */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            disabled={loading === 'loading'}
            className="mt-1 w-4 h-4 accent-rose-500"
          />
          <span className="text-sm text-neutral-700 dark:text-neutral-300">
            Yes, I want to delete this folder permanently
          </span>
        </label>

        {/* Actions */}
        <div className="pt-2 flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading === 'loading'}
            className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={!confirmed || loading === 'loading'}
            className="px-4 py-2 text-sm font-medium text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Trash2 size={16} />
            {loading === 'loading' ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </KebabOverlay>
  )
}
