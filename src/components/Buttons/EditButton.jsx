import { Edit3 } from "lucide-react"

// Lightweight JS version for CRA
export function EditButton({ onClick, className = "", size = "md" }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  }

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18,
  }

  return (
    <button
      onClick={onClick}
      className={`
        ${sizeClasses[size]}
        bg-gray-800 hover:bg-gray-700 
        text-gray-400 hover:text-white
        rounded-lg border border-gray-700
        flex items-center justify-center
        transition-all duration-200 ease-in-out
        hover:shadow-md hover:scale-110
        active:scale-95
        ${className}
      `}
    >
      <Edit3 size={iconSizes[size]} />
    </button>
  )
}
