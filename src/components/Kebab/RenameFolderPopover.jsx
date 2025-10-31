import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import KebabOverlay from './KebabOverlay'
import { executeKebabAction, selectKebabLoading } from '../../Redux/Public/kebabActionsSlice'
import { Folder } from 'lucide-react'

/**
 * RenameFolderPopover Component
 * Allows users to rename the current folder
 */
export default function RenameFolderPopover({ isOpen, onClose, folder, projectId, onSuccess }) {
  const dispatch = useDispatch()
  const [newName, setNewName] = useState('')
  const [error, setError] = useState('')
  const loading = useSelector(selectKebabLoading)

  // Initialize with current folder name
  useEffect(() => {
    if (isOpen) {
      setNewName(folder?.title || folder?.name || '')
      setError('')
    }
  }, [isOpen, folder])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!newName.trim()) {
      setError('Folder name is required')
      return
    }

    if (newName === (folder?.title || folder?.name)) {
      setError('Please enter a different name')
      return
    }

    try {
      const result = await dispatch(
        executeKebabAction({
          action: 'rename',
          projectId,
          folderId: folder.id,
          payload: { newName: newName.trim() }
        })
      ).unwrap()

      onSuccess?.(result)
      onClose()
    } catch (err) {
      setError(err || 'Failed to rename folder')
    }
  }

  return (
    <KebabOverlay isOpen={isOpen} onClose={onClose} title="Rename Folder">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            New Name
          </label>
          <div className="flex items-center gap-2 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-transparent">
            <Folder size={18} className="text-orange-500" />
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter new folder name"
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
            disabled={loading === 'loading' || !newName.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading === 'loading' ? 'Renaming...' : 'Rename'}
          </button>
        </div>
      </form>
    </KebabOverlay>
  )
}
