import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import KebabOverlay from './KebabOverlay'
import { executeKebabAction, getActionDetails, selectKebabLoading, selectDetails } from '../../Redux/Public/kebabActionsSlice'
import { Share2 } from 'lucide-react'

/**
 * ShareFolderPopover Component
 * Allows users to share folder with roles/users
 */
export default function ShareFolderPopover({ isOpen, onClose, folder, projectId, onSuccess }) {
  const dispatch = useDispatch()
  const loading = useSelector(selectKebabLoading)
  const details = useSelector(selectDetails)
  const [recipients, setRecipients] = useState([])
  const [selectedRole, setSelectedRole] = useState('USER')
  const [permissions, setPermissions] = useState({
    view: true,
    upload: false,
    download: true,
    share: false,
    delete: false
  })

  // Fetch sharing details when modal opens
  useEffect(() => {
    if (isOpen && folder?.id) {
      dispatch(
        getActionDetails({
          action: 'share',
          projectId,
          folderId: folder.id
        })
      )
      // Reset form
      setRecipients([])
      setSelectedRole('USER')
      setPermissions({ view: true, upload: false, download: true, share: false, delete: false })
    }
  }, [isOpen, folder?.id, projectId, dispatch])

  const roles = details?.details?.availableRoles || ['USER', 'ADMIN', 'IT', 'SUPER_ADMIN']

  const handleAddRecipient = () => {
    setRecipients([
      ...recipients,
      {
        role: selectedRole,
        actions: Object.keys(permissions).filter(key => permissions[key])
      }
    ])
    setPermissions({ view: true, upload: false, download: true, share: false })
    setSelectedRole('USER')
  }

  const handleRemoveRecipient = (index) => {
    setRecipients(recipients.filter((_, i) => i !== index))
  }

  const handleShare = async () => {
    if (recipients.length === 0) return

    try {
      const result = await dispatch(
        executeKebabAction({
          action: 'share',
          projectId,
          folderId: folder.id,
          payload: { recipients }
        })
      ).unwrap()

      setRecipients([])
      onSuccess?.(result)
      onClose()
    } catch (err) {
      console.error('Share error:', err)
    }
  }

  return (
    <KebabOverlay isOpen={isOpen} onClose={onClose} title="Share Folder" size="md">
      <div className="p-6 space-y-4">
        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Share with Role
          </label>
          <div className="flex gap-2">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm"
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Permissions */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
            Permissions
          </label>
          <div className="space-y-2">
            {Object.entries(permissions).map(([perm, checked]) => (
              <label key={perm} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) =>
                    setPermissions({ ...permissions, [perm]: e.target.checked })
                  }
                  className="rounded"
                />
                <span className="text-sm text-neutral-700 dark:text-neutral-300 capitalize">
                  {perm}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Add Button */}
        <button
          onClick={handleAddRecipient}
          disabled={loading === 'loading'}
          className="w-full px-4 py-2 text-sm font-medium text-orange-600 dark:text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 rounded-lg transition-colors disabled:opacity-50"
        >
          + Add Role
        </button>

        {/* Recipients List */}
        {recipients.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase">
              Sharing with {recipients.length} role{recipients.length !== 1 ? 's' : ''}
            </p>
            {recipients.map((recipient, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-800 p-3 rounded text-sm"
              >
                <div>
                  <p className="font-medium text-neutral-900 dark:text-neutral-100">
                    {recipient.role}
                  </p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                    {recipient.actions.join(', ') || 'No permissions'}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveRecipient(index)}
                  className="text-rose-500 hover:text-rose-700 p-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

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
            onClick={handleShare}
            disabled={recipients.length === 0 || loading === 'loading'}
            className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Share2 size={16} />
            Share
          </button>
        </div>
      </div>
    </KebabOverlay>
  )
}
