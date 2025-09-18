import React, { useState } from "react"
import { Search as SearchIcon, Bell, UserCircle2 } from "lucide-react"
import { ThemeSwitcher } from "../Buttons/SwitchButtons"
import { useTheme } from '../../theme/ThemeProvider'
import { useSelector, useDispatch } from 'react-redux'
import { selectAuthUser, logout } from '../../Redux/Public/authSlice'

export default function SmartNavbar({
	logo = "HR Office",
	notifications = 2,
	onSearch,
	userName: userNameProp,
	themeMode,
	onThemeChange,
	className = "",
}) {
	const [query, setQuery] = useState("")
    const authUser = useSelector(selectAuthUser)
    const dispatch = useDispatch()
    const userName = authUser?.name || authUser?.email || userNameProp || 'User'
    // Fallback to context if props not supplied
    const themeCtx = useTheme?.() || { mode: 'device', setMode: () => {} }
    const effectiveThemeMode = themeMode || themeCtx.mode || 'device'
    const handleThemeChange = onThemeChange || themeCtx.setMode

	const handleSubmit = (e) => {
		e.preventDefault()
		onSearch?.(query)
	}

	return (
		<header
			className={`w-full relative border-b border-orange-500/30 dark:border-orange-500/80 bg-white/70 dark:bg-transparent backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-neutral-900/40 transition-colors ${className}`}
		>
			<div className="max-w-7xl mx-auto h-12 px-4 flex items-center justify-between">
				{/* Logo */}
				<div className="flex items-center gap-2">
					<div className="w-7 h-7 rounded-md bg-neutral-200 dark:bg-neutral-800 ring-1 ring-neutral-300 dark:ring-neutral-700 grid place-items-center text-cyan-600 dark:text-cyan-400 font-semibold text-sm transition-colors">
						{logo?.[0] || "H"}
					</div>
						<span className="font-medium hidden sm:inline-block text-sm">{logo}</span>
				</div>

				{/* Search */}
				<form onSubmit={handleSubmit} className="hidden md:flex items-center relative w-full max-w-md">
					<SearchIcon size={16} className="absolute left-3 text-orange-600/70 dark:text-orange-400/70" />
					<input
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						className="w-full bg-white/60 dark:bg-transparent border border-orange-500/30 dark:border-orange-500/40 hover:border-orange-500/50 focus:border-orange-500/70 focus:ring-2 focus:ring-orange-500/30 text-neutral-800 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-500 rounded-lg pl-9 pr-3 py-1.5 text-sm outline-none transition-colors"
						placeholder="Search…"
					/>
				</form>

				{/* Right cluster */}
				<div className="flex items-center gap-2.5">
					{/* Mobile search fallback */}
					<button
						className="md:hidden w-8 h-8 rounded-md bg-white/60 dark:bg-transparent border border-orange-500/30 dark:border-orange-500/40 hover:border-orange-500/70 grid place-items-center text-orange-600 dark:text-orange-400 hover:bg-orange-500/10 transition-colors"
						aria-label="Search"
						onClick={() => onSearch?.(query)}
					>
						<SearchIcon size={15} />
					</button>

					{/* Notifications */}
					<button
						className="relative w-8 h-8 rounded-md bg-white/60 dark:bg-transparent border border-orange-500/30 dark:border-orange-500/40 hover:border-orange-500/70 grid place-items-center text-orange-600 dark:text-orange-400 hover:bg-orange-500/10 transition-colors"
						aria-label="Notifications"
					>
						<Bell size={15} />
						{notifications > 0 && (
							<span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-rose-500 text-white text-[9px] leading-[16px] grid place-items-center border border-orange-600/60">
								{notifications}
							</span>
						)}
					</button>

					{/* Theme switcher (re-mount on prop change to sync) */}
					<ThemeSwitcher key={effectiveThemeMode} defaultValue={effectiveThemeMode} onChange={handleThemeChange} className="hidden md:inline-flex" />

					{/* Profile */}
					<div className="relative group">
						<button className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-lg bg-neutral-200/80 dark:bg-neutral-800/70 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-300/70 dark:hover:bg-neutral-700 transition-colors text-sm">
							<UserCircle2 size={16} className="text-cyan-400" />
							<span className="hidden sm:inline leading-none">{userName}</span>
						</button>
						<div className="absolute right-0 mt-1 w-40 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-20">
							<button onClick={() => dispatch(logout())} className="w-full text-left px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700/60 transition-colors">Logout</button>
						</div>
					</div>
				</div>
			</div>
		</header>
	)
}
