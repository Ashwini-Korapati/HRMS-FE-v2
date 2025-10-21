import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { httpGetService, httpPostService } from '../../config/httphandler'

const initialState = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 10,
  loading: 'idle',
  error: null,
  checkingIn: false,
  checkingOut: false,
  lastAction: null, // { type: 'check-in'|'check-out', at: Date|string, data: any }
  lastAttendanceId: null,
}

export const fetchAttendance = createAsyncThunk(
  'attendance/fetchAll',
  async ({ companyId }) => {
    const res = await httpGetService(`${companyId}/attendance`)
    if (res.status >= 200 && res.status < 300) {
      const data = res.data?.data || res.data || {}
      return {
        items: Array.isArray(data.items) ? data.items : (Array.isArray(res.data?.items) ? res.data.items : []),
        total: data.total || 0,
        page: data.page || 1,
        pageSize: data.pageSize || 10,
      }
    }
    throw new Error(res.data?.message || 'Failed to load attendance')
  }
)

export const checkIn = createAsyncThunk(
  'attendance/checkIn',
  async ({ companyId, userId, role, attendanceId }) => {
    const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'IT'].includes((role || '').toUpperCase())
    const base = isAdmin ? `${companyId}/attendance` : `${companyId}/auth/${userId}/attendance`
    // Prefer stable GET endpoint if attendanceId is provided
    const res = attendanceId
      ? await httpGetService(`${base}/${attendanceId}/check-in`)
      : await httpPostService(`${base}/check-in`, {})
    if (res.status >= 200 && res.status < 300) {
      return res.data?.data || { success: true }
    }
    throw new Error(res.data?.message || 'Check-in failed')
  }
)

export const checkOut = createAsyncThunk(
  'attendance/checkOut',
  async ({ companyId, userId, role, attendanceId }) => {
    const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'IT'].includes((role || '').toUpperCase())
    const base = isAdmin ? `${companyId}/attendance` : `${companyId}/auth/${userId}/attendance`
    const res = attendanceId
      ? await httpGetService(`${base}/${attendanceId}/check-out`)
      : await httpPostService(`${base}/check-out`, {})
    if (res.status >= 200 && res.status < 300) {
      return res.data?.data || { success: true }
    }
    throw new Error(res.data?.message || 'Check-out failed')
  }
)

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttendance.pending, (state) => {
        state.loading = 'loading'
        state.error = null
      })
      .addCase(fetchAttendance.fulfilled, (state, action) => {
        state.loading = 'succeeded'
        state.items = action.payload.items
        state.total = action.payload.total
        state.page = action.payload.page
        state.pageSize = action.payload.pageSize
      })
      .addCase(fetchAttendance.rejected, (state, action) => {
        state.loading = 'failed'
        state.error = action.error?.message || 'Failed to load attendance'
      })
      .addCase(checkIn.pending, (state) => {
        state.checkingIn = true
      })
      .addCase(checkIn.fulfilled, (state, action) => {
        state.checkingIn = false
        state.lastAction = { type: 'check-in', at: action.payload?.checkInTime || new Date().toISOString(), data: action.payload }
        state.lastAttendanceId = action.payload?.attendanceId || action.payload?.id || state.lastAttendanceId
      })
      .addCase(checkIn.rejected, (state, action) => {
        state.checkingIn = false
        state.error = action.error?.message || 'Check-in failed'
      })
      .addCase(checkOut.pending, (state) => {
        state.checkingOut = true
      })
      .addCase(checkOut.fulfilled, (state, action) => {
        state.checkingOut = false
        state.lastAction = { type: 'check-out', at: action.payload?.checkOutTime || new Date().toISOString(), data: action.payload }
        state.lastAttendanceId = action.payload?.attendanceId || action.payload?.id || state.lastAttendanceId
      })
      .addCase(checkOut.rejected, (state, action) => {
        state.checkingOut = false
        state.error = action.error?.message || 'Check-out failed'
      })
  }
})

export const selectAttendanceItems = (s) => s.attendance?.items || []
export const selectAttendanceLoading = (s) => s.attendance?.loading || 'idle'
export const selectAttendanceError = (s) => s.attendance?.error || null
export const selectCheckingIn = (s) => s.attendance?.checkingIn || false
export const selectCheckingOut = (s) => s.attendance?.checkingOut || false
export const selectAttendanceLastAction = (s) => s.attendance?.lastAction || null

export default attendanceSlice.reducer
