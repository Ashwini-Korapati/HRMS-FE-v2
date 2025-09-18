import React, { useState, useMemo, useEffect } from "react"
import {
	LayoutDashboard,
	Users,
	Briefcase,
	CheckSquare,
	MessageSquare,
	Folder,
	BarChart3,
	FileText,
	CreditCard,
	Clock,
	CalendarDays,
	HelpCircle,
	LogOut,
	UserCircle2,
	UsersRound
} from "lucide-react"
import { useSelector, useDispatch } from 'react-redux'
import { selectAuthRoutes, logout, selectAuthState, selectBasePath } from '../../Redux/Public/authSlice'
import { useLocation, useNavigate } from 'react-router-dom'

const buildFallbackNav = (basePath) => [
	{
		key: 'overview',
		label: 'Overview',
		icon: LayoutDashboard,
		path: basePath ? `${basePath}/overview` : '/overview'
	}
]

export default function SmartSidebar({ items, className = "", onSelect, basePath: propBasePath }) {
	const routes = useSelector(selectAuthRoutes)
	// auth state kept for potential future use; currently only basePath & routes used
	useSelector(selectAuthState)
	const selectorBasePath = useSelector(selectBasePath)
	const dispatch = useDispatch()
	const location = useLocation()
	const navigate = useNavigate()
	// choose explicit prop first, then selector; normalize (strip trailing slash)
	const basePath = useMemo(() => {
		const raw = (propBasePath || selectorBasePath || '').trim()
		if (!raw) return ''
		// ensure leading slash, remove trailing
		const withLead = raw.startsWith('/') ? raw : `/${raw}`
		return withLead.replace(/\/$/, '')
	}, [propBasePath, selectorBasePath])

	const derivedItems = useMemo(() => {
		if (items && items.length) return items
		if (!routes || !routes.length) return buildFallbackNav(basePath)
		// map routes to nav items; choose icon heuristically
		const iconMap = {
			'overview': LayoutDashboard,
			'users': Users,
			'departments': Folder,
			'designations': Briefcase,
			'leaves': CalendarDays,
			'attendance': Clock,
			'payroll': CreditCard,
			'projects': Briefcase,
			'tasks': CheckSquare,
			'holidays': CalendarDays,
			'announcements': MessageSquare,
			'reports': FileText,
			'analytics': BarChart3,
			'team': UsersRound || Users,
			'profile': UserCircle2,
			'companies': Folder,
			'system admin': Briefcase,
			'system-admin': Briefcase,
			'subscriptions': CreditCard
		}
		const mapped = routes.map(r => {
			let path = ''
			// Prefer absolute URL if provided (already includes dynamic company / platform segment)
			if (r.url) {
				try { path = new URL(r.url).pathname } catch { path = r.url }
			} else if (r.path) {
				path = r.path.startsWith('/') ? r.path : `/${r.path}`
			}
			// If we only have a relative segment (missing basePath) then prefix it
			if (path && basePath && !path.startsWith(basePath)) {
				// avoid duplicating basePath if path already contains the dynamic id somewhere else
				const pathParts = path.split('/').filter(Boolean)
				const baseLast = basePath.split('/').filter(Boolean).pop()
				if (!pathParts.includes(baseLast)) {
					path = `${basePath}${path}`
				} else if (!path.startsWith('/')) {
					path = `/${path}`
				}
			}
			// derive key/label
			const lastSeg = (path || '').split('/').filter(Boolean).pop() || 'overview'
			const key = lastSeg.toLowerCase()
			return {
				key,
				label: r.label || lastSeg,
				icon: iconMap[key] || Folder,
				path: path || (basePath ? `${basePath}/overview` : '/overview')
			}
		})
		// de-duplicate by key keeping first occurrence
		const unique = []
		const seen = new Set()
		for (const m of mapped) {
			if (!seen.has(m.key)) { unique.push(m); seen.add(m.key) }
		}
		// eslint-disable-next-line no-console
		console.debug('[Sidebar] build items', { basePath, count: unique.length, sample: unique.slice(0,3) })
		return unique
	}, [routes, items, basePath])

  const [active, setActive] = useState(() => {
    const current = derivedItems.find(i => location.pathname === i.path || location.pathname.startsWith(i.path + '/'))
    return current ? current.key : derivedItems[0]?.key
  })

  useEffect(() => {
    const current = derivedItems.find(i => location.pathname === i.path || location.pathname.startsWith(i.path + '/'))
    if (current && current.key !== active) setActive(current.key)
  }, [location.pathname, derivedItems, active])

  const handleSelect = (key) => {
    setActive(key)
    const item = derivedItems.find(i => i.key === key)
    if (item?.path) navigate(item.path)
    onSelect?.(key)
  }

	return (
		<aside className={`group relative bg-neutral-50/40 dark:bg-transparent backdrop-blur supports-[backdrop-filter]:bg-neutral-50/60 dark:supports-[backdrop-filter]:bg-neutral-950/40 border-r border-orange-500/20 dark:border-orange-500/60 transition-colors ${className}`}>
			{/* Sidebar width collapses to icons and expands on hover */}
			<div
				className={`h-[calc(100vh-48px)] transition-[width] duration-300 ease-in-out overflow-hidden flex flex-col
				w-14 group-hover:w-56`}
			>
				{/* Nav list with scroll (scrollbars hidden) */}
				<nav className="flex-1 overflow-y-auto overflow-x-hidden py-1 no-scrollbar">
					{derivedItems.map(({ key, label, icon: Icon, path }) => {
						const isActive = key === active
						return (
							<button
								key={key}
								onClick={() => handleSelect(key)}
								title={label}
								className={`w-full flex px-2.5 py-1.5 text-xs transition-colors
									${isActive ? "text-orange-700 dark:text-orange-400" : "text-neutral-600 hover:text-orange-700 dark:text-neutral-400 dark:hover:text-orange-400"}`}
							>
								<span
									className={`relative inline-flex items-center gap-3
									after:content-[''] after:absolute after:-bottom-0.5 after:left-0 after:h-[2px] after:bg-orange-500 after:rounded-full after:transition-transform after:duration-300 after:origin-left
									${isActive ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100"}`}
									data-path={path}
								>
									<span className={`w-8 h-8 grid place-items-center rounded-md text-current transition-colors ${isActive ? "bg-orange-500/10 dark:bg-transparent" : "group-hover:bg-orange-500/5"}`}>
										<Icon size={16} />
									</span>
									<span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
										{label}
									</span>
								</span>
							</button>
						)
					})}
				</nav>

				{/* Footer */}
				<div className="border-t border-orange-500/20 dark:border-orange-500/40 p-2">
					<button className="w-full flex items-center gap-3 px-2.5 py-1.5 text-xs text-neutral-600 hover:text-orange-700 dark:text-neutral-400 dark:hover:text-orange-400 transition-colors">
						<span className="w-8 h-8 grid place-items-center rounded-md border border-transparent bg-transparent group-hover:border-orange-500/40 group-hover:bg-orange-500/5 transition-colors">
							<HelpCircle size={16} />
						</span>
						<span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">Help</span>
					</button>
					<button onClick={() => dispatch(logout())} className="w-full flex items-center gap-3 px-2.5 py-1.5 text-xs text-neutral-600 hover:text-orange-700 dark:text-neutral-400 dark:hover:text-orange-400 transition-colors">
						<span className="w-8 h-8 grid place-items-center rounded-md border border-transparent bg-transparent group-hover:border-orange-500/40 group-hover:bg-orange-500/5 transition-colors">
							<LogOut size={16} />
						</span>
						<span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">Logout</span>
					</button>
				</div>
			</div>
		</aside>
	)
}
