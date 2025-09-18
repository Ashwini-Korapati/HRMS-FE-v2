import { createSlice, createAsyncThunk, nanoid } from '@reduxjs/toolkit'
import { httpGetService } from '../../config/httphandler'
import { storage, persistKeys } from '../../store/storage'

const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

export const fetchPlans = createAsyncThunk('plans/fetch', async (_, { getState, rejectWithValue }) => {
  // Check cache
  const cached = storage.session.get(persistKeys.plans) || storage.local.get(persistKeys.plans)
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL_MS) {
    return { cached: true, items: cached.items }
  }
  const res = await httpGetService('subscriptions/plans?isActive=true')
  if (res.status >= 200 && res.status < 300) {
    return { cached: false, items: res.data?.data || res.data }
  }
  return rejectWithValue(res.data)
})

const initialState = {
  items: [],
  status: 'idle', // idle | loading | succeeded | failed
  error: null,
  selectedPlanId: storage.local.get(persistKeys.selectedPlan) || null,
  lastFetch: null,
  cacheSource: null,
  version: nanoid(6)
}

const plansSlice = createSlice({
  name: 'plans',
  initialState,
  reducers: {
    setSelectedPlan(state, action) {
      state.selectedPlanId = action.payload
      storage.local.set(persistKeys.selectedPlan, action.payload)
    },
    clearPlansCache(state) {
      storage.session.remove(persistKeys.plans)
      storage.local.remove(persistKeys.plans)
      state.lastFetch = null
      state.cacheSource = null
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchPlans.pending, (state) => {
        if (state.status !== 'loading') state.status = 'loading'
        state.error = null
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        const { items, cached } = action.payload
        state.items = Array.isArray(items) ? items : []
        state.status = 'succeeded'
        state.lastFetch = Date.now()
        state.cacheSource = cached ? 'cache' : 'network'
        if (!cached) {
          const payload = { timestamp: Date.now(), items: state.items }
          storage.session.set(persistKeys.plans, payload)
        }
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload?.message || 'Failed to load plans'
      })
  }
})

export const { setSelectedPlan, clearPlansCache } = plansSlice.actions

// Selectors
export const selectPlansState = (s) => s.plans
export const selectPlans = (s) => s.plans.items
export const selectPlanStatus = (s) => s.plans.status
export const selectSelectedPlan = (s) => s.plans.items.find(p => p.id === s.plans.selectedPlanId) || null
export const selectIsCached = (s) => s.plans.cacheSource === 'cache'

export default plansSlice.reducer
