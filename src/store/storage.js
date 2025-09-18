// Unified storage helpers (localStorage, sessionStorage, cookies)
// Fallback safe operations to avoid SSR / unavailable storage errors

function safe(fn, fallback) {
  try { return fn() } catch { return fallback }
}

export const storage = {
  local: {
    get: (k) => safe(() => JSON.parse(localStorage.getItem(k)), null),
    set: (k,v) => safe(() => localStorage.setItem(k, JSON.stringify(v))),
    remove: (k) => safe(() => localStorage.removeItem(k)),
  },
  session: {
    get: (k) => safe(() => JSON.parse(sessionStorage.getItem(k)), null),
    set: (k,v) => safe(() => sessionStorage.setItem(k, JSON.stringify(v))),
    remove: (k) => safe(() => sessionStorage.removeItem(k)),
  },
  cookie: {
    get: (name) => {
      return safe(() => document.cookie.split('; ').find(r => r.startsWith(name + '='))?.split('=')[1] || null, null)
    },
    set: (name, value, days=7) => {
      safe(() => {
        const expires = new Date(Date.now() + days*864e5).toUTCString()
        document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`
      })
    },
    remove: (name) => {
      safe(() => { document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/` })
    }
  }
}

export const persistKeys = {
  plans: 'hr_plans_cache',
  selectedPlan: 'hr_selected_plan',
  auth: 'hr_auth_state', // full auth serialized state (tokens + meta)
  accessToken: 'hr_access_token',
  refreshToken: 'hr_refresh_token',
  idToken: 'hr_id_token',
  authUser: 'hr_auth_user',
  authCompany: 'hr_auth_company',
  authRoutes: 'hr_auth_routes',
  tokenExpiry: 'hr_access_expiry'
}
