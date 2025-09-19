import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectAuthRoutes, selectBasePath, selectAuthCompany } from '../../Redux/Public/authSlice'

// Fallback simple splitter when no enriched breadcrumbs
function deriveFallbackCrumbs(pathname, basePath) {
  const base = basePath && pathname.startsWith(basePath) ? pathname.slice(basePath.length) : pathname
  const segments = base.split('/').filter(Boolean)
  const crumbs = []
  let agg = basePath || ''
  segments.forEach(seg => {
    agg += `/${seg}`
    crumbs.push({ label: seg.charAt(0).toUpperCase() + seg.slice(1), path: agg })
  })
  return crumbs
}

export default function BreadcrumbBar({ className = '' }) {
  const location = useLocation()
  const routes = useSelector(selectAuthRoutes)
  const basePath = useSelector(selectBasePath)
  const company = useSelector(selectAuthCompany)
  const pathname = location.pathname.replace(/\/$/, '')

  // Find best matching route with longest path prefix that has breadcrumbs
  let matched = null
  let maxLen = -1
  for (const r of routes) {
    if (!r.path) continue
    const p = r.path.replace(/\/$/, '')
    if (pathname === p || pathname.startsWith(p + '/')) {
      if (p.length > maxLen) {
        matched = r
        maxLen = p.length
      }
    }
  }

  let crumbs = []
  if (matched?.breadcrumbs?.length) {
    crumbs = matched.breadcrumbs
  } else {
    crumbs = deriveFallbackCrumbs(pathname, basePath)
  }

  // Ensure first crumb is company/home when applicable
  if (company?.id && basePath) {
    const hasFirst = crumbs[0]?.path === `${basePath}/overview` || crumbs[0]?.path === basePath
    if (!hasFirst) {
      crumbs.unshift({ label: company.name || 'Company', path: `${basePath}/overview` })
    }
  }

  return (
    <div className={`flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400 mb-4 ${className}`}>
      {crumbs.map((c, idx) => {
        const isLast = idx === crumbs.length - 1
        return (
          <React.Fragment key={c.path + idx}>
            {!isLast ? (
              <Link to={c.path} className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">{c.label}</Link>
            ) : (
              <span className="text-neutral-700 dark:text-neutral-200 font-medium">{c.label}</span>
            )}
            {!isLast && <span className="opacity-40">/</span>}
          </React.Fragment>
        )
      })}
    </div>
  )
}
