import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import KebabOverlay from './KebabOverlay'
import { uploadFolderDocuments } from '../../Redux/Public/foldersSlice'
import { Upload, FileUp } from 'lucide-react'

/**
 * UploadFilesPopover Component
 * Allows users to upload files to the folder
 */
export default function UploadFilesPopover({ isOpen, onClose, folder, projectId, onSuccess }) {
  const dispatch = useDispatch()
  const [files, setFiles] = React.useState([])
  const [uploading, setUploading] = React.useState(false)
  const [error, setError] = React.useState('')
  const fileInputRef = React.useRef(null)

  const handleDrop = (e) => {
    e.preventDefault()
    const newFiles = Array.from(e.dataTransfer.files)
    setFiles([...files, ...newFiles])
  }

  const handleFileSelect = (e) => {
    const newFiles = Array.from(e.target.files || [])
    setFiles([...files, ...newFiles])
  }

  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    if (!projectId || !folder?.urn) {
      setError('Missing folder or project context')
      return
    }

    setUploading(true)
    setError('')

    try {
      // Use Redux thunk to upload documents
      await dispatch(
        uploadFolderDocuments({
          projectId,
          folderUrn: folder.urn,
          files
        })
      ).unwrap()

      setFiles([])
      onSuccess?.({ message: 'Files uploaded successfully' })
      onClose()
    } catch (err) {
      setError(err?.message || 'Failed to upload files')
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <KebabOverlay isOpen={isOpen} onClose={onClose} title="Upload Files" size="md">
      <div className="p-6 space-y-4">
        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg p-8 text-center hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <FileUp className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
          <p className="font-medium text-neutral-900 dark:text-neutral-100">
            Drop files here or click to select
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Maximum file size: 100MB
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {files.length} file{files.length !== 1 ? 's' : ''} selected
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-800 p-3 rounded text-sm"
                >
                  <div className="flex-1 truncate">
                    <p className="text-neutral-900 dark:text-neutral-100 truncate">{file.name}</p>
                    <p className="text-xs text-neutral-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(index)}
                    disabled={uploading}
                    className="ml-2 text-rose-500 hover:text-rose-700 disabled:opacity-50"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg">
            <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="pt-4 flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Upload size={16} />
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </KebabOverlay>
  )
}
