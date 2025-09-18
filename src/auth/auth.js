// Simple client-side auth utilities (placeholder - replace with real implementation)
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  IT: 'IT',
  ADMIN: 'ADMIN',
  USER: 'USER'
}

const STORAGE_KEY = 'auth_user'

export function getUser() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') } catch { return null }
}

export function setUser(user) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
}

export function logout() {
  localStorage.removeItem(STORAGE_KEY)
}

let _reduxStore = null
export function attachAuthStore(store) { _reduxStore = store }

export function isAuthenticated() {
  // Prefer redux auth slice access token
  if (_reduxStore) {
    const state = _reduxStore.getState()
    if (state?.auth?.accessToken) return true
  }
  return !!getUser()
}

export function hasRole(rolesAllowed) {
  let role = null
  if (_reduxStore) {
    role = _reduxStore.getState()?.auth?.user?.role || null
  }
  if (!role) {
    const u = getUser()
    role = u?.role
  }
  if (!role) return false
  if (!rolesAllowed || rolesAllowed.length === 0) return true
  return rolesAllowed.includes(role)
}
