import { createSlice, createAsyncThunk, nanoid } from '@reduxjs/toolkit'
import { httpGetService, httpPostFormService } from '../../config/httphandler'
import { selectAuthUser, selectAuthCompany } from './authSlice'

function buildPaths(state) {
  const user = selectAuthUser(state)
  const company = selectAuthCompany(state)
  if (!company?.id) return { base: null, isAdmin: false, userId: null }
  const isAdmin = user?.role === 'ADMIN'
  const userId = user?.id || null
  return { base: company.id, isAdmin, userId }
}

export const fetchProjectFolderTree = createAsyncThunk('folders/fetchTree', async (projectId, { getState, rejectWithValue }) => {
  try {
    const state = getState()
    const { base, isAdmin, userId } = buildPaths(state)
    if (!base) return rejectWithValue({ message: 'Missing company context' })
    if (!projectId) return rejectWithValue({ message: 'Missing project id' })
    const endpoint = isAdmin
      ? `${base}/project/${projectId}/folders/tree`
      : `${base}/auth/${userId}/projects/${projectId}/folders/tree`
    const res = await httpGetService(endpoint)
    if (res.status >= 200 && res.status < 300) return { projectId, data: res.data?.data || res.data }
    return rejectWithValue(res.data || { message: 'Failed to load folder tree' })
  } catch (e) {
    return rejectWithValue({ message: e.message || 'Unexpected error' })
  }
})

export const fetchFolderContent = createAsyncThunk('folders/fetchContent', async ({ projectId, folderUrn }, { getState, rejectWithValue }) => {
  try {
    const state = getState()
    const { base, isAdmin, userId } = buildPaths(state)
    if (!base) return rejectWithValue({ message: 'Missing company context' })
    if (!projectId) return rejectWithValue({ message: 'Missing project id' })
    const urnEnc = folderUrn ? encodeURIComponent(folderUrn) : ''
    const endpoint = isAdmin
      ? `${base}/projects/${projectId}/folders/${urnEnc}`
      : `${base}/auth/${userId}/projects/${projectId}/folders/${urnEnc}`
    const res = await httpGetService(endpoint)
    if (res.status >= 200 && res.status < 300) return { projectId, folderUrn, data: res.data?.data || res.data }
    return rejectWithValue(res.data || { message: 'Failed to load folder content' })
  } catch (e) {
    return rejectWithValue({ message: e.message || 'Unexpected error' })
  }
})

const initialState = {
  trees: {}, // projectId -> { loading, error, data }
  contents: {}, // `${projectId}::${urn}` -> { loading, error, data }
  documents: {}, // `${projectId}::${urn}` -> { loading, error, items }
  version: nanoid(6)
}

const foldersSlice = createSlice({
  name: 'folders',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchProjectFolderTree.pending, (state, action) => {
        const projectId = action.meta.arg
        state.trees[projectId] = { ...(state.trees[projectId] || {}), loading: 'loading', error: null }
      })
      .addCase(fetchProjectFolderTree.fulfilled, (state, action) => {
        const { projectId, data } = action.payload
        state.trees[projectId] = { loading: 'succeeded', error: null, data }
      })
      .addCase(fetchProjectFolderTree.rejected, (state, action) => {
        const projectId = action.meta.arg
        state.trees[projectId] = { loading: 'failed', error: action.payload?.message || 'Load failed', data: null }
      })

      .addCase(fetchFolderContent.pending, (state, action) => {
        const { projectId, folderUrn } = action.meta.arg
        const key = `${projectId}::${folderUrn || ''}`
        state.contents[key] = { ...(state.contents[key] || {}), loading: 'loading', error: null }
      })
      .addCase(fetchFolderContent.fulfilled, (state, action) => {
        const { projectId, folderUrn, data } = action.payload
        const key = `${projectId}::${folderUrn || ''}`
        state.contents[key] = { loading: 'succeeded', error: null, data }
      })
      .addCase(fetchFolderContent.rejected, (state, action) => {
        const { projectId, folderUrn } = action.meta.arg
        const key = `${projectId}::${folderUrn || ''}`
        state.contents[key] = { loading: 'failed', error: action.payload?.message || 'Load failed', data: null }
      })

      // Documents list
      .addCase(fetchFolderDocuments.pending, (state, action) => {
        const { projectId, folderUrn } = action.meta.arg
        const key = `${projectId}::${folderUrn || ''}`
        state.documents[key] = { ...(state.documents[key] || {}), loading: 'loading', error: null }
      })
      .addCase(fetchFolderDocuments.fulfilled, (state, action) => {
        const { projectId, folderUrn, items } = action.payload
        const key = `${projectId}::${folderUrn || ''}`
        state.documents[key] = { loading: 'succeeded', error: null, items }
      })
      .addCase(fetchFolderDocuments.rejected, (state, action) => {
        const { projectId, folderUrn } = action.meta.arg
        const key = `${projectId}::${folderUrn || ''}`
        state.documents[key] = { loading: 'failed', error: action.payload?.message || 'Load failed', items: [] }
      })

      // Upload documents
      .addCase(uploadFolderDocuments.pending, (state, action) => {
        const { projectId, folderUrn } = action.meta.arg
        const key = `${projectId}::${folderUrn || ''}`
        state.documents[key] = { ...(state.documents[key] || {}), uploading: true, uploadError: null }
      })
      .addCase(uploadFolderDocuments.fulfilled, (state, action) => {
        const { projectId, folderUrn, items } = action.payload
        const key = `${projectId}::${folderUrn || ''}`
        const prev = state.documents[key]?.items || []
        // merge: append new items (server may return full list or created items)
        state.documents[key] = { ...(state.documents[key] || {}), uploading: false, uploadError: null, items: items?.length ? items : prev }
      })
      .addCase(uploadFolderDocuments.rejected, (state, action) => {
        const { projectId, folderUrn } = action.meta.arg
        const key = `${projectId}::${folderUrn || ''}`
        state.documents[key] = { ...(state.documents[key] || {}), uploading: false, uploadError: action.payload?.message || 'Upload failed' }
      })
  }
})

// selectors
export const selectFolderTrees = s => s.folders.trees
export const selectFolderContents = s => s.folders.contents
export const selectFolderDocuments = s => s.folders.documents

export default foldersSlice.reducer

// Thunks for folder documents
export const fetchFolderDocuments = createAsyncThunk('folders/fetchDocuments', async ({ projectId, folderUrn }, { getState, rejectWithValue }) => {
  try {
    const state = getState()
    const { base, isAdmin, userId } = buildPaths(state)
    if (!base) return rejectWithValue({ message: 'Missing company context' })
    if (!projectId || !folderUrn) return rejectWithValue({ message: 'Missing project/folder id' })
    const endpoint = isAdmin
      ? `${base}/projects/${projectId}/folders/${encodeURIComponent(folderUrn)}/documents`
      : `${base}/auth/${userId}/projects/${projectId}/folders/${encodeURIComponent(folderUrn)}/documents`
    const res = await httpGetService(endpoint)
    if (res.status >= 200 && res.status < 300) {
      const payload = res.data?.data || res.data
      const items = Array.isArray(payload?.items) ? payload.items : (Array.isArray(payload) ? payload : [])
      return { projectId, folderUrn, items }
    }
    return rejectWithValue(res.data || { message: 'Failed to load documents' })
  } catch (e) {
    return rejectWithValue({ message: e.message || 'Unexpected error' })
  }
})

export const uploadFolderDocuments = createAsyncThunk('folders/uploadDocuments', async ({ projectId, folderUrn, files }, { getState, rejectWithValue }) => {
  try {
    const state = getState()
    const { base, isAdmin, userId } = buildPaths(state)
    if (!base) return rejectWithValue({ message: 'Missing company context' })
    if (!projectId || !folderUrn) return rejectWithValue({ message: 'Missing project/folder id' })
    if (!files || files.length === 0) return rejectWithValue({ message: 'No files selected' })
    const form = new FormData()
    for (const f of files) form.append('documents', f)
    const endpoint = isAdmin
      ? `${base}/projects/${projectId}/folders/${encodeURIComponent(folderUrn)}/documents`
      : `${base}/auth/${userId}/projects/${projectId}/folders/${encodeURIComponent(folderUrn)}/documents`
    const res = await httpPostFormService(endpoint, form)
    if (res.status >= 200 && res.status < 300) {
      const payload = res.data?.data || res.data
      const items = Array.isArray(payload?.items) ? payload.items : (Array.isArray(payload) ? payload : [])
      return { projectId, folderUrn, items }
    }
    return rejectWithValue(res.data || { message: 'Upload failed' })
  } catch (e) {
    return rejectWithValue({ message: e.message || 'Unexpected error' })
  }
})
