import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import KebabOverlay from './KebabOverlay'
import { getActionDetails, selectDetailsLoading, selectDetails } from '../../Redux/Public/kebabActionsSlice'
import { Download, FileArchive, Zap } from 'lucide-react'

/**
 * DownloadAllPopover Component
 * Allows users to download all files from a folder as a zip
 */
export default function DownloadAllPopover({ isOpen, onClose, folder, projectId, onSuccess }) {
  const dispatch = useDispatch()
  const loading = useSelector(selectDetailsLoading)
  const details = useSelector(selectDetails)
  const [downloading, setDownloading] = useState(false)

  // Fetch download details when modal opens
  useEffect(() => {
    if (isOpen && folder?.id) {
      dispatch(
        getActionDetails({
          action: 'download_all',
          projectId,
          folderId: folder.id
        })
      )
    }
  }, [isOpen, folder?.id, projectId, dispatch])

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }

  const handleDownload = async () => {
    const downloadDetails = details?.metadata || details?.data || details
    if (!downloadDetails) return

    setDownloading(true)
    try {
      // Create download link from zip endpoint
      const companyId = localStorage.getItem('companyId')
      const token = localStorage.getItem('token')

      // For now, we trigger a download through a generated URL
      // In production, the backend would return a signed download URL or start a job
      const downloadLink = downloadDetails.downloadUrl || 
        `/api/${companyId}/projects/${projectId}/folders/${folder.id}/download`

      const link = document.createElement('a')
      link.href = downloadLink
      link.download = `${folder.title || folder.name}.zip`
      link.setAttribute('Authorization', `Bearer ${token}`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      onSuccess?.({ message: 'Download started' })
      onClose()
    } catch (error) {
      console.error('Download error:', error)
    } finally {
      setDownloading(false)
    }
  }

  const downloadDetails = details?.metadata || details?.data || details

  return (
    <KebabOverlay isOpen={isOpen} onClose={onClose} title="Download Folder" size="sm">
      <div className="p-6 space-y-4">
        {loading === 'loading' ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin">
              <FileArchive className="w-8 h-8 text-orange-500" />
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-3">
              Preparing download...
            </p>
          </div>
        ) : downloadDetails ? (
          <>
            {/* Download Info */}
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <FileArchive className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-orange-900 dark:text-orange-200">
                    {downloadDetails.folderName}
                  </p>
                  <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                    Will be downloaded as ZIP
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded">
                <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase">
                  Files
                </p>
                <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mt-1">
                  {downloadDetails.fileCount}
                </p>
              </div>
              <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded">
                <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase">
                  Size
                </p>
                <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mt-1">
                  {formatBytes(downloadDetails.totalSize)}
                </p>
              </div>
            </div>

            {/* Info */}
            {downloadDetails.fileCount === 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  ⚠ This folder is empty. No files to download.
                </p>
              </div>
            )}

            {downloadDetails.totalSize > 100 * 1024 * 1024 && (
              <div className="flex items-start gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                <Zap size={14} className="mt-0.5 flex-shrink-0" />
                <p>Large download: may take a few moments</p>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 flex gap-3 justify-end">
              <button
                onClick={onClose}
                disabled={downloading}
                className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDownload}
                disabled={downloading || downloadDetails.fileCount === 0}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Download size={16} />
                {downloading ? 'Downloading...' : 'Download ZIP'}
              </button>
            </div>
          </>
        ) : (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 py-4">
            Unable to load download information
          </p>
        )}
      </div>
    </KebabOverlay>
  )
}
