import { createSlice, createAsyncThunk, nanoid } from '@reduxjs/toolkit'
import { httpPostService } from '../../config/httphandler'
import { storage, persistKeys } from '../../store/storage'



const REFRESH_SKEW_MS = 30 * 1000 // refresh 30s before expiry

function persistAuth(state) {
  const {
    accessToken, refreshToken, idToken, user, company, routes, accessTokenExpiresAt
  } = state
  storage.session.set(persistKeys.accessToken, accessToken)
  storage.session.set(persistKeys.refreshToken, refreshToken)
  storage.session.set(persistKeys.idToken, idToken)
  storage.session.set(persistKeys.authUser, user)
  storage.session.set(persistKeys.authCompany, company)
  storage.session.set(persistKeys.authRoutes, routes)
  storage.session.set(persistKeys.tokenExpiry, accessTokenExpiresAt)
  // also local for longer persistence (optional, can tweak remember_me logic)
  storage.local.set(persistKeys.accessToken, accessToken)
  storage.local.set(persistKeys.refreshToken, refreshToken)
  storage.local.set(persistKeys.idToken, idToken)
  storage.local.set(persistKeys.authUser, user)
  storage.local.set(persistKeys.authCompany, company)
  storage.local.set(persistKeys.authRoutes, routes)
  storage.local.set(persistKeys.tokenExpiry, accessTokenExpiresAt)

  storage.cookie.set('hr_access_token', accessToken, 1)
  storage.cookie.set('hr_refresh_token', refreshToken, 7)
  storage.cookie.set('hr_id_token', idToken, 1)
}

function clearPersistedAuth() {
  [persistKeys.accessToken, persistKeys.refreshToken, persistKeys.idToken, persistKeys.authUser, persistKeys.authCompany, persistKeys.authRoutes, persistKeys.tokenExpiry].forEach(k => {
    storage.session.remove(k)
    storage.local.remove(k)
  })
  storage.cookie.remove('hr_access_token')
  storage.cookie.remove('hr_refresh_token')
  storage.cookie.remove('hr_id_token')
}

function loadPersisted() {
  const accessToken = storage.session.get(persistKeys.accessToken) || storage.local.get(persistKeys.accessToken)
  if (!accessToken) return null
  return {
    accessToken,
    refreshToken: storage.session.get(persistKeys.refreshToken) || storage.local.get(persistKeys.refreshToken),
    idToken: storage.session.get(persistKeys.idToken) || storage.local.get(persistKeys.idToken),
    user: storage.session.get(persistKeys.authUser) || storage.local.get(persistKeys.authUser),
    company: storage.session.get(persistKeys.authCompany) || storage.local.get(persistKeys.authCompany),
    routes: storage.session.get(persistKeys.authRoutes) || storage.local.get(persistKeys.authRoutes) || [],
    accessTokenExpiresAt: storage.session.get(persistKeys.tokenExpiry) || storage.local.get(persistKeys.tokenExpiry)
  }
}

export const loginWithPassword = createAsyncThunk('auth/loginWithPassword', async (payload, { rejectWithValue }) => {
  // payload: { login_challenge, email, password, remember_me }
  const res = await httpPostService('uas/auth/login', payload)
  if (res.status >= 200 && res.status < 300 && res.data?.success) {
    return res.data.data // includes authorizationCode, redirectUrl, user, company
  }
  return rejectWithValue(res.data)
})

// Platform login (SUPER_ADMIN / IT)
// payload: { email, password, rememberMe }
export const platformLogin = createAsyncThunk('auth/platformLogin', async (payload, { rejectWithValue }) => {
  try {
    // serverURL already includes /api so we call relative path without leading api/
    const res = await httpPostService('auth/platform/login', payload)
    if (res.status >= 200 && res.status < 300 && res.data?.success) {
      const data = res.data.data || {}
      // Normalize shape to match exchangeToken expectations where practical
      return {
        access_token: data.accessToken,
        refresh_token: data.refreshToken,
        id_token: null,
        expires_in: parseExpires(data.expiresIn),
        user: data.user,
        company: data.company, // may be null for platform roles
        // Convert backend 'routes' which provide full absolute urls into relative path pattern for sidebar
        routes: (data.routes || []).map(r => {
          // try to derive path part after host
            try {
              const url = new URL(r.url)
              return { ...r, path: url.pathname.replace(/\/$/, '') }
            } catch {
              return { ...r, path: r.url }
            }
        })
      }
    }
    return rejectWithValue(res.data)
  } catch (e) {
    return rejectWithValue({ message: e.message })
  }
})

function parseExpires(expiresIn) {
  if (!expiresIn) return 3600
  if (typeof expiresIn === 'number') return expiresIn
  // handle strings like '30d', '12h', '15m'
  const m = /^([0-9]+)([smhd])$/.exec(expiresIn)
  if (!m) return 3600
  const val = parseInt(m[1], 10)
  const unit = m[2]
  switch (unit) {
    case 's': return val
    case 'm': return val * 60
    case 'h': return val * 3600
    case 'd': return val * 86400
    default: return 3600
  }
}

export const exchangeToken = createAsyncThunk('auth/exchangeToken', async ({ code }, { rejectWithValue }) => {
  const res = await httpPostService('uas/auth/token', { code, grant_type: 'authorization_code' })
  if (res.status >= 200 && res.status < 300 && res.data?.success) {
    return res.data.data
  }
  return rejectWithValue(res.data)
})

export const refreshAccessToken = createAsyncThunk('auth/refresh', async (_, { getState, rejectWithValue }) => {
  const { auth } = getState()
  const refreshToken = auth.refreshToken
  if (!refreshToken) return rejectWithValue({ message: 'No refresh token' })
  // Usually refresh endpoint differs, but following given API pattern assume same token endpoint supports refresh_token grant
  const res = await httpPostService('uas/auth/token', { refresh_token: refreshToken, grant_type: 'refresh_token' })
  if (res.status >= 200 && res.status < 300 && res.data?.success) {
    return res.data.data
  }
  return rejectWithValue(res.data)
})

let refreshTimer = null
function scheduleRefresh(dispatch, expiresAt) {
  if (!expiresAt) return
  const delay = Math.max(expiresAt - Date.now() - REFRESH_SKEW_MS, 5_000)
  if (refreshTimer) clearTimeout(refreshTimer)
  refreshTimer = setTimeout(() => {
    dispatch(refreshAccessToken())
  }, delay)
}

const persisted = loadPersisted()

const initialState = {
  status: 'idle', // overall login status
  error: null,
  step: 'init', // init | logging-in | exchanging | authenticated
  authorizationCode: null,
  redirectUrl: null,
  accessToken: persisted?.accessToken || null,
  refreshToken: persisted?.refreshToken || null,
  idToken: persisted?.idToken || null,
  accessTokenExpiresAt: persisted?.accessTokenExpiresAt || null,
  user: persisted?.user || null,
  company: persisted?.company || null,
  routes: persisted?.routes || [],
  version: nanoid(6),
  derivedBasePath: ''
}

// Helper to compute dynamic base path based on role + routes
function computeBasePath(user, company, routes) {
  if (!user) return ''
  const role = user.role
  if (role === 'ADMIN') {
    return company?.id ? `/${company.id}` : ''
  }
  if (role === 'USER') {
    return company?.id ? `/${company.id}/auth/${user.id}` : ''
  }
  if (role === 'SUPER_ADMIN' || role === 'IT') {
    // If company has subdomain use it
    if (company?.subdomain) return `/${company.subdomain}`
    // Derive from first matching route: pattern /:platform/supeadmin/:userId/... or /:platform/overview
    if (routes && routes.length) {
      for (const r of routes) {
        const source = r.url || r.path
        if (!source) continue
        try {
          const pathname = new URL(source, window.location.origin).pathname
          const segs = pathname.split('/').filter(Boolean)
          if (!segs.length) continue
          // If we find 'supeadmin' include userId segment to avoid collision with ADMIN companyUuid route
          const suIdx = segs.findIndex(s => s.toLowerCase() === 'supeadmin')
          const itIdx = segs.findIndex(s => s.toLowerCase() === 'it')
          const adminLikeIdx = suIdx !== -1 ? suIdx : itIdx
          if (adminLikeIdx !== -1) {
            if (segs.length > adminLikeIdx + 1) {
              return `/${segs.slice(0, adminLikeIdx + 2).join('/')}` // /platformSlug/(supeadmin|it)/userId
            }
            return `/${segs.slice(0, adminLikeIdx + 1).join('/')}`
          }
          // Otherwise if last segment is an entity page (overview, companies, etc.) drop it to get base
          const terminalPages = ['overview', 'companies', 'subscriptions', 'system-admin', 'systemadmin', 'dashboard']
          if (terminalPages.includes(segs[segs.length - 1].toLowerCase()) && segs.length > 1) {
            return `/${segs.slice(0, -1).join('/')}`
          }
          // Fallback to first segment only
          return `/${segs[0]}`
        } catch {
          // fallback: treat source as already a path
          const segs = source.split('/').filter(Boolean)
          if (!segs.length) continue
          const suIdx = segs.findIndex(s => s.toLowerCase() === 'supeadmin')
          const itIdx = segs.findIndex(s => s.toLowerCase() === 'it')
          const adminLikeIdx = suIdx !== -1 ? suIdx : itIdx
          if (adminLikeIdx !== -1) {
            if (segs.length > adminLikeIdx + 1) return `/${segs.slice(0, adminLikeIdx + 2).join('/')}`
            return `/${segs.slice(0, adminLikeIdx + 1).join('/')}`
          }
            if (segs.length > 1) return `/${segs.slice(0, -1).join('/')}`
          return `/${segs[0]}`
        }
      }
    }
    return '/platform'
  }
  return company?.id ? `/${company.id}` : ''
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      clearPersistedAuth()
      Object.assign(state, {
        status: 'idle',
        error: null,
        step: 'init',
        authorizationCode: null,
        redirectUrl: null,
        accessToken: null,
        refreshToken: null,
        idToken: null,
        accessTokenExpiresAt: null,
        user: null,
        company: null,
        routes: []
      })
      if (refreshTimer) clearTimeout(refreshTimer)
    }
  },
  extraReducers: builder => {
    builder
      .addCase(loginWithPassword.pending, (state) => {
        state.status = 'loading'
        state.step = 'logging-in'
        state.error = null
      })
      .addCase(loginWithPassword.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.step = 'code-obtained'
        state.authorizationCode = action.payload.authorizationCode
        state.redirectUrl = action.payload.redirectUrl
        // keep preliminary user/company if desired
        state.user = action.payload.user || state.user
        state.company = action.payload.company || state.company
        // eslint-disable-next-line no-console
        console.debug('[auth] loginWithPassword.fulfilled', {
          authorizationCode: state.authorizationCode,
          redirectUrl: state.redirectUrl,
          user: state.user?.role,
          company: state.company?.id
        })
      })
      .addCase(loginWithPassword.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload?.message || 'Login failed'
      })
      .addCase(exchangeToken.pending, (state) => {
        state.status = 'loading'
        state.step = 'exchanging'
        state.error = null
      })
      .addCase(exchangeToken.fulfilled, (state, action) => {
        state.status = 'authenticated'
        state.step = 'authenticated'
        state.accessToken = action.payload.access_token
        state.refreshToken = action.payload.refresh_token
        state.idToken = action.payload.id_token
        state.user = action.payload.user || state.user
        state.company = action.payload.company || state.company
        state.routes = action.payload.routes || []
        state.accessTokenExpiresAt = Date.now() + (action.payload.expires_in * 1000)
        state.derivedBasePath = computeBasePath(state.user, state.company, state.routes)
        persistAuth(state)
        // eslint-disable-next-line no-console
        console.debug('[auth] exchangeToken.fulfilled', {
          basePath: state.derivedBasePath,
          userRole: state.user?.role,
          companyId: state.company?.id,
          routes: state.routes?.map(r => r.path)
        })
      })
      .addCase(exchangeToken.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload?.message || 'Token exchange failed'
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.access_token
        state.refreshToken = action.payload.refresh_token || state.refreshToken
        state.idToken = action.payload.id_token || state.idToken
        state.routes = action.payload.routes || state.routes
        state.accessTokenExpiresAt = Date.now() + (action.payload.expires_in * 1000)
        persistAuth(state)
      })
      .addCase(refreshAccessToken.rejected, (state, action) => {
        // on refresh failure, force logout
        state.error = action.payload?.message || 'Session expired'
        clearPersistedAuth()
        state.accessToken = null
        state.refreshToken = null
        state.idToken = null
        state.accessTokenExpiresAt = null
        state.step = 'init'
        state.status = 'idle'
      })
      // PLATFORM LOGIN
      .addCase(platformLogin.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(platformLogin.fulfilled, (state, action) => {
        state.status = 'authenticated'
        state.step = 'authenticated'
        state.accessToken = action.payload.access_token
        state.refreshToken = action.payload.refresh_token
        state.idToken = action.payload.id_token
        state.user = action.payload.user
        state.company = action.payload.company // may remain null
        state.routes = action.payload.routes || []
        state.accessTokenExpiresAt = Date.now() + (action.payload.expires_in * 1000)
        state.derivedBasePath = computeBasePath(state.user, state.company, state.routes)
        persistAuth(state)
      })
      .addCase(platformLogin.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload?.message || 'Platform login failed'
      })
  }
})

export const { logout } = authSlice.actions

// Selectors
export const selectAuthState = s => s.auth
export const selectIsAuthenticated = s => !!s.auth.accessToken
export const selectAuthUser = s => s.auth.user
export const selectAuthRoutes = s => s.auth.routes || []
export const selectAccessToken = s => s.auth.accessToken
export const selectBasePath = s => s.auth.derivedBasePath || computeBasePath(s.auth.user, s.auth.company, s.auth.routes)

export default authSlice.reducer

// Side-effect: schedule refresh if tokens already exist on load
export const initAuthScheduling = (dispatch, getState) => {
  const { auth } = getState()
  if (auth.accessToken && auth.accessTokenExpiresAt) {
    scheduleRefresh(dispatch, auth.accessTokenExpiresAt)
  }
}

// Listen for store changes (this would typically be setup in store.js)
export function authSubscribe(store) {
  let prevExpiry = null
  store.subscribe(() => {
    const state = store.getState().auth
    if (state.accessTokenExpiresAt && state.accessTokenExpiresAt !== prevExpiry) {
      prevExpiry = state.accessTokenExpiresAt
      scheduleRefresh(store.dispatch, state.accessTokenExpiresAt)
    }
  })
}
