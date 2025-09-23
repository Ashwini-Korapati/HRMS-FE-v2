import { createSlice, createAsyncThunk, nanoid } from '@reduxjs/toolkit'
import { httpPostService, httpGetService, httpDeleteService, httpPatchService  } from '../../config/httphandler'
import { selectAuthUser, selectAuthCompany } from './authSlice'

// Helper to build endpoint by context
function buildBasePath(state, includeAuthUser = false) {
  const user = selectAuthUser(state)
  const company = selectAuthCompany(state)
  if (!company?.id) return null
  const isAdmin = user?.role === 'ADMIN'
  if (isAdmin) return `${company.id}/departments`
  if (includeAuthUser) return `${company.id}/auth/${user?.id}/departments`
  return `${company.id}/departments`
}

// Create department
export const createDepartment = createAsyncThunk(
  'departments/create',
  async (payload, { getState, rejectWithValue }) => {
    try {
      const state = getState()
      const user = selectAuthUser(state)
      const company = selectAuthCompany(state)
      if (!company?.id) return rejectWithValue({ message: 'Missing company context' })
      
      const isAdmin = user?.role === 'ADMIN'
      const endpoint = isAdmin
        ? `${company.id}/departments`
        : `${company.id}/auth/${user.id}/departments`
      
      const res = await httpPostService(endpoint, payload)
      if (res.status >= 200 && res.status < 300) {
        return res.data?.data || res.data
      }
      return rejectWithValue(res.data || { message: 'Failed to create department' })
    } catch (e) {
      return rejectWithValue({ message: e.message || 'Unexpected error' })
    }
  }
)

// Fetch departments list
export const fetchDepartments = createAsyncThunk('departments/fetchList', async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState()
    const base = buildBasePath(state, true)
    if (!base) return rejectWithValue({ message: 'Missing company context' })
    
    const res = await httpGetService(base)
    if (res.status >= 200 && res.status < 300) return res.data?.data || res.data
    return rejectWithValue(res.data || { message: 'Failed to load departments' })
  } catch (e) {
    return rejectWithValue({ message: e.message || 'Unexpected error' })
  }
})

// Fetch department by ID
export const fetchDepartmentById = createAsyncThunk('departments/fetchOne', async (departmentId, { getState, rejectWithValue }) => {
  try {
    const state = getState()
    const user = selectAuthUser(state)
    const company = selectAuthCompany(state)
    if (!company?.id) return rejectWithValue({ message: 'Missing company context' })
    
    const isAdmin = user?.role === 'ADMIN'
    const endpoint = isAdmin
      ? `${company.id}/departmentS/${departmentId}`
      : `${company.id}/auth/${user.id}/departmentS/${departmentId}`
    
    const res = await httpGetService(endpoint)
    if (res.status >= 200 && res.status < 300) return res.data?.data || res.data
    return rejectWithValue(res.data || { message: 'Failed to load department' })
  } catch (e) {
    return rejectWithValue({ message: e.message || 'Unexpected error' })
  }
})

// Update department
export const updateDepartment = createAsyncThunk('departments/updateOne', async ({ id, ...payload }, { getState, rejectWithValue }) => {
  try {
    const state = getState()
    const user = selectAuthUser(state)
    const company = selectAuthCompany(state)
    if (!company?.id) return rejectWithValue({ message: 'Missing company context' })
    
    const isAdmin = user?.role === 'ADMIN'
    const endpoint = isAdmin
      ? `${company.id}/departments/${id}`
      : `${company.id}/auth/${user.id}/departments/${id}`
    
    const res = await httpPatchService (endpoint, payload)
    if (res.status >= 200 && res.status < 300) return res.data?.data || res.data
    return rejectWithValue(res.data || { message: 'Failed to update department' })
  } catch (e) {
    return rejectWithValue({ message: e.message || 'Unexpected error' })
  }
})

// Delete department
export const deleteDepartment = createAsyncThunk('departments/deleteOne', async (departmentId, { getState, rejectWithValue }) => {
  try {
    const state = getState()
    const user = selectAuthUser(state)
    const company = selectAuthCompany(state)
    if (!company?.id) return rejectWithValue({ message: 'Missing company context' })
    
    const isAdmin = user?.role === 'ADMIN'
    const endpoint = isAdmin
      ? `${company.id}/departments/${departmentId}`
      : `${company.id}/auth/${user.id}/departments/${departmentId}`
    
    const res = await httpDeleteService(endpoint)
    if (res.status >= 200 && res.status < 300) return { id: departmentId }
    return rejectWithValue(res.data || { message: 'Failed to delete department' })
  } catch (e) {
    return rejectWithValue({ message: e.message || 'Unexpected error' })
  }
})

// Delete departments bulk
export const deleteDepartmentsBulk = createAsyncThunk('departments/deleteBulk', async (ids, { getState, rejectWithValue }) => {
  try {
    const state = getState()
    const user = selectAuthUser(state)
    const company = selectAuthCompany(state)
    if (!company?.id) return rejectWithValue({ message: 'Missing company context' })
    
    const isAdmin = user?.role === 'ADMIN'
    const path = isAdmin ? `${company.id}/departments` : `${company.id}/auth/${user.id}/departments`
    const res = await httpDeleteService(path + '?' + new URLSearchParams({ ids: ids.join(',') }))
    if (res.status >= 200 && res.status < 300) return { ids }
    return rejectWithValue(res.data || { message: 'Failed to delete departments' })
  } catch (e) {
    return rejectWithValue({ message: e.message || 'Unexpected error' })
  }
})

const initialState = {
  items: [], // flat list of department summaries
  pagination: null, // { page, limit, total, pages }
  itemsLoaded: false,
  loadingList: 'idle', // idle | loading | succeeded | failed
  loadingOne: 'idle',
  updating: 'idle',
  deleting: 'idle',
  createError: null,
  listError: null,
  detailError: null,
  updateError: null,
  deleteError: null,
  creating: 'idle', // create status
  lastCreated: null, // convenience direct department object
  version: nanoid(6)
}

const departmentSlice = createSlice({
  name: 'departments',
  initialState,
  reducers: {
    resetDepartmentState(state) {
      state.creating = 'idle'
      state.createError = null
      state.lastCreated = null
    },
    clearDepartmentErrors(state) {
      state.createError = null
      state.listError = null
      state.detailError = null
      state.updateError = null
      state.deleteError = null
    }
  },
  extraReducers: builder => {
    builder
      // Create department
      .addCase(createDepartment.pending, (state) => {
        state.creating = 'loading'
        state.createError = null
      })
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.creating = 'succeeded'
        const department = action.payload
        state.lastCreated = department || null
        if (department && department.id && !state.items.find(d => d.id === department.id)) {
          state.items.push(department)
        }
      })
      .addCase(createDepartment.rejected, (state, action) => {
        state.creating = 'failed'
        state.createError = action.payload?.message || 'Create failed'
      })
      // Fetch list
      .addCase(fetchDepartments.pending, (state) => {
        state.loadingList = 'loading'
        state.listError = null
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loadingList = 'succeeded'
        const payload = action.payload || {}
        const pag = payload.pagination || null
        const list = payload.items || payload.departments || payload || []
        state.items = Array.isArray(list) ? list : Array.isArray(list?.items) ? list.items : []
        state.pagination = pag
        state.itemsLoaded = true
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loadingList = 'failed'
        state.listError = action.payload?.message || 'Load failed'
      })
      // Fetch one
      .addCase(fetchDepartmentById.pending, (state) => {
        state.loadingOne = 'loading'
        state.detailError = null
      })
      .addCase(fetchDepartmentById.fulfilled, (state, action) => {
        state.loadingOne = 'succeeded'
        const dept = action.payload
        if (dept && dept.id) {
          const idx = state.items.findIndex(d => d.id === dept.id)
          if (idx >= 0) state.items[idx] = { ...state.items[idx], ...dept }
          else state.items.push(dept)
        }
      })
      .addCase(fetchDepartmentById.rejected, (state, action) => {
        state.loadingOne = 'failed'
        state.detailError = action.payload?.message || 'Load failed'
      })
      // Update department
      .addCase(updateDepartment.pending, (state) => {
        state.updating = 'loading'
        state.updateError = null
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        state.updating = 'succeeded'
        const dept = action.payload
        if (dept && dept.id) {
          const idx = state.items.findIndex(d => d.id === dept.id)
          if (idx >= 0) state.items[idx] = { ...state.items[idx], ...dept }
          else state.items.push(dept)
        }
      })
      .addCase(updateDepartment.rejected, (state, action) => {
        state.updating = 'failed'
        state.updateError = action.payload?.message || 'Update failed'
      })
      // Delete single
      .addCase(deleteDepartment.pending, (state) => {
        state.deleting = 'loading'
        state.deleteError = null
      })
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.deleting = 'succeeded'
        const id = action.payload?.id
        if (id) state.items = state.items.filter(d => d.id !== id)
      })
      .addCase(deleteDepartment.rejected, (state, action) => {
        state.deleting = 'failed'
        state.deleteError = action.payload?.message || 'Delete failed'
      })
      // Delete bulk
      .addCase(deleteDepartmentsBulk.pending, (state) => {
        state.deleting = 'loading'
        state.deleteError = null
      })
      .addCase(deleteDepartmentsBulk.fulfilled, (state, action) => {
        state.deleting = 'succeeded'
        const ids = action.payload?.ids || []
        if (ids.length) state.items = state.items.filter(d => !ids.includes(d.id))
      })
      .addCase(deleteDepartmentsBulk.rejected, (state, action) => {
        state.deleting = 'failed'
        state.deleteError = action.payload?.message || 'Bulk delete failed'
      })
  }
})

export const { resetDepartmentState, clearDepartmentErrors } = departmentSlice.actions

// Selectors
export const selectDepartmentsState = (s) => s.departments
export const selectDepartmentCreating = (s) => s.departments.creating
export const selectDepartmentCreateError = (s) => s.departments.createError
export const selectDepartments = (s) => s.departments.items
export const selectDepartmentsPagination = (s) => s.departments.pagination
export const selectLastCreatedDepartment = (s) => s.departments.lastCreated
export const selectDepartmentsListLoading = (s) => s.departments.loadingList
export const selectDepartmentsListError = (s) => s.departments.listError
export const selectDepartmentDetailLoading = (s) => s.departments.loadingOne
export const selectDepartmentDetailError = (s) => s.departments.detailError
export const selectDepartmentUpdating = (s) => s.departments.updating
export const selectDepartmentUpdateError = (s) => s.departments.updateError
export const selectDepartmentDeleting = (s) => s.departments.deleting
export const selectDepartmentDeleteError = (s) => s.departments.deleteError
export const selectDepartmentCreateSuccess = state => state.departments.createSuccess
export default departmentSlice.reducer