import React, { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { isAuthenticated } from './auth'
import { useSelector } from 'react-redux'
import { selectAuthUser, selectBasePath } from '../Redux/Public/authSlice'

export default function ProtectedRoute({ roles }) {
  const user = useSelector(selectAuthUser)
  const basePath = useSelector(selectBasePath)
  const location = useLocation()

  useEffect(() => {
    // Debug logging for route protections
    // eslint-disable-next-line no-console
    console.debug('[ProtectedRoute] check', {
      path: location.pathname,
      requiredRoles: roles,
      userRole: user?.role,
      authenticated: isAuthenticated()
    })
  }, [location.pathname, roles, user])

  // Not authenticated at all
  if (!isAuthenticated()) return <Navigate to="/login" replace />

  // If roles are required but user role not yet available, show a minimal placeholder (avoid false unauthorized)
  if (roles && roles.length > 0 && !user?.role) {
    return (
      <div className="min-h-screen flex items-center justify-center text-neutral-400 text-sm">
        Loading access...
      </div>
    )
  }

  // Role mismatch
  if (roles && roles.length > 0 && user?.role && !roles.includes(user.role)) {
    // eslint-disable-next-line no-console
    console.warn('[ProtectedRoute] role mismatch redirect', { path: location.pathname, userRole: user?.role, required: roles })
    // For platform roles, try to send them to their overview if we know basePath
    if ((user.role === 'SUPER_ADMIN' || user.role === 'IT') && basePath) {
      return <Navigate to={`${basePath}/overview`} replace />
    }
    return <Navigate to="/uas" replace />
  }

  return <Outlet />
}
