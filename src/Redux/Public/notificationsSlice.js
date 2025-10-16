import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { httpGetService, httpPatchService } from '../../config/httphandler'
import { connectSocket, disconnectSocket, getSocket } from './notificationsSocket'

// Notification event union (kept as JSDoc for JS projects)
/**
 * @typedef {Object} NotificationEvent
 * @property {string} type
 * @property {string} [companyId]
 * @property {string} [leaveId]
 * @property {string} [userId]
 * @property {string} [designationParentId]
 * @property {string} [avatar]
 * @property {string} [by]
 * @property {string} [reason]
 * @property {string} [at]
 */

const initialState = {
  connecting: false,
  connected: false,
  lastError: null,
  items: [],
  unread: 0,
}

export const startNotifications = createAsyncThunk(
  'notifications/start',
  async ({ url, token, companyId, userId }, { dispatch }) => {
    const s = connectSocket({ url, token, companyId, userId })

    s.on('connect', () => {
      dispatch(connected())
    })

    s.on('disconnect', () => {
      dispatch(disconnected())
    })

    s.on('connect_error', (err) => {
      dispatch(connectionFailed(err?.message || 'connect_error'))
    })

    s.on('notification', (evt) => {
      dispatch(eventReceived(evt))
    })

    // Also fetch current unread count and feed snapshot from REST if available
    if (companyId && userId) {
      dispatch(fetchUnreadCount({ companyId, userId }))
      dispatch(fetchFeed({ companyId, userId }))
    }
  }
)

export const stopNotifications = createAsyncThunk('notifications/stop', async () => {
  const s = getSocket()
  if (s) s.removeAllListeners('notification')
  disconnectSocket()
})

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    connectingStarted(state) {
      state.connecting = true
      state.connected = false
      state.lastError = null
    },
    connected(state) {
      state.connecting = false
      state.connected = true
      state.lastError = null
    },
    connectionFailed(state, action) {
      state.connecting = false
      state.connected = false
      state.lastError = action.payload
    },
    disconnected(state) {
      state.connecting = false
      state.connected = false
    },
    eventReceived(state, action) {
      const evt = action.payload || {}
      // Avoid duplicates by id if present
      if (evt.id) {
        const idx = state.items.findIndex(i => i.id === evt.id)
        if (idx !== -1) {
          state.items[idx] = { ...state.items[idx], ...evt }
        } else {
          state.items.unshift(evt)
          if (!evt.isRead) state.unread = (state.unread || 0) + 1
        }
      } else {
        state.items.unshift(evt)
        if (!evt.isRead) state.unread = (state.unread || 0) + 1
      }
      if (state.items.length > 200) state.items.pop()
    },
    clearAll(state) {
      state.items = []
      state.lastError = null
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unread = action.payload ?? 0
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        if (Array.isArray(action.payload)) {
          // merge without duplicates by id
          const existing = new Set(state.items.map(i => i.id))
          const fresh = action.payload.filter(i => !existing.has(i.id))
          state.items = [...fresh, ...state.items].slice(0, 200)
        }
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        // use meta.arg to find the notification ID
        const { notificationId } = action.meta?.arg || {}
        if (!notificationId) return
        const idx = state.items.findIndex(i => i.id === notificationId)
        if (idx !== -1 && state.items[idx].isRead !== true) {
          state.items[idx] = { ...state.items[idx], isRead: true, readAt: state.items[idx].readAt || new Date().toISOString() }
          if (state.unread > 0) state.unread -= 1
        }
      })
      .addCase(markAllAsRead.fulfilled, (state, _action) => {
        state.items = state.items.map(it => {
          if (it && it.isRead !== true) {
            return { ...it, isRead: true, readAt: it.readAt || new Date().toISOString() }
          }
          return it
        })
        state.unread = 0
      })
  }
})

export const {
  connectingStarted,
  connected,
  connectionFailed,
  disconnected,
  eventReceived,
  clearAll,
} = notificationsSlice.actions

export default notificationsSlice.reducer

// REST helpers using existing base URL config
export const fetchUnreadCount = createAsyncThunk('notifications/fetchUnread', async ({ companyId, userId }, { getState }) => {
  const role = getState()?.auth?.user?.role
  const isAdmin = role === 'ADMIN'
  const path = isAdmin
    ? `${companyId}/notifications/unread-count`
    : `${companyId}/auth/${userId}/profile/notifications/unread-count`
  const res = await httpGetService(path)
  if (res.status >= 200 && res.status < 300) return res.data?.data?.count ?? 0
  return 0
})

export const fetchFeed = createAsyncThunk('notifications/fetchFeed', async ({ companyId, userId }, { getState }) => {
  const role = getState()?.auth?.user?.role
  const isAdmin = role === 'ADMIN'
  const path = isAdmin
    ? `${companyId}/notifications`
    : `${companyId}/auth/${userId}/profile/notifications/feed`
  const res = await httpGetService(path)
  if (res.status >= 200 && res.status < 300) return res.data?.data?.items ?? []
  return []
})

export const markAsRead = createAsyncThunk('notifications/markAsRead', async ({ companyId, userId, notificationId }, { getState }) => {
  const role = getState()?.auth?.user?.role
  const isAdmin = role === 'ADMIN'
  const path = isAdmin
    ? `${companyId}/notifications/${notificationId}/read`
    : `${companyId}/auth/${userId}/profile/notifications/${notificationId}/read`
  const res = await httpPatchService(path, {})
  return res.status >= 200 && res.status < 300
})

export const markAllAsRead = createAsyncThunk('notifications/markAllAsRead', async ({ companyId, userId }, { getState }) => {
  const role = getState()?.auth?.user?.role
  const isAdmin = role === 'ADMIN'
  const path = isAdmin
    ? `${companyId}/notifications/read-all`
    : `${companyId}/auth/${userId}/profile/notifications/read-all`
  const res = await httpPatchService(path, {})
  return res.status >= 200 && res.status < 300
})
