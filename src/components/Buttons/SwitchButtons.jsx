import { useState } from "react"
import { Sun, Moon, Monitor } from "lucide-react"

export function ThemeSwitcher({ defaultValue = "device", onChange, className = "" }) {
  const [selectedTheme, setSelectedTheme] = useState(defaultValue)

  const handleThemeChange = (theme) => {
    setSelectedTheme(theme)
    onChange?.(theme)
  }

  const options = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "device", label: "Device", icon: Monitor },
  ]

  return (
    <div className={`inline-flex rounded-md border border-orange-500/50 bg-transparent p-0.5 gap-0.5 ${className}`}>
      {options.map(({ value, label, icon: Icon }) => {
        const active = selectedTheme === value
        return (
          <button
            key={value}
            type="button"
            onClick={() => handleThemeChange(value)}
            className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] text-[11px] font-medium tracking-wide uppercase
              transition-colors duration-150 border
              ${active
                ? "border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400"
                : "border-transparent text-neutral-500 hover:text-orange-600 dark:text-neutral-400 dark:hover:text-orange-400 hover:bg-orange-500/5"}
            `}
          >
            <Icon size={13} />
            {label}
          </button>
        )
      })}
    </div>
  )
}
