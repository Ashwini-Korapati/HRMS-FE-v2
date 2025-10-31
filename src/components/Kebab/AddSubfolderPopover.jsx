import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import KebabOverlay from './KebabOverlay'
import { executeKebabAction, selectKebabLoading } from '../../Redux/Public/kebabActionsSlice'
import { Folder } from 'lucide-react'

/**
 * AddSubfolderPopover Component
 * Allows users to create a new subfolder within the current folder
 */
export default function AddSubfolderPopover({ isOpen, onClose, folder, projectId, onSuccess }) {
  const dispatch = useDispatch()
  const [folderName, setFolderName] = useState('')
  const [error, setError] = useState('')
  const loading = useSelector(selectKebabLoading)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!folderName.trim()) {
      setError('Folder name is required')
      return
    }

    if (!projectId || !folder?.id) {
      setError('Missing folder or project context')
      return
    }

    try {
      const result = await dispatch(
        executeKebabAction({
          action: 'add_subfolder',
          projectId,
          folderId: folder.id,
          payload: { folderName: folderName.trim() }
        })
      ).unwrap()

      setFolderName('')
      onSuccess?.(result)
      onClose()
    } catch (err) {
      setError(err || 'Failed to create folder')
    }
  }

  return (
    <KebabOverlay isOpen={isOpen} onClose={onClose} title="Create Subfolder">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Folder Name
          </label>
          <div className="flex items-center gap-2 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-transparent">
            <Folder size={18} className="text-orange-500" />
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="e.g., Q4 Reports"
              autoFocus
              className="flex-1 bg-transparent outline-none text-neutral-900 dark:text-neutral-100 placeholder-neutral-500"
              disabled={loading === 'loading'}
            />
          </div>
          {error && <p className="text-xs text-rose-500 mt-2">{error}</p>}
        </div>

        <div className="pt-2 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading === 'loading'}
            className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading === 'loading' || !folderName.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading === 'loading' ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </KebabOverlay>
  )
}
