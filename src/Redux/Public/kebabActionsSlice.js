import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { httpGetService, httpPostService } from '../../config/httphandler'
import { selectAuthUser, selectAuthCompany } from './authSlice'

/**
 * Kebab Actions Redux Slice
 * Manages state for folder-level operations (add_subfolder, rename, delete, move, etc.)
 * 
 * Follows dual-endpoint pattern:
 * - ADMIN: :companyId/projects/:projectId/kebab-action/:folderId (full access)
 * - USER: :companyId/auth/:userId/projects/:projectId/kebab-action/:folderId (permission-validated)
 */

/**
 * Build endpoint paths based on user role
 * Returns both admin and user endpoints, and determined isAdmin flag
 */
function buildEndpointPaths(state, { projectId, folderId }) {
  const user = selectAuthUser(state)
  const company = selectAuthCompany(state)
  
  if (!company?.id) {
    throw new Error('Company ID not found in session')
  }
  
  if (!projectId) {
    throw new Error('Project ID is required')
  }
  
  if (!folderId) {
    throw new Error('Folder ID is required')
  }
  
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'IT'
  const companyId = company.id
  const userId = user?.id
  
  const adminEndpoint = `${companyId}/projects/${projectId}/kebab-action/${folderId}`
  const userEndpoint = `${companyId}/auth/${userId}/projects/${projectId}/kebab-action/${folderId}`
  
  return {
    endpoint: isAdmin ? adminEndpoint : userEndpoint,
    isAdmin,
    companyId,
    userId
  }
}

// Async thunk for executing single kebab action
export const executeKebabAction = createAsyncThunk(
  'kebabActions/executeAction',
  async ({ action, projectId, folderId, payload }, { rejectWithValue, getState }) => {
    try {
      // Detailed validation
      if (!projectId) {
        return rejectWithValue('Project ID is required')
      }
      if (!folderId) {
        return rejectWithValue('Folder ID is required')
      }
      if (!action) {
        return rejectWithValue('Action type is required')
      }

      const state = getState()
      const { endpoint, isAdmin } = buildEndpointPaths(state, { projectId, folderId })

      console.log('Executing kebab action:', { action, isAdmin, endpoint, payload })

      const response = await httpPostService(
        `${endpoint}/action`,
        { action, payload },
        { withCredentials: true }
      )

      if (response.status >= 200 && response.status < 300) {
        return response.data
      }
      return rejectWithValue(response.data?.message || 'Action failed')
    } catch (error) {
      console.error('Kebab action error:', error)
      return rejectWithValue(error.message || 'Failed to execute action')
    }
  }
)

// Async thunk for getting action details/metadata
export const getActionDetails = createAsyncThunk(
  'kebabActions/getDetails',
  async ({ action, projectId, folderId }, { rejectWithValue, getState }) => {
    try {
      if (!projectId) {
        return rejectWithValue('Project ID is required')
      }
      if (!folderId) {
        return rejectWithValue('Folder ID is required')
      }
      if (!action) {
        return rejectWithValue('Action parameter is required')
      }

      const state = getState()
      const { endpoint, isAdmin } = buildEndpointPaths(state, { projectId, folderId })

      console.log('Getting action details:', { action, isAdmin, endpoint })

      const response = await httpGetService(
        `${endpoint}/action-details?action=${action}`,
        { withCredentials: true }
      )

      if (response.status >= 200 && response.status < 300) {
        return response.data
      }
      return rejectWithValue(response.data?.message || 'Failed to get details')
    } catch (error) {
      console.error('Get action details error:', error)
      return rejectWithValue(error.message || 'Failed to get action details')
    }
  }
)

// Async thunk for bulk operations
export const bulkExecuteKebabActions = createAsyncThunk(
  'kebabActions/bulkExecute',
  async ({ action, projectId, folderIds, payload }, { rejectWithValue, getState }) => {
    try {
      if (!projectId) {
        return rejectWithValue('Project ID is required')
      }
      if (!folderIds || folderIds.length === 0) {
        return rejectWithValue('At least one folder ID is required')
      }

      const state = getState()
      const user = selectAuthUser(state)
      const company = selectAuthCompany(state)
      
      if (!company?.id) {
        return rejectWithValue('Company ID not found')
      }

      const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'IT'
      const companyId = company.id
      const userId = user?.id

      const endpoint = isAdmin
        ? `${companyId}/projects/${projectId}/kebab-action/bulk/execute`
        : `${companyId}/auth/${userId}/projects/${projectId}/kebab-action/bulk/execute-user`

      console.log('Bulk executing kebab actions:', { action, folderIds, isAdmin, endpoint })

      const response = await httpPostService(
        endpoint,
        { action, folderIds, payload },
        { withCredentials: true }
      )

      if (response.status >= 200 && response.status < 300) {
        return response.data
      }
      return rejectWithValue(response.data?.message || 'Bulk action failed')
    } catch (error) {
      console.error('Bulk action error:', error)
      return rejectWithValue(error.message || 'Bulk action failed')
    }
  }
)

const initialState = {
  loading: 'idle', // idle | loading | succeeded | failed
  error: null,
  detailsLoading: 'idle',
  detailsError: null,
  details: null,
  bulkLoading: 'idle',
  bulkError: null,
  lastAction: null,
  lastActionResult: null,
  history: [] // Track recent actions for undo/redo
}

const kebabActionsSlice = createSlice({
  name: 'kebabActions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearDetailsError: (state) => {
      state.detailsError = null
    },
    clearBulkError: (state) => {
      state.bulkError = null
    },
    resetState: () => initialState,
    recordAction: (state, action) => {
      state.history.push({
        action: action.payload.action,
        folder: action.payload.folder,
        timestamp: new Date().toISOString(),
        result: action.payload.result
      })
      // Keep history limit to 50 items
      if (state.history.length > 50) {
        state.history.shift()
      }
    }
  },
  extraReducers: (builder) => {
    // Execute kebab action
    builder
      .addCase(executeKebabAction.pending, (state) => {
        state.loading = 'loading'
        state.error = null
      })
      .addCase(executeKebabAction.fulfilled, (state, action) => {
        state.loading = 'succeeded'
        state.lastAction = action.meta.arg.action
        state.lastActionResult = action.payload
        state.error = null
      })
      .addCase(executeKebabAction.rejected, (state, action) => {
        state.loading = 'failed'
        state.error = action.payload
      })

    // Get action details
    builder
      .addCase(getActionDetails.pending, (state) => {
        state.detailsLoading = 'loading'
        state.detailsError = null
      })
      .addCase(getActionDetails.fulfilled, (state, action) => {
        state.detailsLoading = 'succeeded'
        state.details = action.payload
        state.detailsError = null
      })
      .addCase(getActionDetails.rejected, (state, action) => {
        state.detailsLoading = 'failed'
        state.detailsError = action.payload
      })

    // Bulk execute actions
    builder
      .addCase(bulkExecuteKebabActions.pending, (state) => {
        state.bulkLoading = 'loading'
        state.bulkError = null
      })
      .addCase(bulkExecuteKebabActions.fulfilled, (state, action) => {
        state.bulkLoading = 'succeeded'
        state.lastActionResult = action.payload
        state.bulkError = null
      })
      .addCase(bulkExecuteKebabActions.rejected, (state, action) => {
        state.bulkLoading = 'failed'
        state.bulkError = action.payload
      })
  }
})

export const {
  clearError,
  clearDetailsError,
  clearBulkError,
  resetState,
  recordAction
} = kebabActionsSlice.actions

// Selectors
export const selectKebabLoading = (state) => state.kebabActions?.loading || 'idle'
export const selectKebabError = (state) => state.kebabActions?.error
export const selectDetailsLoading = (state) => state.kebabActions?.detailsLoading || 'idle'
export const selectDetailsError = (state) => state.kebabActions?.detailsError
export const selectDetails = (state) => state.kebabActions?.details

/**
 * Extract metadata from action details response
 * API returns: { success, action, folderId, metadata: {...} }
 * This selector extracts the actual folder details from metadata field
 */
export const selectDetailMetadata = (state) => {
  const details = state.kebabActions?.details
  // If metadata field exists, return it; otherwise return the whole details object
  // This handles both new API format and any legacy responses
  return details?.metadata || details
}

export const selectBulkLoading = (state) => state.kebabActions?.bulkLoading || 'idle'
export const selectBulkError = (state) => state.kebabActions?.bulkError
export const selectLastAction = (state) => state.kebabActions?.lastAction
export const selectLastActionResult = (state) => state.kebabActions?.lastActionResult
export const selectHistory = (state) => state.kebabActions?.history || []

export default kebabActionsSlice.reducer
