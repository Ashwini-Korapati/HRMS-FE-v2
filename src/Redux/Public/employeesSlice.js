import { createSlice, createAsyncThunk, nanoid } from '@reduxjs/toolkit'
import { httpGetService, httpPostService } from '../../config/httphandler'
import { selectAuthCompany } from './authSlice'

// Fetch company employees (basic directory) – shape expected: { items: [...], pagination? }
export const fetchCompanyEmployees = createAsyncThunk('employees/fetchCompanyEmployees', async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState()
    const company = selectAuthCompany(state)
    if (!company?.id) return rejectWithValue({ message: 'Missing company context' })
    // Endpoint pattern consistent with temporary fetch in component: /companies/:companyId/employees
    const endpoint = `companies/${company.id}/employees`
    const res = await httpGetService(endpoint)
    if (res.status >= 200 && res.status < 300) {
      const payload = res.data?.data || res.data || {}
      if (Array.isArray(payload.items)) return payload
      if (Array.isArray(payload)) return { items: payload }
      return { items: [] }
    }
    return rejectWithValue(res.data || { message: 'Failed to load employees' })
  } catch (e) {
    return rejectWithValue({ message: e.message || 'Unexpected error' })
  }
})

const initialState = {
  items: [],
  pagination: null,
  loading: 'idle', // idle | loading | succeeded | failed
  error: null,
  assigning: 'idle', // posting members
  assignError: null,
  lastAssigned: null, // { projectId, userIds }
  version: nanoid(6)
}

// payload: { companyId, projectId, members: [ { userId, enabledRoutesStatus } ] }
// The API appears to expect POST body for each member { projectId, userId, enabledRoutesStatus }
// We'll support sending an array; if backend only handles single, we iterate.
export const assignEmployeesToProject = createAsyncThunk('employees/assignToProject', async ({ companyId, projectId, members }, { rejectWithValue }) => {
  if (!companyId || !projectId || !Array.isArray(members) || !members.length) {
    return rejectWithValue({ message: 'Missing companyId, projectId or members' })
  }
  try {
    // If API accepts batch, send array; if it expects single items, we can fallback sequentially.
    // Given provided sample (single object) we post each member individually.
    const results = []
    for (const m of members) {
      const body = {
        projectId,
        userId: m.userId,
        enabledRoutesStatus: m.enabledRoutesStatus || {},
        attendanceType: m.attendanceType || 'OFFICE',
        workShiftId: m.workShiftId || null
      }
      const endpoint = `${companyId}/projects/${projectId}/members`
      const res = await httpPostService(endpoint, body)
      if (!(res.status >= 200 && res.status < 300)) {
        return rejectWithValue(res.data || { message: 'Failed to assign member' })
      }
      results.push(res.data?.data || body)
    }
    return { projectId, companyId, assigned: results }
  } catch (e) {
    return rejectWithValue({ message: e.message || 'Unexpected error' })
  }
})

const employeesSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    // Potential future reducers (e.g., optimistic update on assign) can go here
  },
  extraReducers: builder => {
    builder
      .addCase(fetchCompanyEmployees.pending, (state) => {
        state.loading = 'loading'
        state.error = null
      })
      .addCase(fetchCompanyEmployees.fulfilled, (state, action) => {
        state.loading = 'succeeded'
        const payload = action.payload || {}
        state.items = Array.isArray(payload.items) ? payload.items : []
        state.pagination = payload.pagination || null
      })
      .addCase(fetchCompanyEmployees.rejected, (state, action) => {
        state.loading = 'failed'
        state.error = action.payload?.message || 'Load failed'
      })
      // Assign members
      .addCase(assignEmployeesToProject.pending, (state) => {
        state.assigning = 'loading'
        state.assignError = null
      })
      .addCase(assignEmployeesToProject.fulfilled, (state, action) => {
        state.assigning = 'succeeded'
        const { assigned } = action.payload || {}
        state.lastAssigned = action.payload
        if (Array.isArray(assigned)) {
          // Mark those users as active in project
            const ids = new Set(assigned.map(a => a.userId || a.user_id))
            state.items = state.items.map(emp => ids.has(emp.user_id || emp.id) ? { ...emp, isActiveInProject: true } : emp)
        }
      })
      .addCase(assignEmployeesToProject.rejected, (state, action) => {
        state.assigning = 'failed'
        state.assignError = action.payload?.message || 'Assign failed'
      })
  }
})

/*
// Example future thunk & reducer pattern for assigning members to a project
// export const assignEmployeesToProject = createAsyncThunk('employees/assignToProject', async ({ projectId, userIds }, { rejectWithValue }) => {
//   try {
//     const res = await httpPostService(`project/${projectId}/members`, { userIds })
//     if (res.status >= 200 && res.status < 300) return { projectId, userIds }
//     return rejectWithValue(res.data || { message: 'Failed to assign members' })
//   } catch (e) {
//     return rejectWithValue({ message: e.message || 'Unexpected error' })
//   }
// })
// Then add cases in extraReducers to update local employees (e.g., set isActiveInProject=true for added userIds)
*/

// selectors
export const selectEmployeesState = s => s.employees
export const selectEmployees = s => s.employees.items
export const selectEmployeesLoading = s => s.employees.loading
export const selectEmployeesError = s => s.employees.error
export const selectEmployeesAssigning = s => s.employees.assigning
export const selectEmployeesAssignError = s => s.employees.assignError
export const selectEmployeesLastAssigned = s => s.employees.lastAssigned

export default employeesSlice.reducer
