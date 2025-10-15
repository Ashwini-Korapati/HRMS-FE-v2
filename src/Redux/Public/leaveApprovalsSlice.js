import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { httpGetService, httpPatchService } from '../../config/httphandler'

const initialState = {
  items: [],
  loading: 'idle',
  error: null,
  approving: {},
  rejecting: {},
}

export const fetchPendingApprovals = createAsyncThunk(
  'leaveApprovals/fetchPending',
  async ({ companyId, userId, designationId }) => {
    const res = await httpGetService(`${companyId}/auth/${userId}/leaves/approvals/designation/${designationId}/pending`)
    if (res.status >= 200 && res.status < 300) return res.data?.data || []
    return []
  }
)

export const approveLeave = createAsyncThunk(
  'leaveApprovals/approve',
  async ({ companyId, userId, designationId, leaveId }) => {
    const res = await httpPatchService(`${companyId}/auth/${userId}/leaves/approvals/designation/${designationId}/${leaveId}/approve`, {})
    return { ok: res.status >= 200 && res.status < 300, leaveId }
  }
)

export const rejectLeave = createAsyncThunk(
  'leaveApprovals/reject',
  async ({ companyId, userId, designationId, leaveId }) => {
    const res = await httpPatchService(`${companyId}/auth/${userId}/leaves/approvals/designation/${designationId}/${leaveId}/reject`, {})
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
export const selectApprovingMap = (state) => state.leaveApprovals?.approving || {}
export const selectRejectingMap = (state) => state.leaveApprovals?.rejecting || {}

export default leaveApprovalsSlice.reducer
