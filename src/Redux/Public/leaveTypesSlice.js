 import { createSlice, createAsyncThunk, nanoid } from '@reduxjs/toolkit'
import { httpPostService, httpGetService, httpPatchService, httpDeleteService } from '../../config/httphandler'
import { selectAuthUser, selectAuthCompany } from './authSlice'

// Create leave type - ADMIN ONLY
export const createLeaveType = createAsyncThunk('leaveTypes/create', async (payload, { getState, rejectWithValue }) => {
  try {
    const state = getState()
    const user = selectAuthUser(state)
    const company = selectAuthCompany(state)
    
    if (!company?.id) return rejectWithValue({ message: 'Missing company context' })
    if (user?.role !== 'ADMIN') return rejectWithValue({ message: 'Only administrators can create leave types' })
    
    const endpoint = `${company.id}/leaves/types`
    const res = await httpPostService(endpoint, payload)
    
    if (res.status >= 200 && res.status < 300) {
      return res.data?.data || res.data
    }
    return rejectWithValue(res.data || { message: 'Failed to create leave type' })
  } catch (e) {
    return rejectWithValue({ message: e.message || 'Unexpected error' })
  }
})

// Fetch leave types - ADMIN ONLY
export const fetchLeaveTypes = createAsyncThunk('leaveTypes/fetchList', async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState()
    const user = selectAuthUser(state)
    const company = selectAuthCompany(state)
    
    if (!company?.id) return rejectWithValue({ message: 'Missing company context' })
    if (user?.role !== 'ADMIN') return rejectWithValue({ message: 'Only administrators can view leave types' })
    
    const endpoint = `${company.id}/leaves/types/list`  // Updated endpoint
    const res = await httpGetService(endpoint)
    
    if (res.status >= 200 && res.status < 300) {
      // Handle the new response format
      const responseData = res.data?.data || res.data
      return Array.isArray(responseData) ? responseData : []
    }
    return rejectWithValue(res.data || { message: 'Failed to load leave types' })
  } catch (e) {
    return rejectWithValue({ message: e.message || 'Unexpected error' })
  }
})

// Fetch leave type by ID - ADMIN ONLY
export const fetchLeaveTypeById = createAsyncThunk('leaveTypes/fetchOne', async (leaveTypeId, { getState, rejectWithValue }) => {
  try {
    const state = getState()
    const user = selectAuthUser(state)
    const company = selectAuthCompany(state)
    
    if (!company?.id) return rejectWithValue({ message: 'Missing company context' })
    if (user?.role !== 'ADMIN') return rejectWithValue({ message: 'Only administrators can view leave types' })
    
    const endpoint = `${company.id}/leaves/types/${leaveTypeId}`
    const res = await httpGetService(endpoint)
    
    if (res.status >= 200 && res.status < 300) return res.data?.data || res.data
    return rejectWithValue(res.data || { message: 'Failed to load leave type' })
  } catch (e) {
    return rejectWithValue({ message: e.message || 'Unexpected error' })
  }
})

// Update leave type - ADMIN ONLY
export const updateLeaveType = createAsyncThunk('leaveTypes/updateOne', async ({ id, ...payload }, { getState, rejectWithValue }) => {
  try {
    const state = getState()
    const user = selectAuthUser(state)
    const company = selectAuthCompany(state)
    
    if (!company?.id) return rejectWithValue({ message: 'Missing company context' })
    if (user?.role !== 'ADMIN') return rejectWithValue({ message: 'Only administrators can update leave types' })
    
    const endpoint = `${company.id}/leaves/types/${id}`
    const res = await httpPatchService(endpoint, payload)
    
    if (res.status >= 200 && res.status < 300) return res.data?.data || res.data
    return rejectWithValue(res.data || { message: 'Failed to update leave type' })
  } catch (e) {
    return rejectWithValue({ message: e.message || 'Unexpected error' })
  }
})

// Delete leave type - ADMIN ONLY
export const deleteLeaveType = createAsyncThunk('leaveTypes/deleteOne', async (leaveTypeId, { getState, rejectWithValue }) => {
  try {
    const state = getState()
    const user = selectAuthUser(state)
    const company = selectAuthCompany(state)
    
    if (!company?.id) return rejectWithValue({ message: 'Missing company context' })
    if (user?.role !== 'ADMIN') return rejectWithValue({ message: 'Only administrators can delete leave types' })
    
    const endpoint = `${company.id}/leaves/types/${leaveTypeId}`
    const res = await httpDeleteService(endpoint)
    
    if (res.status >= 200 && res.status < 300) return { id: leaveTypeId }
    return rejectWithValue(res.data || { message: 'Failed to delete leave type' })
  } catch (e) {
    return rejectWithValue({ message: e.message || 'Unexpected error' })
  }
})

// Delete leave types bulk - ADMIN ONLY
export const deleteLeaveTypesBulk = createAsyncThunk('leaveTypes/deleteBulk', async (ids, { getState, rejectWithValue }) => {
  try {
    const state = getState()
    const user = selectAuthUser(state)
    const company = selectAuthCompany(state)
    
    if (!company?.id) return rejectWithValue({ message: 'Missing company context' })
    if (user?.role !== 'ADMIN') return rejectWithValue({ message: 'Only administrators can delete leave types' })
    
    const endpoint = `${company.id}/leaves/types?` + new URLSearchParams({ ids: ids.join(',') })
    const res = await httpDeleteService(endpoint)
    
    if (res.status >= 200 && res.status < 300) return { ids }
    return rejectWithValue(res.data || { message: 'Failed to delete leave types' })
  } catch (e) {
    return rejectWithValue({ message: e.message || 'Unexpected error' })
  }
})

const initialState = {
  items: [],
  pagination: null,
  itemsLoaded: false,
  loadingList: 'idle',
  loadingOne: 'idle',
  creating: 'idle',
  updating: 'idle',
  deleting: 'idle',
  createError: null,
  listError: null,
  detailError: null,
  updateError: null,
  deleteError: null,
  lastCreated: null,
  version: nanoid(6)
}

const leaveTypesSlice = createSlice({
  name: 'leaveTypes',
  initialState,
  reducers: {
    resetLeaveTypeState(state) {
      state.creating = 'idle'
      state.createError = null
      state.lastCreated = null
    },
    clearLeaveTypeErrors(state) {
      state.createError = null
      state.listError = null
      state.detailError = null
      state.updateError = null
      state.deleteError = null
    },
    clearLeaveTypesList(state) {
      state.items = []
      state.itemsLoaded = false
      state.loadingList = 'idle'
      state.listError = null
    }
  },
  extraReducers: builder => {
    builder
      // Create leave type
      .addCase(createLeaveType.pending, (state) => {
        state.creating = 'loading'
        state.createError = null
      })
      .addCase(createLeaveType.fulfilled, (state, action) => {
        state.creating = 'succeeded'
        const leaveType = action.payload
        state.lastCreated = leaveType
        if (leaveType && leaveType.id && !state.items.find(lt => lt.id === leaveType.id)) {
          state.items.unshift(leaveType)
        }
      })
      .addCase(createLeaveType.rejected, (state, action) => {
        state.creating = 'failed'
        state.createError = action.payload?.message || 'Create failed'
      })
      // Fetch list
      .addCase(fetchLeaveTypes.pending, (state) => {
        state.loadingList = 'loading'
        state.listError = null
      })
      .addCase(fetchLeaveTypes.fulfilled, (state, action) => {
        state.loadingList = 'succeeded'
        const leaveTypes = action.payload || []
        
        state.items = Array.isArray(leaveTypes) ? leaveTypes : []
        state.itemsLoaded = true
      })
      .addCase(fetchLeaveTypes.rejected, (state, action) => {
        state.loadingList = 'failed'
        state.listError = action.payload?.message || 'Load failed'
      })
      // Fetch one
      .addCase(fetchLeaveTypeById.pending, (state) => {
        state.loadingOne = 'loading'
        state.detailError = null
      })
      .addCase(fetchLeaveTypeById.fulfilled, (state, action) => {
        state.loadingOne = 'succeeded'
        const leaveType = action.payload
        if (leaveType && leaveType.id) {
          const idx = state.items.findIndex(lt => lt.id === leaveType.id)
          if (idx >= 0) state.items[idx] = { ...state.items[idx], ...leaveType }
          else state.items.unshift(leaveType)
        }
      })
      .addCase(fetchLeaveTypeById.rejected, (state, action) => {
        state.loadingOne = 'failed'
        state.detailError = action.payload?.message || 'Load failed'
      })
      // Update
      .addCase(updateLeaveType.pending, (state) => {
        state.updating = 'loading'
        state.updateError = null
      })
      .addCase(updateLeaveType.fulfilled, (state, action) => {
        state.updating = 'succeeded'
        const leaveType = action.payload
        if (leaveType && leaveType.id) {
          const idx = state.items.findIndex(lt => lt.id === leaveType.id)
          if (idx >= 0) state.items[idx] = { ...state.items[idx], ...leaveType }
        }
      })
      .addCase(updateLeaveType.rejected, (state, action) => {
        state.updating = 'failed'
        state.updateError = action.payload?.message || 'Update failed'
      })
      // Delete single
      .addCase(deleteLeaveType.pending, (state) => {
        state.deleting = 'loading'
        state.deleteError = null
      })
      .addCase(deleteLeaveType.fulfilled, (state, action) => {
        state.deleting = 'succeeded'
        const id = action.payload?.id
        if (id) state.items = state.items.filter(lt => lt.id !== id)
      })
      .addCase(deleteLeaveType.rejected, (state, action) => {
        state.deleting = 'failed'
        state.deleteError = action.payload?.message || 'Delete failed'
      })
      // Delete bulk
      .addCase(deleteLeaveTypesBulk.pending, (state) => {
        state.deleting = 'loading'
        state.deleteError = null
      })
      .addCase(deleteLeaveTypesBulk.fulfilled, (state, action) => {
        state.deleting = 'succeeded'
        const ids = action.payload?.ids || []
        if (ids.length) state.items = state.items.filter(lt => !ids.includes(lt.id))
      })
      .addCase(deleteLeaveTypesBulk.rejected, (state, action) => {
        state.deleting = 'failed'
        state.deleteError = action.payload?.message || 'Bulk delete failed'
      })
  }
})

export const { resetLeaveTypeState, clearLeaveTypeErrors, clearLeaveTypesList } = leaveTypesSlice.actions

// Selectors
export const selectLeaveTypesState = (s) => s.leaveTypes
export const selectLeaveTypesCreating = (s) => s.leaveTypes.creating
export const selectLeaveTypesCreateError = (s) => s.leaveTypes.createError
export const selectLeaveTypes = (s) => s.leaveTypes.items
export const selectLeaveTypesPagination = (s) => s.leaveTypes.pagination
export const selectLastCreatedLeaveType = (s) => s.leaveTypes.lastCreated
export const selectLeaveTypesListLoading = (s) => s.leaveTypes.loadingList
export const selectLeaveTypesListError = (s) => s.leaveTypes.listError
export const selectLeaveTypeDetailLoading = (s) => s.leaveTypes.loadingOne
export const selectLeaveTypeDetailError = (s) => s.leaveTypes.detailError
export const selectLeaveTypeUpdating = (s) => s.leaveTypes.updating
export const selectLeaveTypeUpdateError = (s) => s.leaveTypes.updateError
export const selectLeaveTypeDeleting = (s) => s.leaveTypes.deleting
export const selectLeaveTypeDeleteError = (s) => s.leaveTypes.deleteError

export default leaveTypesSlice.reducer