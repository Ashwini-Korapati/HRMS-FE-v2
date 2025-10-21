import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { httpGetService } from '../../config/httphandler'

// State is keyed by designationId
const initialState = {
  byDesignation: {}
}

// Stable empty to avoid returning a new array reference on each call
const EMPTY_ARRAY = []

// Add a small normalizer so both REST and socket payloads map consistently
function normalizeMonitoringPayload(payload, fallbackDesignationId) {
  const data = payload?.data || payload || {}
  const designationId = data.designationId || data.rootDesignationId || fallbackDesignationId
  const items = Array.isArray(data.items) ? data.items : []
  const tree = data.tree !== undefined ? data.tree : undefined
  const suggestedLayout = data.suggestedLayout !== undefined ? data.suggestedLayout : undefined
  const timestamp = data.timestamp || new Date().toISOString()
  return { designationId, items, tree, suggestedLayout, timestamp }
}

export const fetchDesignationSnapshot = createAsyncThunk(
  'designationMonitoring/fetchSnapshot',
  async ({ companyId, designationId }) => {
    const res = await httpGetService(`${companyId}/attendance/monitoring/designations/${designationId}`)
    if (res.status >= 200 && res.status < 300) {
      const data = res.data?.data || {}
      const items = Array.isArray(data.items) ? data.items : []
      const tree = data.tree || null
      const suggestedLayout = data.suggestedLayout || null
      const timestamp = data.timestamp || res.data?.timestamp || new Date().toISOString()
      return { designationId, items, tree, suggestedLayout, timestamp }
    }
    throw new Error(res.data?.message || 'Failed to load designation monitoring')
  }
)

const slice = createSlice({
  name: 'designationMonitoring',
  initialState,
  reducers: {
    setConnected(state, action) {
      const { designationId, connected } = action.payload
      const node = state.byDesignation[designationId] || { rows: [], connected: false, loading: 'idle', error: null }
      node.connected = !!connected
      state.byDesignation[designationId] = node
    },
    // Upsert supports both full snapshot and incremental update
    upsertItems(state, action) {
      const { designationId, items, tree, suggestedLayout, timestamp } = action.payload
      if (!designationId) return
      const node = state.byDesignation[designationId] || { rows: [], connected: false, loading: 'idle', error: null }
      const map = new Map((node.rows || []).map(r => [r.userId, r]))
      for (const it of (items || [])) {
        if (!it?.userId) continue
        const prev = map.get(it.userId) || {}
        map.set(it.userId, { ...prev, ...it })
      }
      node.rows = Array.from(map.values()).sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')))
      if (tree !== undefined) node.tree = tree
      if (suggestedLayout !== undefined) node.suggestedLayout = suggestedLayout
      if (timestamp !== undefined) node.lastUpdated = timestamp
      state.byDesignation[designationId] = node
    },
    // New: handle socket event directly (snapshot or update)
    ingestMonitoringEvent(state, action) {
      const { event, fallbackDesignationId } = action.payload || {}
      if (!event) return
      const { designationId, items, tree, suggestedLayout, timestamp } = normalizeMonitoringPayload(event, fallbackDesignationId)
      if (!designationId) return
      const node = state.byDesignation[designationId] || { rows: [], connected: false, loading: 'idle', error: null }
      node.connected = true
      const map = new Map((node.rows || []).map(r => [r.userId, r]))
      for (const it of (items || [])) {
        if (!it?.userId) continue
        const prev = map.get(it.userId) || {}
        map.set(it.userId, { ...prev, ...it })
      }
      node.rows = Array.from(map.values()).sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')))
      if (tree !== undefined) node.tree = tree
      if (suggestedLayout !== undefined) node.suggestedLayout = suggestedLayout
      node.lastUpdated = timestamp
      state.byDesignation[designationId] = node
    },
    setLoading(state, action) {
      const { designationId, loading } = action.payload
      const node = state.byDesignation[designationId] || { rows: [], connected: false, loading: 'idle', error: null }
      node.loading = loading
      state.byDesignation[designationId] = node
    },
    setError(state, action) {
      const { designationId, error } = action.payload
      const node = state.byDesignation[designationId] || { rows: [], connected: false, loading: 'idle', error: null }
      node.error = error || null
      state.byDesignation[designationId] = node
    },
    clear(state, action) {
      const { designationId } = action.payload || {}
      if (designationId) delete state.byDesignation[designationId]
      else state.byDesignation = {}
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDesignationSnapshot.pending, (state, action) => {
        const { designationId } = action.meta.arg
        const node = state.byDesignation[designationId] || { rows: [], connected: false, loading: 'idle', error: null }
        node.loading = 'loading'
        node.error = null
        state.byDesignation[designationId] = node
      })
      .addCase(fetchDesignationSnapshot.fulfilled, (state, action) => {
        const { designationId, items, tree, suggestedLayout, timestamp } = action.payload
        const node = state.byDesignation[designationId] || { rows: [], connected: false, loading: 'idle', error: null }
        node.loading = 'succeeded'
        node.error = null
        // upsert items
        const map = new Map((node.rows || []).map(r => [r.userId, r]))
        for (const it of (items || [])) {
          if (!it?.userId) continue
          const prev = map.get(it.userId) || {}
          map.set(it.userId, { ...prev, ...it })
        }
        node.rows = Array.from(map.values()).sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')))
        node.tree = tree
        node.suggestedLayout = suggestedLayout
        node.lastUpdated = timestamp
        state.byDesignation[designationId] = node
      })
      .addCase(fetchDesignationSnapshot.rejected, (state, action) => {
        const { designationId } = action.meta.arg
        const node = state.byDesignation[designationId] || { rows: [], connected: false, loading: 'idle', error: null }
        node.loading = 'failed'
        node.error = action.error?.message || 'Failed to load designation monitoring'
        state.byDesignation[designationId] = node
      })
  }
})

export const { setConnected, upsertItems, ingestMonitoringEvent, setLoading, setError, clear } = slice.actions

export const selectDesignationRows = (state, designationId) => state.designationMonitoring?.byDesignation?.[designationId]?.rows ?? EMPTY_ARRAY
export const selectDesignationConnected = (state, designationId) => !!state.designationMonitoring?.byDesignation?.[designationId]?.connected
export const selectDesignationLoading = (state, designationId) => state.designationMonitoring?.byDesignation?.[designationId]?.loading || 'idle'
export const selectDesignationError = (state, designationId) => state.designationMonitoring?.byDesignation?.[designationId]?.error || null

export default slice.reducer
