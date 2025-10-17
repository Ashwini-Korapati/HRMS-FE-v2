
  // export default workShiftsSlice.reducer

  import { createSlice, createAsyncThunk, nanoid } from '@reduxjs/toolkit'
import { httpPostService, httpGetService, httpPutService, httpDeleteService } from '../../config/httphandler'
import { selectAuthUser, selectAuthCompany } from './authSlice'

// Enhanced thunks with better error handling
export const createWorkShift = createAsyncThunk('workShifts/create', async (payload, { getState, rejectWithValue }) => {
  try {
    const state = getState()
    const user = selectAuthUser(state)
    const company = selectAuthCompany(state)
    
    if (!company?.id) return rejectWithValue({ message: 'Missing company context' })
    if (user?.role !== 'ADMIN') return rejectWithValue({ message: 'Unauthorized: Admin access required' })

    const endpoint = `${company.id}/work-shifts`
    const res = await httpPostService(endpoint, payload)
    
    if (res.status >= 200 && res.status < 300) {
      return { data: res.data?.data || res.data, message: 'Work shift created successfully' }
    }
    return rejectWithValue(res.data || { message: 'Failed to create work shift' })
  } catch (e) {
    return rejectWithValue({ message: e.message || 'Unexpected error creating work shift' })
  }
})

export const fetchWorkShifts = createAsyncThunk('workShifts/fetchList', async (projectId, { getState, rejectWithValue }) => {
  try {
    const state = getState()
    const user = selectAuthUser(state)
    const company = selectAuthCompany(state)
    
    if (!company?.id) return rejectWithValue({ message: 'Missing company context' })
    if (user?.role !== 'ADMIN') return rejectWithValue({ message: 'Unauthorized: Admin access required' })

    let endpoint = `${company.id}/work-shifts`
    if (projectId) {
      endpoint += `?projectId=${projectId}`
    }
    
    const res = await httpGetService(endpoint)
    if (res.status >= 200 && res.status < 300) return res.data?.data || res.data
    return rejectWithValue(res.data || { message: 'Failed to load work shifts' })
  } catch (e) {
    return rejectWithValue({ message: e.message || 'Unexpected error loading work shifts' })
  }
})

export const updateWorkShift = createAsyncThunk('workShifts/updateOne', async ({ shiftId, payload }, { getState, rejectWithValue }) => {
  try {
    const state = getState()
    const user = selectAuthUser(state)
    const company = selectAuthCompany(state)
    
    if (!company?.id) return rejectWithValue({ message: 'Missing company context' })
    if (user?.role !== 'ADMIN') return rejectWithValue({ message: 'Unauthorized: Admin access required' })

    const endpoint = `${company.id}/work-shifts/${shiftId}`
    const res = await httpPutService(endpoint, payload)
    
    if (res.status >= 200 && res.status < 300) {
      return { data: res.data?.data || res.data, message: 'Work shift updated successfully' }
    }
    return rejectWithValue(res.data || { message: 'Failed to update work shift' })
  } catch (e) {
    return rejectWithValue({ message: e.message || 'Unexpected error updating work shift' })
  }
})

export const deleteWorkShift = createAsyncThunk('workShifts/deleteOne', async (shiftId, { getState, rejectWithValue }) => {
  try {
    const state = getState()
    const user = selectAuthUser(state)
    const company = selectAuthCompany(state)
    
    if (!company?.id) return rejectWithValue({ message: 'Missing company context' })
    if (user?.role !== 'ADMIN') return rejectWithValue({ message: 'Unauthorized: Admin access required' })

    const endpoint = `${company.id}/work-shifts/${shiftId}`
    const res = await httpDeleteService(endpoint)
    
    if (res.status >= 200 && res.status < 300) {
      return { id: shiftId, message: 'Work shift deleted successfully' }
    }
    return rejectWithValue(res.data || { message: 'Failed to delete work shift' })
  } catch (e) {
    return rejectWithValue({ message: e.message || 'Unexpected error deleting work shift' })
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
  currentShift: null,
  successMessage: null,
  version: nanoid(6)
}

const workShiftsSlice = createSlice({
  name: 'workShifts',
  initialState,
  reducers: {
    resetWorkShiftState(state) {
      state.creating = 'idle'
      state.createError = null
      state.lastCreated = null
      state.successMessage = null
    },
    setCurrentShift(state, action) {
      state.currentShift = action.payload
    },
    clearCurrentShift(state) {
      state.currentShift = null
    },
    clearErrors(state) {
      state.createError = null
      state.listError = null
      state.detailError = null
      state.updateError = null
      state.deleteError = null
    },
    clearSuccessMessage(state) {
      state.successMessage = null
    },
    setSuccessMessage(state, action) {
      state.successMessage = action.payload
    }
  },
  extraReducers: builder => {
    builder
      // Create work shift
      .addCase(createWorkShift.pending, (state) => {
        state.creating = 'loading'
        state.createError = null
        state.successMessage = null
      })
      .addCase(createWorkShift.fulfilled, (state, action) => {
        state.creating = 'succeeded'
        const shift = action.payload.data
        const message = action.payload.message
        state.lastCreated = shift
        state.successMessage = message
        if (shift && shift.id && !state.items.find(s => s.id === shift.id)) {
          state.items.push(shift)
        }
      })
      .addCase(createWorkShift.rejected, (state, action) => {
        state.creating = 'failed'
        state.createError = action.payload?.message || 'Failed to create work shift'
      })
      // Fetch list
      .addCase(fetchWorkShifts.pending, (state) => {
        state.loadingList = 'loading'
        state.listError = null
      })
      .addCase(fetchWorkShifts.fulfilled, (state, action) => {
        state.loadingList = 'succeeded'
        const payload = action.payload || {}
        const pag = payload.pagination || null
        const list = payload.items || payload.shifts || payload || []
        state.items = Array.isArray(list) ? list : []
        state.pagination = pag
        state.itemsLoaded = true
      })
      .addCase(fetchWorkShifts.rejected, (state, action) => {
        state.loadingList = 'failed'
        state.listError = action.payload?.message || 'Failed to load work shifts'
      })
      // Update
      .addCase(updateWorkShift.pending, (state) => {
        state.updating = 'loading'
        state.updateError = null
        state.successMessage = null
      })
      .addCase(updateWorkShift.fulfilled, (state, action) => {
        state.updating = 'succeeded'
        const shift = action.payload.data
        const message = action.payload.message
        state.successMessage = message
        if (shift && shift.id) {
          const idx = state.items.findIndex(s => s.id === shift.id)
          if (idx >= 0) state.items[idx] = { ...state.items[idx], ...shift }
          if (state.currentShift?.id === shift.id) {
            state.currentShift = { ...state.currentShift, ...shift }
          }
        }
      })
      .addCase(updateWorkShift.rejected, (state, action) => {
        state.updating = 'failed'
        state.updateError = action.payload?.message || 'Failed to update work shift'
      })
      // Delete
      .addCase(deleteWorkShift.pending, (state) => {
        state.deleting = 'loading'
        state.deleteError = null
        state.successMessage = null
      })
      .addCase(deleteWorkShift.fulfilled, (state, action) => {
        state.deleting = 'succeeded'
        const id = action.payload.id
        const message = action.payload.message
        state.successMessage = message
        if (id) {
          state.items = state.items.filter(s => s.id !== id)
          if (state.currentShift?.id === id) {
            state.currentShift = null
          }
        }
      })
      .addCase(deleteWorkShift.rejected, (state, action) => {
        state.deleting = 'failed'
        state.deleteError = action.payload?.message || 'Failed to delete work shift'
      })
  }
})

export const { 
  resetWorkShiftState, 
  setCurrentShift, 
  clearCurrentShift, 
  clearErrors, 
  clearSuccessMessage,
  setSuccessMessage 
} = workShiftsSlice.actions

// Selectors
export const selectWorkShiftsState = (s) => s.workShifts
export const selectWorkShifts = (s) => s.workShifts.items
export const selectWorkShiftsPagination = (s) => s.workShifts.pagination
export const selectWorkShiftsLoaded = (s) => s.workShifts.itemsLoaded
export const selectWorkShiftCreating = (s) => s.workShifts.creating
export const selectWorkShiftCreateError = (s) => s.workShifts.createError
export const selectWorkShiftsListLoading = (s) => s.workShifts.loadingList
export const selectWorkShiftsListError = (s) => s.workShifts.listError
export const selectWorkShiftDetailLoading = (s) => s.workShifts.loadingOne
export const selectWorkShiftDetailError = (s) => s.workShifts.detailError
export const selectCurrentWorkShift = (s) => s.workShifts.currentShift
export const selectWorkShiftUpdating = (s) => s.workShifts.updating
export const selectWorkShiftUpdateError = (s) => s.workShifts.updateError
export const selectWorkShiftDeleting = (s) => s.workShifts.deleting
export const selectWorkShiftDeleteError = (s) => s.workShifts.deleteError
export const selectLastCreatedWorkShift = (s) => s.workShifts.lastCreated
export const selectWorkShiftSuccessMessage = (s) => s.workShifts.successMessage

export default workShiftsSlice.reducer