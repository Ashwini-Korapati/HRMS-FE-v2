import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  apiOnline: true,
  lastPingAt: null,
  latencyMs: null,
  error: null,
}

const connectionSlice = createSlice({
  name: 'connection',
  initialState,
  reducers: {
    setOnlineStatus(state, action) {
      const { online, latencyMs = null } = action.payload || {}
      state.apiOnline = !!online
      state.latencyMs = latencyMs
      state.lastPingAt = Date.now()
      if (online) state.error = null
    },
    setConnectionError(state, action) {
      state.error = action.payload || 'Connection error'
      state.apiOnline = false
      state.lastPingAt = Date.now()
    }
  }
})

export const { setOnlineStatus, setConnectionError } = connectionSlice.actions
export const selectApiOnline = (s) => s.connection?.apiOnline ?? true
export const selectLatencyMs = (s) => s.connection?.latencyMs
export const selectLastPingAt = (s) => s.connection?.lastPingAt
export const selectConnectionError = (s) => s.connection?.error

export default connectionSlice.reducer
