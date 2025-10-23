import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { httpGetService, httpPatchService } from '../../config/httphandler'

const initialState = {
  // Pending approvals (backward-compatible fields)
  items: [],
  loading: 'idle',
  error: null,
  // History buckets
  itemsApproved: [],
  itemsRejected: [],
  loadingApproved: 'idle',
  loadingRejected: 'idle',
  errorApproved: null,
  errorRejected: null,
  // Action in-flight maps
  approving: {},
  rejecting: {},
}

export const fetchPendingApprovals = createAsyncThunk(
  'leaveApprovals/fetchPending',
  async ({ companyId, userId, designationId }, { getState }) => {
    const role = getState()?.auth?.user?.role
    const isAdmin = role === 'ADMIN'
    // Admin: use new format without auth prefix
    // User: preserve existing auth path
    const base = isAdmin
      ? `${companyId}/leaves/approvals/designation/${designationId}`
      : `${companyId}/auth/${userId}/leaves/approvals/designation/${designationId}`
    const res = await httpGetService(`${base}/pending`)
    if (res.status >= 200 && res.status < 300) return res.data?.data || []
    return []
  }
)

export const fetchApprovedApprovals = createAsyncThunk(
  'leaveApprovals/fetchApproved',
  async ({ companyId, userId, designationId }, { getState }) => {
    const role = getState()?.auth?.user?.role
    const isAdmin = role === 'ADMIN'
    const base = isAdmin
      ? `${companyId}/leaves/approvals/designation/${designationId}`
      : `${companyId}/auth/${userId}/leaves/approvals/designation/${designationId}`
    const res = await httpGetService(`${base}/approved`)
    if (res.status >= 200 && res.status < 300) return res.data?.data || []
    return []
  }
)

export const fetchRejectedApprovals = createAsyncThunk(
  'leaveApprovals/fetchRejected',
  async ({ companyId, userId, designationId }, { getState }) => {
    const role = getState()?.auth?.user?.role
    const isAdmin = role === 'ADMIN'
    const base = isAdmin
      ? `${companyId}/leaves/approvals/designation/${designationId}`
      : `${companyId}/auth/${userId}/leaves/approvals/designation/${designationId}`
    const res = await httpGetService(`${base}/rejected`)
    if (res.status >= 200 && res.status < 300) return res.data?.data || []
    return []
  }
)

export const approveLeave = createAsyncThunk(
  'leaveApprovals/approve',
  async ({ companyId, userId, designationId, leaveId }, { getState }) => {
    const role = getState()?.auth?.user?.role
    const isAdmin = role === 'ADMIN'
    const base = isAdmin
      ? `${companyId}/leaves/approvals/designation/${designationId}`
      : `${companyId}/auth/${userId}/leaves/approvals/designation/${designationId}`
    const res = await httpPatchService(`${base}/${leaveId}/approve`, {})
    return { ok: res.status >= 200 && res.status < 300, leaveId }
  }
)

export const rejectLeave = createAsyncThunk(
  'leaveApprovals/reject',
  async ({ companyId, userId, designationId, leaveId }, { getState }) => {
    const role = getState()?.auth?.user?.role
    const isAdmin = role === 'ADMIN'
    const base = isAdmin
      ? `${companyId}/leaves/approvals/designation/${designationId}`
      : `${companyId}/auth/${userId}/leaves/approvals/designation/${designationId}`
    const res = await httpPatchService(`${base}/${leaveId}/reject`, {})
    return { ok: res.status >= 200 && res.status < 300, leaveId }
  }
)

const leaveApprovalsSlice = createSlice({
  name: 'leaveApprovals',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPendingApprovals.pending, (state) => {
        state.loading = 'loading'
        state.error = null
      })
      .addCase(fetchPendingApprovals.fulfilled, (state, action) => {
        state.loading = 'succeeded'
        state.items = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(fetchPendingApprovals.rejected, (state, action) => {
        state.loading = 'failed'
        state.error = action.error?.message || 'Failed to load pending approvals'
      })
      // Approved history
      .addCase(fetchApprovedApprovals.pending, (state) => {
        state.loadingApproved = 'loading'
        state.errorApproved = null
      })
      .addCase(fetchApprovedApprovals.fulfilled, (state, action) => {
        state.loadingApproved = 'succeeded'
        state.itemsApproved = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(fetchApprovedApprovals.rejected, (state, action) => {
        state.loadingApproved = 'failed'
        state.errorApproved = action.error?.message || 'Failed to load approved approvals'
      })
      // Rejected history
      .addCase(fetchRejectedApprovals.pending, (state) => {
        state.loadingRejected = 'loading'
        state.errorRejected = null
      })
      .addCase(fetchRejectedApprovals.fulfilled, (state, action) => {
        state.loadingRejected = 'succeeded'
        state.itemsRejected = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(fetchRejectedApprovals.rejected, (state, action) => {
        state.loadingRejected = 'failed'
        state.errorRejected = action.error?.message || 'Failed to load rejected approvals'
      })
      .addCase(approveLeave.pending, (state, action) => {
        const id = action.meta?.arg?.leaveId
        if (id) state.approving[id] = true
      })
      .addCase(approveLeave.fulfilled, (state, action) => {
        const id = action.payload?.leaveId
        if (id) {
          delete state.approving[id]
          state.items = state.items.filter(i => i.id !== id)
        }
      })
      .addCase(approveLeave.rejected, (state, action) => {
        const id = action.meta?.arg?.leaveId
        if (id) delete state.approving[id]
      })
      .addCase(rejectLeave.pending, (state, action) => {
        const id = action.meta?.arg?.leaveId
        if (id) state.rejecting[id] = true
      })
      .addCase(rejectLeave.fulfilled, (state, action) => {
        const id = action.payload?.leaveId
        if (id) {
          delete state.rejecting[id]
          state.items = state.items.filter(i => i.id !== id)
        }
      })
      .addCase(rejectLeave.rejected, (state, action) => {
        const id = action.meta?.arg?.leaveId
        if (id) delete state.rejecting[id]
      })
  }
})

export const selectPendingApprovals = (state) => state.leaveApprovals?.items || []
export const selectApprovalsLoading = (state) => state.leaveApprovals?.loading || 'idle'
export const selectApprovalsError = (state) => state.leaveApprovals?.error || null
export const selectApprovedApprovals = (state) => state.leaveApprovals?.itemsApproved || []
export const selectRejectedApprovals = (state) => state.leaveApprovals?.itemsRejected || []
export const selectApprovedLoading = (state) => state.leaveApprovals?.loadingApproved || 'idle'
export const selectRejectedLoading = (state) => state.leaveApprovals?.loadingRejected || 'idle'
export const selectApprovedError = (state) => state.leaveApprovals?.errorApproved || null
export const selectRejectedError = (state) => state.leaveApprovals?.errorRejected || null
export const selectApprovingMap = (state) => state.leaveApprovals?.approving || {}
export const selectRejectingMap = (state) => state.leaveApprovals?.rejecting || {}

export default leaveApprovalsSlice.reducer
