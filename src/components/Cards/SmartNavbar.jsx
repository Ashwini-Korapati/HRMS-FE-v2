import React, { useEffect, useMemo, useRef, useState } from "react"
import { Search as SearchIcon, Bell, UserCircle2, CheckCheck } from "lucide-react"
import { ThemeSwitcher } from "../Buttons/SwitchButtons"
import { useTheme } from '../../theme/ThemeProvider'
import { useSelector, useDispatch } from 'react-redux'
import { selectAuthUser, logout } from '../../Redux/Public/authSlice'
import { Link, useNavigate } from 'react-router-dom'
import { startNotifications, stopNotifications, markAsRead, markAllAsRead } from '../../Redux/Public/notificationsSlice'
import { toAssetUrl } from '../../config/config'

export default function SmartNavbar({
  logo = "HR Office",
  initialNotifications = 2,
  onSearch,
  userName: userNameProp,
  themeMode,
  onThemeChange,
  className = "",
}) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)
  const hoverTimerRef = useRef(null)
  const navigate = useNavigate?.() || ((path) => { window.location.hash = `#${path}` })

  const dispatch = useDispatch()
  const authUser = useSelector(selectAuthUser)
  const authState = useSelector(state => state.auth)

  const userName = authUser?.name || authUser?.email || userNameProp || 'User'
  const avatarPath = authUser?.avatarUrl || authUser?.avatar || authUser?.photoUrl || authUser?.photo || ''
  const avatarUrl = useMemo(() => toAssetUrl(avatarPath), [avatarPath])

  // Theme from context if not provided
  const themeCtx = useTheme?.() || { mode: 'device', setMode: () => {} }
  const effectiveThemeMode = themeMode || themeCtx.mode || 'device'
  const handleThemeChange = onThemeChange || themeCtx.setMode

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch?.(query)
  }

  // Derive company/user/designation IDs for scoping + routing
  const companyId = authState?.company?.id
  const userId = authState?.user?.id
  const designationId = authState?.user?.designationId || authState?.user?.designation?.id || authState?.designation?.id || null

  // Start live notifications (designation scoped) when we have auth context
  useEffect(() => {
    if (!companyId || !userId) return
    dispatch(startNotifications({ companyId, userId, designationId }))
    return () => { dispatch(stopNotifications()) }
  }, [dispatch, companyId, userId, designationId])

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return
    const onDocClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  // Raw notifications from store
  const notifications = useSelector(state => state.notifications?.items || [])
  const unreadCount = useSelector(state => state.notifications?.unread || 0)

  // Filter by my designation and dedupe
  const items = useMemo(() => {
    const myCompany = companyId
    const myDesig = designationId

    // Keep relevant events:
    // - global/company-wide (no companyId set or matches mine)
    // - designation-targeted: metadata.designationId or metadata.designationParentId matches my designation
    const relevant = notifications.filter(n => {
      const nCompany = n.companyId || n.metadata?.companyId
      const dId = n.metadata?.designationId || n.designationId
      const pId = n.metadata?.designationParentId || n.parentDesignationId
      const channels = Array.isArray(n.channels) ? n.channels : []
      const isCompanyOk = !nCompany || !myCompany || nCompany === myCompany
      const isDesigOk =
        !myDesig ||
        dId === myDesig ||
        pId === myDesig ||
        channels.includes(`designation:${myDesig}`)
      return isCompanyOk && isDesigOk
    })

    // Deduplicate:
    // Prefer eventId/id; fallback to stable composite (type+designationId+userId+minute bucket)
    const seen = new Set()
    const deduped = []
    for (const n of relevant) {
      const when = new Date(n.at || n.createdAt || n.timestamp || n.time || Date.now())
      const minuteKey = isNaN(when.getTime()) ? '' : when.toISOString().slice(0, 16) // yyyy-MM-ddTHH:mm
      const key =
        n.eventId ||
        n.id ||
        `${n.type || 'evt'}:${n.metadata?.designationId || n.designationId || '-'}:${n.userId || n.metadata?.userId || '-'}:${minuteKey}`
      if (seen.has(key)) continue
      seen.add(key)

      // Normalize item for UI
      const base = {
        id: n.id || n.eventId || key,
        type: n.type || 'INFO',
        isRead: !!n.isRead,
        createdAt: n.at || n.createdAt || n.timestamp || n.time || new Date().toISOString(),
        metadata: n.metadata || {
          userId: n.userId,
          leaveId: n.leaveId,
          companyId: n.companyId,
          projectId: n.projectId,
          role: n.role,
          shiftId: n.shiftId,
          attendanceType: n.attendanceType,
          designationId: n.designationId,
        },
      }

      const t = String(n.type || '').toLowerCase()
      if (t === 'project.member_added') {
        const displayUser = n.userName || n.name || n.by || (n.userId ? `User ${n.userId}` : 'A user')
        const projectLabel = n.projectName || (n.projectId ? `#${n.projectId}` : 'the project')
        const roleText = n.role ? ` as ${n.role}` : ''
        const attnText = n.attendanceType ? `, attendance: ${n.attendanceType}` : ''
        const shiftText = n.shiftName ? `, shift: ${n.shiftName}` : (n.shiftId ? `, shift: ${n.shiftId}` : '')
        deduped.push({
          ...base,
          title: 'Project member added',
          message: `${displayUser} added to project ${projectLabel}${roleText}${attnText}${shiftText}`,
        })
        continue
      }

      // Default formatting
      deduped.push({
        ...base,
        title: n.title || n.type || 'Notification',
        message: n.message || n.reason || n.description || '',
      })
    }

    // Sort newest first
    deduped.sort((a, b) => {
      const ta = new Date(a.createdAt).getTime() || 0
      const tb = new Date(b.createdAt).getTime() || 0
      return tb - ta
    })
    return deduped
  }, [notifications, companyId, designationId])

  const handleItemClick = (n) => {
    const kind = (n.type || n.title || '').toString().toLowerCase()
    // Leave-related navigation
    if (kind.includes('leave')) {
      setOpen(false)
      const role = authState?.user?.role
      const cId = authState?.company?.id
      const uId = authState?.user?.id
      if (cId) {
        if (role === 'ADMIN') navigate(`/${cId}/leaves`)
        else navigate(`/${cId}/auth/${uId}/leaves`)
      } else {
        navigate('/leaves')
      }
      return
    }
    if (kind === 'project.member_added') {
      setOpen(false)
      const cId = authState?.company?.id
      const projectId = n.metadata?.projectId || n.projectId
      if (cId && projectId) navigate(`/${cId}/projects/${projectId}`)
      else if (cId) navigate(`/${cId}/projects`)
      else navigate('/projects')
      return
    }
  }

  return (
    <header
      className={`w-full fixed top-0 left-0 right-0 z-[60] border-b border-orange-500/30 dark:border-orange-500/80 bg-white/70 dark:bg-transparent backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-neutral-900/40 transition-colors ${className}`}
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
          <div
            className="relative"
            ref={dropdownRef}
            onMouseEnter={() => {
              if (hoverTimerRef.current) { clearTimeout(hoverTimerRef.current); hoverTimerRef.current = null }
              setOpen(true)
            }}
            onMouseLeave={() => {
              if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
              hoverTimerRef.current = setTimeout(() => setOpen(false), 120)
            }}
          >
            <button
              className="relative w-8 h-8 rounded-md bg-white/60 dark:bg-transparent border border-orange-500/30 dark:border-orange-500/40 hover:border-orange-500/70 grid place-items-center text-orange-600 dark:text-orange-400 hover:bg-orange-500/10 transition-colors"
              aria-label="Notifications"
            >
              <Bell size={15} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-neutral-900 text-white text-[9px] leading-[16px] grid place-items-center border border-orange-600/60">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            {/* Smart dropdown */}
            <div
              className={`absolute right-0 mt-1 w-96 max-w-[92vw] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-xl ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} transition-opacity z-[80]`}
              style={{ willChange: 'opacity' }}
            >
              <div className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-200 flex items-center justify-between sticky top-0 bg-inherit z-10">
                <span>Notifications</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-normal text-neutral-500">{unreadCount} new</span>
                  <button
                    disabled={!unreadCount}
                    onClick={() => dispatch(markAllAsRead({ companyId, userId }))}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Mark all as read"
                  >
                    <CheckCheck size={12} /> Mark all
                  </button>
                </div>
              </div>
              <ul className="max-h-80 overflow-auto divide-y divide-neutral-100 dark:divide-neutral-800">
                {items.slice(0, 15).map((n) => (
                  <li
                    key={n.id}
                    className={`px-3 py-2 text-xs ${n.isRead ? 'text-neutral-600 dark:text-neutral-300' : 'text-neutral-800 dark:text-white'} hover:bg-neutral-50 dark:hover:bg-neutral-800/60 flex items-start gap-2 cursor-pointer`}
                    onClick={() => handleItemClick(n)}
                  >
                    <div className={`mt-0.5 w-2 h-2 rounded-full ${n.isRead ? 'bg-neutral-400' : 'bg-orange-500'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{n.title}</div>
                      {n.message && <div className="mt-0.5 text-[11px] text-neutral-600 dark:text-neutral-300 line-clamp-2">{n.message}</div>}
                      {n.createdAt && <div className="text-[10px] text-neutral-500 mt-0.5">{new Date(n.createdAt).toLocaleString()}</div>}
                    </div>
                    {!n.isRead && n.id && (
                      <button
                        onClick={(e) => { e.stopPropagation(); dispatch(markAsRead({ companyId, userId, notificationId: n.id })) }}
                        className="ml-2 shrink-0 px-2 py-1 rounded-md text-[10px] border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        Mark
                      </button>
                    )}
                  </li>
                ))}
                {items.length === 0 && (
                  <li className="px-3 py-6 text-center text-xs text-neutral-500">No notifications yet</li>
                )}
              </ul>
            </div>
          </div>

          {/* Theme switcher */}
          <ThemeSwitcher key={effectiveThemeMode} defaultValue={effectiveThemeMode} onChange={handleThemeChange} className="hidden md:inline-flex" />

          {/* Profile */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-lg bg-neutral-200/80 dark:bg-neutral-800/70 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-300/70 dark:hover:bg-neutral-700 transition-colors text-sm">
              {avatarUrl ? (
                <img src={avatarUrl} alt={userName} className="w-5 h-5 rounded-full object-cover border border-neutral-300" />
              ) : (
                <UserCircle2 size={16} className="text-cyan-400" />
              )}
              <span className="hidden sm:inline leading-none">{userName}</span>
            </button>
            <div className="absolute right-0 mt-1 w-44 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-20">
              <Link to={`/${authState?.company?.id}/profile`} className="block px-3 py-1.5 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700/60 transition-colors">My Profile</Link>
              <button onClick={() => dispatch(logout())} className="w-full text-left px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700/60 transition-colors">Logout</button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}


