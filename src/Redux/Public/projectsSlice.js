import { createSlice, createAsyncThunk, nanoid } from '@reduxjs/toolkit'
import { httpPostService, httpGetService, httpDeleteService } from '../../config/httphandler'
import { selectAuthUser, selectAuthCompany } from './authSlice'

// payload: { name, code, description, startDate, endDate, visibility, status }
// meta: { roleContext: 'ADMIN' | 'USER' }
export const createProject = createAsyncThunk('projects/create', async (payload, { getState, rejectWithValue }) => {
  try {
    const state = getState()
    const user = selectAuthUser(state)
    const company = selectAuthCompany(state)
    if (!company?.id) return rejectWithValue({ message: 'Missing company context' })
    const isAdmin = user?.role === 'ADMIN'
    const endpoint = isAdmin
      ? `${company.id}/project`
      : `${company.id}/auth/${user.id}/project`
    const res = await httpPostService(endpoint, payload)
    if (res.status >= 200 && res.status < 300) {
      return res.data?.data || res.data
    }
    return rejectWithValue(res.data || { message: 'Failed to create project' })
  } catch (e) {
    return rejectWithValue({ message: e.message || 'Unexpected error' })
  }
})

// Helper to build endpoint by context
function buildBasePath(state, includeAuthUser = false) {
  const user = selectAuthUser(state)
  const company = selectAuthCompany(state)
  if (!company?.id) return null
  const isAdmin = user?.role === 'ADMIN'
  if (isAdmin) return company.id
  if (includeAuthUser) return `${company.id}/auth/${user?.id}`
  return company.id
}

export const fetchProjects = createAsyncThunk('projects/fetchList', async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState()
    const user = selectAuthUser(state)
    const base = buildBasePath(state, true)
    if (!base) return rejectWithValue({ message: 'Missing company context' })
    const isAdmin = user?.role === 'ADMIN'
    const endpoint = isAdmin ? `${base}/projects` : `${base}/projects`
    const res = await httpGetService(endpoint)
    if (res.status >= 200 && res.status < 300) return res.data?.data || res.data
    return rejectWithValue(res.data || { message: 'Failed to load projects' })
  } catch (e) {
    return rejectWithValue({ message: e.message || 'Unexpected error' })
  }
})

export const fetchProjectById = createAsyncThunk('projects/fetchOne', async (projectId, { getState, rejectWithValue }) => {
  try {
    const state = getState()
    const user = selectAuthUser(state)
    const company = selectAuthCompany(state)
    if (!company?.id) return rejectWithValue({ message: 'Missing company context' })
    const isAdmin = user?.role === 'ADMIN'
    const endpoint = isAdmin
      ? `${company.id}/project/${projectId}`
      : `${company.id}/auth/${user.id}/project/${projectId}`
    const res = await httpGetService(endpoint)
    if (res.status >= 200 && res.status < 300) return res.data?.data || res.data
    return rejectWithValue(res.data || { message: 'Failed to load project' })
  } catch (e) {
    return rejectWithValue({ message: e.message || 'Unexpected error' })
  }
})

export const deleteProject = createAsyncThunk('projects/deleteOne', async (projectId, { getState, rejectWithValue }) => {
  try {
    const state = getState()
    const user = selectAuthUser(state)
    const company = selectAuthCompany(state)
    if (!company?.id) return rejectWithValue({ message: 'Missing company context' })
    const isAdmin = user?.role === 'ADMIN'
    const endpoint = isAdmin
      ? `${company.id}/project/${projectId}`
      : `${company.id}/auth/${user.id}/project/${projectId}`
    const res = await httpDeleteService(endpoint)
    if (res.status >= 200 && res.status < 300) return { id: projectId }
    return rejectWithValue(res.data || { message: 'Failed to delete project' })
  } catch (e) {
    return rejectWithValue({ message: e.message || 'Unexpected error' })
  }
})

export const deleteProjectsBulk = createAsyncThunk('projects/deleteBulk', async (ids, { getState, rejectWithValue }) => {
  try {
    const state = getState()
    const user = selectAuthUser(state)
    const company = selectAuthCompany(state)
    if (!company?.id) return rejectWithValue({ message: 'Missing company context' })
    const isAdmin = user?.role === 'ADMIN'
    const path = isAdmin ? `${company.id}/projects` : `${company.id}/auth/${user.id}/projects`
    const res = await httpDeleteService(path + '?' + new URLSearchParams({ ids: ids.join(',') }))
    if (res.status >= 200 && res.status < 300) return { ids }
    return rejectWithValue(res.data || { message: 'Failed to delete projects' })
  } catch (e) {
    return rejectWithValue({ message: e.message || 'Unexpected error' })
  }
})

// Insights endpoint (aggregate portfolio statistics)
export const fetchProjectsInsights = createAsyncThunk('projects/fetchInsights', async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState()
    const user = selectAuthUser(state)
    const company = selectAuthCompany(state)
    if (!company?.id) return rejectWithValue({ message: 'Missing company context' })
    const isAdmin = user?.role === 'ADMIN'
    const endpoint = isAdmin
      ? `${company.id}/projects/insights`
      : `${company.id}/auth/${user.id}/projects/insights`
    const res = await httpGetService(endpoint)
    if (res.status >= 200 && res.status < 300) return res.data?.data || res.data
    return rejectWithValue(res.data || { message: 'Failed to load insights' })
  } catch (e) {
    return rejectWithValue({ message: e.message || 'Unexpected error' })
  }
})

const initialState = {
  items: [], // flat list of project summaries (minimal)
  pagination: null, // { page, limit, total, pages }
  itemsLoaded: false,
  loadingList: 'idle', // idle | loading | succeeded | failed
  loadingOne: 'idle',
  deleting: 'idle',
  insightsLoading: 'idle',
  createError: null,
  listError: null,
  detailError: null,
  deleteError: null,
  insightsError: null,
  insights: null, // aggregate stats
  creating: 'idle', // create status
  lastCreated: null, // convenience direct project object
  lastCreatedFull: null, // full payload: { project, folders, mode, ... }
  version: nanoid(6)
}

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    resetProjectState(state) {
      state.creating = 'idle'
      state.createError = null
      state.lastCreated = null
      state.lastCreatedFull = null
    },
    setLastCreatedFull(state, action) {
      const full = action.payload || null
      state.lastCreatedFull = full
      state.lastCreated = full?.project || null
      if (full?.project && !state.items.find(p => p.id === full.project.id)) {
        state.items.push(full.project)
      }
    }
  },
  extraReducers: builder => {
    builder
      .addCase(createProject.pending, (state) => {
        state.creating = 'loading'
        state.createError = null
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.creating = 'succeeded'
        // action.payload might be either { project, folders, mode } or plain project
        const payload = action.payload
        const project = payload?.project || payload
        state.lastCreatedFull = payload?.project ? payload : { project }
        state.lastCreated = project || null
        if (project && project.id && !state.items.find(p => p.id === project.id)) {
          state.items.push(project)
        }
      })
      .addCase(createProject.rejected, (state, action) => {
        state.creating = 'failed'
        state.createError = action.payload?.message || 'Create failed'
      })
      // Fetch list
      .addCase(fetchProjects.pending, (state) => {
        state.loadingList = 'loading'
        state.listError = null
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loadingList = 'succeeded'
        // API shape now: { pagination, items } inside action.payload OR nested under data
        const payload = action.payload || {}
        const pag = payload.pagination || null
        const list = payload.items || payload.projects || payload || []
        state.items = Array.isArray(list) ? list : Array.isArray(list?.items) ? list.items : []
        state.pagination = pag
        state.itemsLoaded = true
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loadingList = 'failed'
        state.listError = action.payload?.message || 'Load failed'
      })
      // Fetch one
      .addCase(fetchProjectById.pending, (state) => {
        state.loadingOne = 'loading'
        state.detailError = null
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.loadingOne = 'succeeded'
        const proj = action.payload?.project || action.payload
        if (proj && proj.id) {
          const idx = state.items.findIndex(p => p.id === proj.id)
          if (idx >= 0) state.items[idx] = { ...state.items[idx], ...proj }
          else state.items.push(proj)
        }
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.loadingOne = 'failed'
        state.detailError = action.payload?.message || 'Load failed'
      })
      // Delete single
      .addCase(deleteProject.pending, (state) => {
        state.deleting = 'loading'
        state.deleteError = null
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.deleting = 'succeeded'
        const id = action.payload?.id
        if (id) state.items = state.items.filter(p => p.id !== id)
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.deleting = 'failed'
        state.deleteError = action.payload?.message || 'Delete failed'
      })
      // Delete bulk
      .addCase(deleteProjectsBulk.pending, (state) => {
        state.deleting = 'loading'
        state.deleteError = null
      })
      .addCase(deleteProjectsBulk.fulfilled, (state, action) => {
        state.deleting = 'succeeded'
        const ids = action.payload?.ids || []
        if (ids.length) state.items = state.items.filter(p => !ids.includes(p.id))
      })
      .addCase(deleteProjectsBulk.rejected, (state, action) => {
        state.deleting = 'failed'
        state.deleteError = action.payload?.message || 'Bulk delete failed'
      })
      // Insights
      .addCase(fetchProjectsInsights.pending, (state) => {
        state.insightsLoading = 'loading'
        state.insightsError = null
      })
      .addCase(fetchProjectsInsights.fulfilled, (state, action) => {
        state.insightsLoading = 'succeeded'
        state.insights = action.payload || null
      })
      .addCase(fetchProjectsInsights.rejected, (state, action) => {
        state.insightsLoading = 'failed'
        state.insightsError = action.payload?.message || 'Insights load failed'
      })
  }
})

export const { resetProjectState, setLastCreatedFull } = projectsSlice.actions

// selectors
export const selectProjectsState = (s) => s.projects
export const selectProjectCreating = (s) => s.projects.creating
export const selectProjectCreateError = (s) => s.projects.createError
export const selectProjects = (s) => s.projects.items
export const selectProjectsPagination = (s) => s.projects.pagination
export const selectLastCreatedProject = (s) => s.projects.lastCreated
export const selectLastCreatedFull = (s) => s.projects.lastCreatedFull
export const selectProjectsListLoading = (s) => s.projects.loadingList
export const selectProjectsListError = (s) => s.projects.listError
export const selectProjectDetailLoading = (s) => s.projects.loadingOne
export const selectProjectDetailError = (s) => s.projects.detailError
export const selectProjectDeleting = (s) => s.projects.deleting
export const selectProjectDeleteError = (s) => s.projects.deleteError
export const selectProjectsInsights = (s) => s.projects.insights
export const selectProjectsInsightsLoading = (s) => s.projects.insightsLoading
export const selectProjectsInsightsError = (s) => s.projects.insightsError

export default projectsSlice.reducer
