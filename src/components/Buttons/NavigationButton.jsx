import React from "react"
import { ArrowLeft, ArrowRight, X } from "lucide-react"

export function GoBackButton({ onClick, className = "", children = "Go back" }) {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-2 px-4 py-2 
        bg-gray-800 hover:bg-gray-700 
        text-white text-sm font-medium
        rounded-lg border border-gray-700
        transition-all duration-200 ease-in-out
        hover:shadow-md hover:scale-[1.02]
        active:scale-[0.98]
        ${className}
      `}
    >
      <ArrowLeft size={16} />
      {children}
    </button>
  )
}

export function ContinueButton({
  onClick,
  className = "",
  children = "Continue",
  disabled = false,
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-6 py-2 
        bg-cyan-500 hover:bg-cyan-400 
        disabled:bg-gray-600 disabled:cursor-not-allowed
        text-white text-sm font-medium
        rounded-lg
        transition-all duration-200 ease-in-out
        hover:shadow-lg hover:scale-[1.02]
        active:scale-[0.98]
        disabled:hover:scale-100 disabled:hover:shadow-none
        ${className}
      `}
    >
      <span className="inline-flex items-center gap-2">
        {children}
        <ArrowRight size={16} />
      </span>
    </button>
  )
}

export function CancelButton({
  onClick,
  className = "",
  children = "Cancel",
  disabled = false,
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center gap-2 px-4 py-2 
        bg-gray-800 hover:bg-gray-700 
        text-red-400 hover:text-white text-sm font-medium
        rounded-lg border border-gray-700
        transition-all duration-200 ease-in-out
        hover:shadow-md hover:scale-[1.02]
        active:scale-[0.98]
        disabled:opacity-60 disabled:cursor-not-allowed
        ${className}
      `}
    >
      <X size={16} />
      {children}
    </button>
  )
}
