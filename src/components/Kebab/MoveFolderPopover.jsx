import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import KebabOverlay from './KebabOverlay'
import { executeKebabAction, getActionDetails, selectKebabLoading, selectDetails } from '../../Redux/Public/kebabActionsSlice'
import { FolderOpen, ArrowRight } from 'lucide-react'

/**
 * MoveFolderPopover Component
 * Allows users to move folder to a different location
 */
export default function MoveFolderPopover({ isOpen, onClose, folder, projectId, onSuccess }) {
  const dispatch = useDispatch()
  const loading = useSelector(selectKebabLoading)
  const details = useSelector(selectDetails)
  const [selectedDestination, setSelectedDestination] = useState(null)
  const [availableFolders, setAvailableFolders] = useState([])

  // Fetch available destinations
  useEffect(() => {
    if (isOpen && folder?.id) {
      dispatch(
        getActionDetails({
          action: 'move',
          projectId,
          folderId: folder.id
        })
      )
    }
  }, [isOpen, folder?.id, projectId, dispatch])

  // Update available folders when details change
  useEffect(() => {
    if (details?.details?.availableDestinations) {
      setAvailableFolders(details.details.availableDestinations)
      if (details.details.availableDestinations.length > 0) {
        setSelectedDestination(details.details.availableDestinations[0].id)
      }
    }
  }, [details])

  const handleMove = async () => {
    if (!selectedDestination) return

    try {
      const result = await dispatch(
        executeKebabAction({
          action: 'move',
          projectId,
          folderId: folder.id,
          payload: { destinationFolderId: selectedDestination }
        })
      ).unwrap()

      onSuccess?.(result)
      onClose()
    } catch (err) {
      console.error('Move error:', err)
    }
  }

  const selectedFolderName = availableFolders.find(f => f.id === selectedDestination)?.name

  return (
    <KebabOverlay isOpen={isOpen} onClose={onClose} title="Move Folder" size="md">
      <div className="p-6 space-y-4">
        {loading === 'loading' ? (
          <div className="text-center py-8">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading destinations...</p>
          </div>
        ) : availableFolders.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 py-4">
            No available destination folders
          </p>
        ) : (
          <>
            {/* Current Folder */}
            <div className="flex items-center gap-2 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <FolderOpen className="w-5 h-5 text-orange-500 flex-shrink-0" />
              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                {folder?.title || folder?.name}
              </span>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <ArrowRight className="w-5 h-5 text-neutral-400" />
            </div>

            {/* Destination Selection */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Move to Folder
              </label>
              <select
                value={selectedDestination || ''}
                onChange={(e) => setSelectedDestination(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm"
              >
                {availableFolders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                    {f.path ? ` (${f.path})` : ''}
                  </option>
                ))}
              </select>
              {selectedFolderName && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                  Selected: <span className="font-medium">{selectedFolderName}</span>
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="pt-4 flex gap-3 justify-end">
              <button
                onClick={onClose}
                disabled={loading === 'loading'}
                className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleMove}
                disabled={!selectedDestination || loading === 'loading'}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading === 'loading' ? 'Moving...' : 'Move'}
              </button>
            </div>
          </>
        )}
      </div>
    </KebabOverlay>
  )
}
