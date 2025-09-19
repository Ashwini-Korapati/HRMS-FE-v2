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
	UsersRound,
	ChevronDown
} from "lucide-react"
import { useSelector, useDispatch } from 'react-redux'
import { selectAuthRoutes, selectAuthRouteTree, logout, selectAuthState, selectBasePath } from '../../Redux/Public/authSlice'
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
	const routeTree = useSelector(selectAuthRouteTree)
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
		if ((!routes || !routes.length) && (!routeTree || !routeTree.length)) return buildFallbackNav(basePath)
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
		// Base flat mapped list
		const mapped = (routes || []).map(r => {
			let path = ''
			if (r.url) {
				try { path = new URL(r.url).pathname } catch { path = r.url }
			} else if (r.path) {
				path = r.path.startsWith('/') ? r.path : `/${r.path}`
			}
			if (path && basePath && !path.startsWith(basePath)) {
				const pathParts = path.split('/').filter(Boolean)
				const baseLast = basePath.split('/').filter(Boolean).pop()
				if (!pathParts.includes(baseLast)) {
					path = `${basePath}${path}`
				} else if (!path.startsWith('/')) {
					path = `/${path}`
				}
			}
			const segments = (path || '').split('/').filter(Boolean)
			const lastSeg = segments[segments.length - 1] || 'overview'
			const key = segments.join('-').toLowerCase() || lastSeg.toLowerCase()
			return {
				key,
				label: r.label || lastSeg,
				icon: iconMap[lastSeg] || Folder,
				path: path || (basePath ? `${basePath}/overview` : '/overview')
			}
		})

		// If we have a hierarchical tree (preferred for children rendering)
		if (routeTree && routeTree.length) {
			const groups = []
			for (const node of routeTree) {
				let path = ''
				if (node.url) { try { path = new URL(node.url).pathname } catch { path = node.url } } else path = node.path
				path = path?.startsWith('/') ? path : `/${path || ''}`
				if (basePath && !path.startsWith(basePath)) path = `${basePath}${path}`
				const parentKey = path.split('/').filter(Boolean).join('-') || 'root'
				const ParentIcon = iconMap[(node.path || '').split('/').filter(Boolean).pop()] || Folder
				if (node.children && node.children.length) {
					const children = node.children.map(ch => {
						let cPath = ''
						if (ch.url) { try { cPath = new URL(ch.url).pathname } catch { cPath = ch.url } } else cPath = ch.path
						cPath = cPath?.startsWith('/') ? cPath : `/${cPath || ''}`
						if (basePath && !cPath.startsWith(basePath)) cPath = `${basePath}${cPath}`
						const cKey = cPath.split('/').filter(Boolean).join('-')
						return {
							key: cKey,
							label: ch.label || cPath.split('/').pop(),
							icon: iconMap[(ch.path || '').split('/').filter(Boolean).pop()] || Folder,
							path: cPath
						}
					})
					groups.push({
						type: 'group',
						key: `grp-${parentKey}`,
						parent: { key: parentKey, label: node.label, icon: ParentIcon, path },
						children
					})
				} else {
					groups.push({ type: 'item', key: parentKey, label: node.label, icon: ParentIcon, path })
				}
			}
			console.debug('[Sidebar] tree groups', groups)
			return groups
		}

		// Fallback: derive synthetic groups from flat mapped paths by depth heuristic
		const byParent = {}
		mapped.forEach(m => {
			// consider depth by segment count; treat depth>2 as child
			const segs = m.path.split('/').filter(Boolean)
			if (segs.length > 2) {
				const parentPath = '/' + segs.slice(0, 2).join('/')
				const parentKey = segs.slice(0, 2).join('-')
				if (!byParent[parentKey]) {
					const parentLabel = segs[1] || segs[0]
					byParent[parentKey] = {
						type: 'group',
						key: `grp-${parentKey}`,
						parent: {
							key: parentKey,
							label: parentLabel,
							icon: iconMap[parentLabel?.toLowerCase()] || Folder,
							path: parentPath
						},
						children: []
					}
				}
				byParent[parentKey].children.push({ ...m, key: m.key, label: m.label, path: m.path })
			} else {
				// depth <=2 => standalone item unless already captured as group parent
				const existingParentKey = segs.join('-')
				if (!byParent[`single-${existingParentKey}`]) {
					byParent[`single-${existingParentKey}`] = { type: 'item', ...m }
				}
			}
		})
		// Convert map to ordered array preserving original order roughly
		const ordered = []
		mapped.forEach(m => {
			const segs = m.path.split('/').filter(Boolean)
			if (segs.length > 2) {
				const parentKey = segs.slice(0, 2).join('-')
				const grp = byParent[parentKey]
				if (grp && !ordered.includes(grp)) ordered.push(grp)
			} else {
				const single = byParent[`single-${segs.join('-')}`]
				if (single && !ordered.includes(single)) ordered.push(single)
			}
		})
		return ordered
	}, [routes, routeTree, items, basePath])

	// Track open dropdown groups
	const [openGroups, setOpenGroups] = useState({})
	useEffect(() => {
		// auto-open group containing active path
		if (!location.pathname) return
		derivedItems.forEach(entry => {
			if (entry.type === 'group') {
				const isActiveChild = entry.children.some(c => location.pathname.startsWith(c.path))
				if (isActiveChild && !openGroups[entry.key]) {
					setOpenGroups(o => ({ ...o, [entry.key]: true }))
				}
			}
		})
	}, [location.pathname, derivedItems, openGroups])

	// Flattened items memo to avoid recomputing
	const flatItems = useMemo(() => {
		const arr = []
		derivedItems.forEach(d => {
			if (d.type === 'group') arr.push(d.parent, ...d.children)
			else arr.push(d)
		})
		return arr
	}, [derivedItems])

	const [active, setActive] = useState(() => {
		const current = flatItems.find(i => location.pathname === i.path || location.pathname.startsWith(i.path + '/'))
		return current ? current.key : flatItems[0]?.key
	})

	useEffect(() => {
		const current = flatItems.find(i => location.pathname === i.path || location.pathname.startsWith(i.path + '/'))
		if (current && current.key !== active) setActive(current.key)
	}, [location.pathname, flatItems, active])

	const handleSelect = (key) => {
		const item = flatItems.find(i => i.key === key)
		if (item) {
			setActive(item.key)
			if (item.path) navigate(item.path)
		}
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
					{derivedItems.map(entry => {
						if (entry.type === 'group') {
							const { key, parent, children } = entry
							const isOpen = !!openGroups[key]
							const isActiveParent = parent.key === active || children.some(c => c.key === active)
							const ParentIcon = parent.icon || Folder
							return (
								<div key={key} className="mb-0.5" data-group={key}>
									<div className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs transition-colors ${isActiveParent ? 'text-orange-700 dark:text-orange-400' : 'text-neutral-600 hover:text-orange-700 dark:text-neutral-400 dark:hover:text-orange-400'}`}>
										<button
											onClick={() => handleSelect(parent.key)}
											className="inline-flex items-center gap-3 flex-1 text-left focus:outline-none"
										>
											<span className={`w-8 h-8 grid place-items-center rounded-md text-current transition-colors ${isActiveParent ? 'bg-orange-500/10 dark:bg-transparent' : 'group-hover:bg-orange-500/5'}`}>
												<ParentIcon size={16} />
											</span>
											<span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 truncate">{parent.label}</span>
										</button>
										<button
											onClick={(e) => { e.stopPropagation(); setOpenGroups(o => ({ ...o, [key]: !o[key] })) }}
											className={`p-1 rounded-md transition-colors ${isActiveParent ? 'text-orange-600 dark:text-orange-400' : 'text-neutral-500 hover:text-orange-600 dark:text-neutral-400 dark:hover:text-orange-400'}`}
											aria-label={isOpen ? 'Collapse section' : 'Expand section'}
										>
											<span className={`transition-transform duration-300 block ${isOpen ? 'rotate-180' : ''}`}><ChevronDown size={14} /></span>
										</button>
									</div>
									<div className="pl-4 pr-1">
										<div className={`overflow-hidden transition-all duration-300 ease-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
											<ul className="py-0.5 flex flex-col gap-0.5">
												{children.map(child => {
													const ChildIcon = child.icon || Folder
													const activeChild = child.key === active
													return (
														<li key={child.key}>
															<button
																onClick={() => handleSelect(child.key)}
																className={`w-full flex items-center gap-2 text-[11px] rounded-md px-2 py-1.5 transition-colors ${activeChild ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400' : 'text-neutral-500 hover:text-orange-600 hover:bg-orange-500/5 dark:text-neutral-400 dark:hover:text-orange-400'}`}
															>
																<span className="w-5 h-5 grid place-items-center"><ChildIcon size={13} /></span>
																<span className="truncate">{child.label}</span>
															</button>
														</li>
													)
												})}
											</ul>
										</div>
									</div>
								</div>
							)
						}
						// simple item
						const { key, label, icon: Icon, path } = entry
						const isActive = key === active
						return (
							<button
								key={key}
								onClick={() => handleSelect(key)}
								title={label}
								className={`w-full flex px-2.5 py-1.5 text-xs transition-colors ${isActive ? 'text-orange-700 dark:text-orange-400' : 'text-neutral-600 hover:text-orange-700 dark:text-neutral-400 dark:hover:text-orange-400'}`}
							>
								<span className={`relative inline-flex items-center gap-3 after:content-[''] after:absolute after:-bottom-0.5 after:left-0 after:h-[2px] after:bg-orange-500 after:rounded-full after:transition-transform after:duration-300 after:origin-left ${isActive ? 'after:scale-x-100' : 'after:scale-x-0 hover:after:scale-x-100'}`} data-path={path}>
									<span className={`w-8 h-8 grid place-items-center rounded-md text-current transition-colors ${isActive ? 'bg-orange-500/10 dark:bg-transparent' : 'group-hover:bg-orange-500/5'}`}>
										<Icon size={16} />
									</span>
									<span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">{label}</span>
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
