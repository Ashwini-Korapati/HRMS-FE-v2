// import { createSlice, createAsyncThunk, nanoid } from '@reduxjs/toolkit'
// import { httpPostService, httpGetService, httpDeleteService } from '../../config/httphandler'
// import { selectAuthUser, selectAuthCompany } from './authSlice'

// // payload: { name, code, description, startDate, endDate, visibility, status }
// // meta: { roleContext: 'ADMIN' | 'USER' }
// export const createProject = createAsyncThunk('projects/create', async (payload, { getState, rejectWithValue }) => {
//   try {
//     const state = getState()
//     const user = selectAuthUser(state)
//     const company = selectAuthCompany(state)
//     if (!company?.id) return rejectWithValue({ message: 'Missing company context' })
//     const isAdmin = user?.role === 'ADMIN'
//     const endpoint = isAdmin
//       ? `${company.id}/project`
//       : `${company.id}/auth/${user.id}/project`
//     const res = await httpPostService(endpoint, payload)
//     if (res.status >= 200 && res.status < 300) {
//       return res.data?.data || res.data
//     }
//     return rejectWithValue(res.data || { message: 'Failed to create project' })
//   } catch (e) {
//     return rejectWithValue({ message: e.message || 'Unexpected error' })
//   }
// })

// // Helper to build endpoint by context
// function buildBasePath(state, includeAuthUser = false) {
//   const user = selectAuthUser(state)
//   const company = selectAuthCompany(state)
//   if (!company?.id) return null
//   const isAdmin = user?.role === 'ADMIN'
//   if (isAdmin) return company.id
//   if (includeAuthUser) return `${company.id}/auth/${user?.id}`
//   return company.id
// }

// export const fetchProjects = createAsyncThunk('projects/fetchList', async (_, { getState, rejectWithValue }) => {
//   try {
//     const state = getState()
//     const user = selectAuthUser(state)
//     const base = buildBasePath(state, true)
//     if (!base) return rejectWithValue({ message: 'Missing company context' })
//     const isAdmin = user?.role === 'ADMIN'
//     const endpoint = isAdmin ? `${base}/projects` : `${base}/projects`
//     const res = await httpGetService(endpoint)
//     if (res.status >= 200 && res.status < 300) return res.data?.data || res.data
//     return rejectWithValue(res.data || { message: 'Failed to load projects' })
//   } catch (e) {
//     return rejectWithValue({ message: e.message || 'Unexpected error' })
//   }
// })

// export const fetchProjectById = createAsyncThunk('projects/fetchOne', async (projectId, { getState, rejectWithValue }) => {
//   try {
//     const state = getState()
//     const user = selectAuthUser(state)
//     const company = selectAuthCompany(state)
//     if (!company?.id) return rejectWithValue({ message: 'Missing company context' })
//     const isAdmin = user?.role === 'ADMIN'
//     const endpoint = isAdmin
//       ? `${company.id}/project/${projectId}`
//       : `${company.id}/auth/${user.id}/project/${projectId}`
//     const res = await httpGetService(endpoint)
//     if (res.status >= 200 && res.status < 300) return res.data?.data || res.data
//     return rejectWithValue(res.data || { message: 'Failed to load project' })
//   } catch (e) {
//     return rejectWithValue({ message: e.message || 'Unexpected error' })
//   }
// })

// export const deleteProject = createAsyncThunk('projects/deleteOne', async (projectId, { getState, rejectWithValue }) => {
//   try {
//     const state = getState()
//     const user = selectAuthUser(state)
//     const company = selectAuthCompany(state)
//     if (!company?.id) return rejectWithValue({ message: 'Missing company context' })
//     const isAdmin = user?.role === 'ADMIN'
//     const endpoint = isAdmin
//       ? `${company.id}/project/${projectId}`
//       : `${company.id}/auth/${user.id}/project/${projectId}`
//     const res = await httpDeleteService(endpoint)
//     if (res.status >= 200 && res.status < 300) return { id: projectId }
//     return rejectWithValue(res.data || { message: 'Failed to delete project' })
//   } catch (e) {
//     return rejectWithValue({ message: e.message || 'Unexpected error' })
//   }
// })

// export const deleteProjectsBulk = createAsyncThunk('projects/deleteBulk', async (ids, { getState, rejectWithValue }) => {
//   try {
//     const state = getState()
//     const user = selectAuthUser(state)
//     const company = selectAuthCompany(state)
//     if (!company?.id) return rejectWithValue({ message: 'Missing company context' })
//     const isAdmin = user?.role === 'ADMIN'
//     const path = isAdmin ? `${company.id}/projects` : `${company.id}/auth/${user.id}/projects`
//     const res = await httpDeleteService(path + '?' + new URLSearchParams({ ids: ids.join(',') }))
//     if (res.status >= 200 && res.status < 300) return { ids }
//     return rejectWithValue(res.data || { message: 'Failed to delete projects' })
//   } catch (e) {
//     return rejectWithValue({ message: e.message || 'Unexpected error' })
//   }
// })

// // Insights endpoint (aggregate portfolio statistics)
// export const fetchProjectsInsights = createAsyncThunk('projects/fetchInsights', async (_, { getState, rejectWithValue }) => {
//   try {
//     const state = getState()
//     const user = selectAuthUser(state)
//     const company = selectAuthCompany(state)
//     if (!company?.id) return rejectWithValue({ message: 'Missing company context' })
//     const isAdmin = user?.role === 'ADMIN'
//     const endpoint = isAdmin
//       ? `${company.id}/projects/insights`
//       : `${company.id}/auth/${user.id}/projects/insights`
//     const res = await httpGetService(endpoint)
//     if (res.status >= 200 && res.status < 300) return res.data?.data || res.data
//     return rejectWithValue(res.data || { message: 'Failed to load insights' })
//   } catch (e) {
//     return rejectWithValue({ message: e.message || 'Unexpected error' })
//   }
// })

// const initialState = {
//   items: [], // flat list of project summaries (minimal)
//   pagination: null, // { page, limit, total, pages }
//   itemsLoaded: false,
//   loadingList: 'idle', // idle | loading | succeeded | failed
//   loadingOne: 'idle',
//   deleting: 'idle',
//   insightsLoading: 'idle',
//   createError: null,
//   listError: null,
//   detailError: null,
//   deleteError: null,
//   insightsError: null,
//   insights: null, // aggregate stats
//   creating: 'idle', // create status
//   lastCreated: null, // convenience direct project object
//   lastCreatedFull: null, // full payload: { project, folders, mode, ... }
//   version: nanoid(6)
// }

// const projectsSlice = createSlice({
//   name: 'projects',
//   initialState,
//   reducers: {
//     resetProjectState(state) {
//       state.creating = 'idle'
//       state.createError = null
//       state.lastCreated = null
//       state.lastCreatedFull = null
//     },
//     setLastCreatedFull(state, action) {
//       const full = action.payload || null
//       state.lastCreatedFull = full
//       state.lastCreated = full?.project || null
//       if (full?.project && !state.items.find(p => p.id === full.project.id)) {
//         state.items.push(full.project)
//       }
//     }
//   },
//   extraReducers: builder => {
//     builder
//       .addCase(createProject.pending, (state) => {
//         state.creating = 'loading'
//         state.createError = null
//       })
//       .addCase(createProject.fulfilled, (state, action) => {
//         state.creating = 'succeeded'
//         // action.payload might be either { project, folders, mode } or plain project
//         const payload = action.payload
//         const project = payload?.project || payload
//         state.lastCreatedFull = payload?.project ? payload : { project }
//         state.lastCreated = project || null
//         if (project && project.id && !state.items.find(p => p.id === project.id)) {
//           state.items.push(project)
//         }
//       })
//       .addCase(createProject.rejected, (state, action) => {
//         state.creating = 'failed'
//         state.createError = action.payload?.message || 'Create failed'
//       })
//       // Fetch list
//       .addCase(fetchProjects.pending, (state) => {
//         state.loadingList = 'loading'
//         state.listError = null
//       })
//       .addCase(fetchProjects.fulfilled, (state, action) => {
//         state.loadingList = 'succeeded'
//         // API shape now: { pagination, items } inside action.payload OR nested under data
//         const payload = action.payload || {}
//         const pag = payload.pagination || null
//         const list = payload.items || payload.projects || payload || []
//         const rawItems = Array.isArray(list) ? list : Array.isArray(list?.items) ? list.items : []
//         // Derive folderCounts when absent using folderTree
//         state.items = rawItems.map(p => {
//           if (!p || p.folderCounts || !Array.isArray(p.folderTree)) return p
//           const roots = p.folderTree.filter(f => !f.parentId)
//           const total = p.folderTree.length
//             // Calculate depth via DFS
//           const childrenMap = new Map()
//           p.folderTree.forEach(f => {
//             if (f.parentId) {
//               if (!childrenMap.has(f.parentId)) childrenMap.set(f.parentId, [])
//               childrenMap.get(f.parentId).push(f)
//             }
//           })
//           let maxDepth = 0
//           function dfs(node, depth){
//             if (depth > maxDepth) maxDepth = depth
//             const kids = childrenMap.get(node.id) || []
//             kids.forEach(k => dfs(k, depth+1))
//           }
//           roots.forEach(r => dfs(r, 1))
//           return {
//             ...p,
//             folderCounts: {
//               total,
//               root: roots.length,
//               subfolders: total - roots.length,
//               depth: maxDepth || (total ? 1 : 0)
//             }
//           }
//         })
//         state.pagination = pag
//         state.itemsLoaded = true
//       })
//       .addCase(fetchProjects.rejected, (state, action) => {
//         state.loadingList = 'failed'
//         state.listError = action.payload?.message || 'Load failed'
//       })
//       // Fetch one
//       .addCase(fetchProjectById.pending, (state) => {
//         state.loadingOne = 'loading'
//         state.detailError = null
//       })
//       .addCase(fetchProjectById.fulfilled, (state, action) => {
//         state.loadingOne = 'succeeded'
//         const proj = action.payload?.project || action.payload
//         if (proj && proj.id) {
//           const idx = state.items.findIndex(p => p.id === proj.id)
//           if (idx >= 0) state.items[idx] = { ...state.items[idx], ...proj }
//           else state.items.push(proj)
//         }
//       })
//       .addCase(fetchProjectById.rejected, (state, action) => {
//         state.loadingOne = 'failed'
//         state.detailError = action.payload?.message || 'Load failed'
//       })
//       // Delete single
//       .addCase(deleteProject.pending, (state) => {
//         state.deleting = 'loading'
//         state.deleteError = null
//       })
//       .addCase(deleteProject.fulfilled, (state, action) => {
//         state.deleting = 'succeeded'
//         const id = action.payload?.id
//         if (id) state.items = state.items.filter(p => p.id !== id)
//       })
//       .addCase(deleteProject.rejected, (state, action) => {
//         state.deleting = 'failed'
//         state.deleteError = action.payload?.message || 'Delete failed'
//       })
//       // Delete bulk
//       .addCase(deleteProjectsBulk.pending, (state) => {
//         state.deleting = 'loading'
//         state.deleteError = null
//       })
//       .addCase(deleteProjectsBulk.fulfilled, (state, action) => {
//         state.deleting = 'succeeded'
//         const ids = action.payload?.ids || []
//         if (ids.length) state.items = state.items.filter(p => !ids.includes(p.id))
//       })
//       .addCase(deleteProjectsBulk.rejected, (state, action) => {
//         state.deleting = 'failed'
//         state.deleteError = action.payload?.message || 'Bulk delete failed'
//       })
//       // Insights
//       .addCase(fetchProjectsInsights.pending, (state) => {
//         state.insightsLoading = 'loading'
//         state.insightsError = null
//       })
//       .addCase(fetchProjectsInsights.fulfilled, (state, action) => {
//         state.insightsLoading = 'succeeded'
//         state.insights = action.payload || null
//       })
//       .addCase(fetchProjectsInsights.rejected, (state, action) => {
//         state.insightsLoading = 'failed'
//         state.insightsError = action.payload?.message || 'Insights load failed'
//       })
//   }
// })

// export const { resetProjectState, setLastCreatedFull } = projectsSlice.actions

// // selectors
// export const selectProjectsState = (s) => s.projects
// export const selectProjectCreating = (s) => s.projects.creating
// export const selectProjectCreateError = (s) => s.projects.createError
// export const selectProjects = (s) => s.projects.items
// export const selectProjectsPagination = (s) => s.projects.pagination
// export const selectLastCreatedProject = (s) => s.projects.lastCreated
// export const selectLastCreatedFull = (s) => s.projects.lastCreatedFull
// export const selectProjectsListLoading = (s) => s.projects.loadingList
// export const selectProjectsListError = (s) => s.projects.listError
// export const selectProjectDetailLoading = (s) => s.projects.loadingOne
// export const selectProjectDetailError = (s) => s.projects.detailError
// export const selectProjectDeleting = (s) => s.projects.deleting
// export const selectProjectDeleteError = (s) => s.projects.deleteError
// export const selectProjectsInsights = (s) => s.projects.insights
// export const selectProjectsInsightsLoading = (s) => s.projects.insightsLoading
// export const selectProjectsInsightsError = (s) => s.projects.insightsError

// export default projectsSlice.reducer



import { createSlice, createAsyncThunk, nanoid } from '@reduxjs/toolkit'
import { httpPostService, httpGetService, httpDeleteService } from '../../config/httphandler'
import { selectAuthUser, selectAuthCompany } from './authSlice'

// Create Project Thunk
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

// Fetch Projects List
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

// Fetch Project by ID
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

// Delete Project
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

// Bulk Delete Projects
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

// Fetch Projects Insights
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

// Fetch Project Members
export const fetchProjectMembers = createAsyncThunk(
  'projects/fetchMembers',
  async (projectId, { getState, rejectWithValue }) => {
    try {
      const state = getState()
      const user = selectAuthUser(state)
      const company = selectAuthCompany(state)
      
      if (!company?.id) return rejectWithValue({ message: 'Missing company context' })
      if (!projectId) return rejectWithValue({ message: 'Project ID required' })

      const endpoint = `${company.id}/auth/${user.id}/projects/${projectId}/members/my-team`
      const res = await httpGetService(endpoint)
      
      if (res.status >= 200 && res.status < 300) {
        return {
          projectId,
          members: res.data?.data?.items || [],
          total: res.data?.data?.total || 0
        }
      }
      return rejectWithValue(res.data || { message: 'Failed to load project members' })
    } catch (e) {
      return rejectWithValue({ message: e.message || 'Unexpected error' })
    }
  }
)

// Set Active Project
export const setActiveProject = createAsyncThunk(
  'projects/setActive',
  async (projectId, { getState, rejectWithValue, dispatch }) => {
    try {
      if (!projectId) return rejectWithValue({ message: 'Project ID required' })
      
      // Fetch project details if not already in store
      const state = getState()
      const existingProject = state.projects.items.find(p => p.id === projectId)
      
      if (!existingProject) {
        await dispatch(fetchProjectById(projectId)).unwrap()
      }
      
      // Fetch project members
      await dispatch(fetchProjectMembers(projectId)).unwrap()
      
      return { projectId }
    } catch (e) {
      return rejectWithValue({ message: e.message || 'Failed to set active project' })
    }
  }
)

const initialState = {
  items: [],
  pagination: null,
  itemsLoaded: false,
  loadingList: 'idle',
  loadingOne: 'idle',
  deleting: 'idle',
  insightsLoading: 'idle',
  membersLoading: 'idle',
  createError: null,
  listError: null,
  detailError: null,
  deleteError: null,
  insightsError: null,
  membersError: null,
  insights: null,
  creating: 'idle',
  lastCreated: null,
  lastCreatedFull: null,
  activeProject: null,
  projectMembers: {},
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
    },
    clearActiveProject(state) {
      state.activeProject = null
    }
  },
  extraReducers: builder => {
    builder
      // Create Project
      .addCase(createProject.pending, (state) => {
        state.creating = 'loading'
        state.createError = null
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.creating = 'succeeded'
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
      
      // Fetch Projects List
      .addCase(fetchProjects.pending, (state) => {
        state.loadingList = 'loading'
        state.listError = null
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loadingList = 'succeeded'
        const payload = action.payload || {}
        const pag = payload.pagination || null
        const list = payload.items || payload.projects || payload || []
        const rawItems = Array.isArray(list) ? list : Array.isArray(list?.items) ? list.items : []
        
        state.items = rawItems.map(p => {
          if (!p || p.folderCounts || !Array.isArray(p.folderTree)) return p
          const roots = p.folderTree.filter(f => !f.parentId)
          const total = p.folderTree.length
          const childrenMap = new Map()
          p.folderTree.forEach(f => {
            if (f.parentId) {
              if (!childrenMap.has(f.parentId)) childrenMap.set(f.parentId, [])
              childrenMap.get(f.parentId).push(f)
            }
          })
          let maxDepth = 0
          function dfs(node, depth){
            if (depth > maxDepth) maxDepth = depth
            const kids = childrenMap.get(node.id) || []
            kids.forEach(k => dfs(k, depth+1))
          }
          roots.forEach(r => dfs(r, 1))
          return {
            ...p,
            folderCounts: {
              total,
              root: roots.length,
              subfolders: total - roots.length,
              depth: maxDepth || (total ? 1 : 0)
            }
          }
        })
        state.pagination = pag
        state.itemsLoaded = true
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loadingList = 'failed'
        state.listError = action.payload?.message || 'Load failed'
      })
      
      // Fetch Project by ID
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
      
      // Delete Project
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
      
      // Bulk Delete Projects
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
      
      // Fetch Projects Insights
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
      
      // Fetch Project Members
      .addCase(fetchProjectMembers.pending, (state) => {
        state.membersLoading = 'loading'
        state.membersError = null
      })
      .addCase(fetchProjectMembers.fulfilled, (state, action) => {
        state.membersLoading = 'succeeded'
        const { projectId, members, total } = action.payload
        state.projectMembers[projectId] = {
          items: members,
          total,
          loaded: true
        }
      })
      .addCase(fetchProjectMembers.rejected, (state, action) => {
        state.membersLoading = 'failed'
        state.membersError = action.payload?.message || 'Failed to load members'
      })
      
      // Set Active Project
      .addCase(setActiveProject.pending, (state) => {
        state.loadingOne = 'loading'
        state.detailError = null
      })
      .addCase(setActiveProject.fulfilled, (state, action) => {
        state.loadingOne = 'succeeded'
        state.activeProject = action.payload.projectId
      })
      .addCase(setActiveProject.rejected, (state, action) => {
        state.loadingOne = 'failed'
        state.detailError = action.payload?.message || 'Failed to set active project'
        state.activeProject = null
      })
  }
})

export const { resetProjectState, setLastCreatedFull, clearActiveProject } = projectsSlice.actions

// Selectors
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
export const selectActiveProject = (s) => {
  const projects = s.projects
  return projects.activeProject ? 
    projects.items.find(p => p.id === projects.activeProject) : null
}
export const selectActiveProjectId = (s) => s.projects.activeProject
export const selectProjectMembers = (projectId) => (s) => 
  s.projects.projectMembers[projectId] || { items: [], total: 0, loaded: false }
export const selectActiveProjectMembers = (s) => {
  const activeId = s.projects.activeProject
  return activeId ? s.projects.projectMembers[activeId] || { items: [], total: 0, loaded: false } : { items: [], total: 0, loaded: false }
}
export const selectProjectMembersLoading = (s) => s.projects.membersLoading
export const selectProjectMembersError = (s) => s.projects.membersError

export default projectsSlice.reducer