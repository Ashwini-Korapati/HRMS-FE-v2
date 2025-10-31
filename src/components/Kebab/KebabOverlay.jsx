import React, { useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

/**
 * KebabOverlay - Reusable overlay portal for all kebab popovers
 * Features:
 * - Renders to document body
 * - Blur background
 * - Dismissible by clicking outside, Esc key, or close button
 * - Focus trap
 */
export default function KebabOverlay({ isOpen, onClose, children, title = '', size = 'md' }) {
  const overlayRef = useRef(null)
  const contentRef = useRef(null)

  // Handle Esc key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose?.()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  // Focus trap
  useEffect(() => {
    if (!isOpen || !contentRef.current) return

    const focusableElements = contentRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    function handleTabKey(e) {
      if (e.key !== 'Tab') return
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault()
        lastElement?.focus()
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault()
        firstElement?.focus()
      }
    }

    firstElement?.focus()
    document.addEventListener('keydown', handleTabKey)
    return () => document.removeEventListener('keydown', handleTabKey)
  }, [isOpen])

  // Handle click outside
  const handleBackdropClick = useCallback(
    (e) => {
      if (e.target === overlayRef.current) {
        onClose?.()
      }
    },
    [onClose]
  )

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-2xl',
    lg: 'max-w-3xl',
    xl: 'max-w-4xl'
  }

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity p-4"
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={contentRef}
        className={`${sizeClasses[size] || sizeClasses.md} w-full max-h-[90vh] bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col`}
      >
        {/* Header */}
        {title && (
          <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 z-10">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X size={20} className="text-neutral-500 dark:text-neutral-400" />
            </button>
          </div>
        )}

        {/* Content - Scrollable */}
        <div className="overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}
