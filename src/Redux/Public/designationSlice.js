import { createSlice, createAsyncThunk, nanoid } from '@reduxjs/toolkit'
import { httpGetService, httpPostService } from '../../config/httphandler'
import { selectAuthUser, selectAuthCompany } from './authSlice'

// Helper to build endpoint by context
function buildBasePath(state) {
  const user = selectAuthUser(state)
  const company = selectAuthCompany(state)
  if (!company?.id) return null
  const isAdmin = user?.role === 'ADMIN'
  if (isAdmin) return company.id
  return `${company.id}/auth/${user?.id}`
}

// Create designation
export const createDesignation = createAsyncThunk(
  'designations/create',
  async (payload, { getState, rejectWithValue }) => {
    try {
      const state = getState()
      const base = buildBasePath(state)
      if (!base) return rejectWithValue({ message: 'Missing company context' })
      const endpoint = `${base}/designations`
      const res = await httpPostService(endpoint, payload)
      if (res.status >= 200 && res.status < 300) {
        return res.data?.data || res.data
      }
      return rejectWithValue(res.data || { message: 'Failed to create designation' })
    } catch (e) {
      return rejectWithValue({ message: e.message || 'Unexpected error' })
    }
  }
)

// Fetch designations list
export const fetchDesignations = createAsyncThunk(
  'designations/fetchList',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState()
      const base = buildBasePath(state)
      if (!base) return rejectWithValue({ message: 'Missing company context' })
      const endpoint = `${base}/designations`
      const res = await httpGetService(endpoint)
      if (res.status >= 200 && res.status < 300) {
        // Handle nested response structure
        return res.data?.data?.items || []
      }
      return rejectWithValue(res.data || { message: 'Failed to load designations' })
    } catch (e) {
      return rejectWithValue({ message: e.message || 'Unexpected error' })
    }
  }
)

// Smart architecture flow for designations
export const fetchDesignationsFlow = createAsyncThunk(
  'designations/fetchFlow',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState()
      const base = buildBasePath(state)
      if (!base) return rejectWithValue({ message: 'Missing company context' })
      const endpoint = `${base}/designations/architecture-flow`
      const res = await httpGetService(endpoint)
      if (res.status >= 200 && res.status < 300) {
        return res.data?.data || res.data
      }
      return rejectWithValue(res.data || { message: 'Failed to load designation flow' })
    } catch (e) {
      return rejectWithValue({ message: e.message || 'Unexpected error' })
    }
  }
)

const initialState = {
  items: [],
  loadingList: 'idle',
  creating: 'idle',
  createError: null,
  listError: null,
  lastCreated: null,
  version: nanoid(6),
  flow: null,
  loadingFlow: 'idle',
  flowError: null,
}

const designationSlice = createSlice({
  name: 'designations',
  initialState,
  reducers: {
    resetDesignationState(state) {
      state.creating = 'idle'
      state.createError = null
      state.lastCreated = null
    }
  },
  extraReducers: builder => {
    builder
      .addCase(createDesignation.pending, (state) => {
        state.creating = 'loading'
        state.createError = null
      })
      .addCase(createDesignation.fulfilled, (state, action) => {
        state.creating = 'succeeded'
        const designation = action.payload
        state.lastCreated = designation || null
        if (designation && designation.id && !state.items.find(d => d.id === designation.id)) {
          state.items.push(designation)
        }
      })
      .addCase(createDesignation.rejected, (state, action) => {
        state.creating = 'failed'
        state.createError = action.payload?.message || 'Create failed'
      })
      .addCase(fetchDesignations.pending, (state) => {
        state.loadingList = 'loading'
        state.listError = null
      })
      .addCase(fetchDesignations.fulfilled, (state, action) => {
        state.loadingList = 'succeeded'
        state.items = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(fetchDesignations.rejected, (state, action) => {
        state.loadingList = 'failed'
        state.listError = action.payload?.message || 'Load failed'
      })
      // Flow reducers
      .addCase(fetchDesignationsFlow.pending, (state) => {
        state.loadingFlow = 'loading'
        state.flowError = null
      })
      .addCase(fetchDesignationsFlow.fulfilled, (state, action) => {
        state.loadingFlow = 'succeeded'
        state.flow = action.payload || null
      })
      .addCase(fetchDesignationsFlow.rejected, (state, action) => {
        state.loadingFlow = 'failed'
        state.flowError = action.payload?.message || 'Load flow failed'
      })
  }
})

export const { resetDesignationState } = designationSlice.actions

// Selectors
export const selectDesignations = s => s.designations.items
export const selectDesignationCreating = s => s.designations.creating
export const selectDesignationCreateError = s => s.designations.createError
export const selectLastCreatedDesignation = s => s.designations.lastCreated
export const selectDesignationsListLoading = s => s.designations.loadingList
export const selectDesignationsListError = s => s.designations.listError
export const selectDesignationsFlow = s => s.designations.flow
export const selectDesignationsFlowLoading = s => s.designations.loadingFlow
export const selectDesignationsFlowError = s => s.designations.flowError

export default designationSlice.reducer