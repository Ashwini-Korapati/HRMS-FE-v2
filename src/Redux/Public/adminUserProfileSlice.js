import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { httpGetService, httpPatchService, httpPostService, httpDeleteService, httpPostFormService, httpPutService } from '../../config/httphandler'

const basePath = (companyId, userId) => `${companyId}/admin/users/${userId}/profile`
// USER role own-profile endpoints
const ownProfilePath = (companyId, userId) => `${companyId}/auth/${userId}/profile`

export const fetchAdminUserProfile = createAsyncThunk('adminUserProfile/fetch', async ({ companyId, userId }) => {
  const res = await httpGetService(basePath(companyId, userId))
  if (res.status >= 200 && res.status < 300) return res.data?.data || res.data
  throw new Error(res.data?.message || 'Failed to load profile')
})

export const updateAdminUserProfile = createAsyncThunk('adminUserProfile/update', async ({ companyId, userId, payload }) => {
  const res = await httpPatchService(basePath(companyId, userId), payload)
  if (res.status >= 200 && res.status < 300) return res.data?.data || res.data
  throw new Error(res.data?.message || 'Failed to update profile')
})

// USER: Get own profile
export const fetchOwnProfile = createAsyncThunk('adminUserProfile/fetchOwn', async ({ companyId, userId }) => {
  const res = await httpGetService(ownProfilePath(companyId, userId))
  if (res.status >= 200 && res.status < 300) return res.data?.data || res.data
  throw new Error(res.data?.message || 'Failed to load my profile')
})

// USER: Update own profile (PUT)
export const updateOwnProfile = createAsyncThunk('adminUserProfile/updateOwn', async ({ companyId, userId, payload }) => {
  const res = await httpPutService(ownProfilePath(companyId, userId), payload)
  if (res.status >= 200 && res.status < 300) return res.data?.data || res.data
  throw new Error(res.data?.message || 'Failed to update my profile')
})

// USER: Change own password
export const changeOwnPassword = createAsyncThunk('adminUserProfile/changeOwnPassword', async ({ companyId, userId, currentPassword, newPassword }) => {
  const res = await httpPostService(`${ownProfilePath(companyId, userId)}/password`, { currentPassword, newPassword })
  if (res.status >= 200 && res.status < 300) return true
  throw new Error(res.data?.message || 'Failed to change password')
})

// USER: Avatar upload/delete (own profile)
export const uploadOwnAvatar = createAsyncThunk('adminUserProfile/uploadOwnAvatar', async ({ companyId, userId, file }) => {
  const form = new FormData()
  form.append('avatar', file)
  const res = await httpPostFormService(`${ownProfilePath(companyId, userId)}/avatar`, form)
  if (res.status >= 200 && res.status < 300) return res.data?.data || res.data
  throw new Error(res.data?.message || 'Failed to upload avatar')
})

export const deleteOwnAvatar = createAsyncThunk('adminUserProfile/deleteOwnAvatar', async ({ companyId, userId }) => {
  const res = await httpDeleteService(`${ownProfilePath(companyId, userId)}/avatar`)
  if (res.status >= 200 && res.status < 300) return true
  throw new Error(res.data?.message || 'Failed to delete avatar')
})

// Avatar
export const uploadAdminUserAvatar = createAsyncThunk('adminUserProfile/uploadAvatar', async ({ companyId, userId, file }) => {
  const form = new FormData()
  form.append('avatar', file)
  const res = await httpPostFormService(`${basePath(companyId, userId)}/avatar`, form)
  if (res.status >= 200 && res.status < 300) return res.data?.data || res.data
  throw new Error(res.data?.message || 'Failed to upload avatar')
})

export const deleteAdminUserAvatar = createAsyncThunk('adminUserProfile/deleteAvatar', async ({ companyId, userId }) => {
  const res = await httpDeleteService(`${basePath(companyId, userId)}/avatar`)
  if (res.status >= 200 && res.status < 300) return true
  throw new Error(res.data?.message || 'Failed to delete avatar')
})

// Change password
export const changeAdminUserPassword = createAsyncThunk('adminUserProfile/changePassword', async ({ companyId, userId, currentPassword, newPassword }) => {
  const res = await httpPostService(`${basePath(companyId, userId)}/changePassword`, { currentPassword, newPassword })
  if (res.status >= 200 && res.status < 300) return true
  throw new Error(res.data?.message || 'Failed to change password')
})

// Privacy settings
export const fetchAdminPrivacySettings = createAsyncThunk('adminUserProfile/fetchPrivacy', async ({ companyId, userId }) => {
  const res = await httpGetService(`${basePath(companyId, userId)}/privacy-settings`)
  if (res.status >= 200 && res.status < 300) return res.data?.data || res.data
  throw new Error(res.data?.message || 'Failed to load privacy settings')
})

export const updateAdminPrivacySettings = createAsyncThunk('adminUserProfile/updatePrivacy', async ({ companyId, userId, payload }) => {
  const res = await httpPatchService(`${basePath(companyId, userId)}/privacy-settings`, payload)
  if (res.status >= 200 && res.status < 300) return res.data?.data || res.data
  throw new Error(res.data?.message || 'Failed to update privacy settings')
})

// Notification settings
export const fetchAdminNotificationSettings = createAsyncThunk('adminUserProfile/fetchNotif', async ({ companyId, userId }) => {
  const res = await httpGetService(`${basePath(companyId, userId)}/notifications`)
  if (res.status >= 200 && res.status < 300) return res.data?.data || res.data
  throw new Error(res.data?.message || 'Failed to load notification settings')
})

export const updateAdminNotificationSettings = createAsyncThunk('adminUserProfile/updateNotif', async ({ companyId, userId, payload }) => {
  const res = await httpPatchService(`${basePath(companyId, userId)}/notifications`, payload)
  if (res.status >= 200 && res.status < 300) return res.data?.data || res.data
  throw new Error(res.data?.message || 'Failed to update notification settings')
})

// Documents
export const fetchAdminDocuments = createAsyncThunk('adminUserProfile/fetchDocs', async ({ companyId, userId }) => {
  const res = await httpGetService(`${basePath(companyId, userId)}/documents`)
  if (res.status >= 200 && res.status < 300) return res.data?.data || res.data
  throw new Error(res.data?.message || 'Failed to load documents')
})

export const uploadAdminDocument = createAsyncThunk('adminUserProfile/uploadDoc', async ({ companyId, userId, file, meta }) => {
  const form = new FormData()
  form.append('file', file)
  if (meta) form.append('meta', JSON.stringify(meta))
  const res = await httpPostFormService(`${basePath(companyId, userId)}/documents`, form)
  if (res.status >= 200 && res.status < 300) return res.data?.data || res.data
  throw new Error(res.data?.message || 'Failed to upload document')
})

export const deleteAdminDocument = createAsyncThunk('adminUserProfile/deleteDoc', async ({ companyId, userId, documentId }) => {
  const res = await httpDeleteService(`${basePath(companyId, userId)}/documents/${documentId}`)
  if (res.status >= 200 && res.status < 300) return { documentId }
  throw new Error(res.data?.message || 'Failed to delete document')
})

// Emergency contacts
export const fetchAdminEmergencyContacts = createAsyncThunk('adminUserProfile/fetchContacts', async ({ companyId, userId }) => {
  const res = await httpGetService(`${basePath(companyId, userId)}/emergency-contacts`)
  if (res.status >= 200 && res.status < 300) return res.data?.data || res.data
  throw new Error(res.data?.message || 'Failed to load emergency contacts')
})

export const upsertAdminEmergencyContact = createAsyncThunk('adminUserProfile/upsertContact', async ({ companyId, userId, contactId, payload }) => {
  const url = contactId
    ? `${basePath(companyId, userId)}/emergency-contacts/${contactId}`
    : `${basePath(companyId, userId)}/emergency-contacts`
  // For update use PATCH; for create use POST
  const res = contactId
    ? await httpPatchService(url, payload)
    : await httpPostService(url, payload)
  if (res.status >= 200 && res.status < 300) return res.data?.data || res.data
  throw new Error(res.data?.message || 'Failed to save emergency contact')
})

export const deleteAdminEmergencyContact = createAsyncThunk('adminUserProfile/deleteContact', async ({ companyId, userId, contactId }) => {
  const res = await httpDeleteService(`${basePath(companyId, userId)}/emergency-contacts/${contactId}`)
  if (res.status >= 200 && res.status < 300) return { contactId }
  throw new Error(res.data?.message || 'Failed to delete emergency contact')
})

// Bank
export const fetchAdminBank = createAsyncThunk('adminUserProfile/fetchBank', async ({ companyId, userId }) => {
  const res = await httpGetService(`${basePath(companyId, userId)}/bank`)
  if (res.status >= 200 && res.status < 300) return res.data?.data || res.data
  throw new Error(res.data?.message || 'Failed to load bank details')
})

export const updateAdminBank = createAsyncThunk('adminUserProfile/updateBank', async ({ companyId, userId, payload }) => {
  const res = await httpPatchService(`${basePath(companyId, userId)}/bank`, payload)
  if (res.status >= 200 && res.status < 300) return res.data?.data || res.data
  throw new Error(res.data?.message || 'Failed to update bank details')
})

const initialState = {
  profile: null,
  loading: 'idle',
  error: null,
}

const adminUserProfileSlice = createSlice({
  name: 'adminUserProfile',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminUserProfile.pending, (state) => {
        state.loading = 'loading'
        state.error = null
      })
      .addCase(fetchAdminUserProfile.fulfilled, (state, action) => {
        state.loading = 'succeeded'
        state.profile = action.payload || null
      })
      .addCase(fetchAdminUserProfile.rejected, (state, action) => {
        state.loading = 'failed'
        state.error = action.error?.message || 'Failed to load profile'
      })
      // Admin update selected user's profile
      .addCase(updateAdminUserProfile.pending, (state) => {
        state.loading = state.loading === 'loading' ? 'loading' : 'updating'
        state.error = null
      })
      .addCase(updateAdminUserProfile.fulfilled, (state, action) => {
        state.loading = 'succeeded'
        state.profile = action.payload || state.profile
      })
      .addCase(updateAdminUserProfile.rejected, (state, action) => {
        state.loading = 'failed'
        state.error = action.error?.message || 'Failed to update profile'
      })
      // USER own profile
      .addCase(fetchOwnProfile.pending, (state) => {
        state.loading = 'loading'
        state.error = null
      })
      .addCase(fetchOwnProfile.fulfilled, (state, action) => {
        state.loading = 'succeeded'
        state.profile = action.payload || null
      })
      .addCase(fetchOwnProfile.rejected, (state, action) => {
        state.loading = 'failed'
        state.error = action.error?.message || 'Failed to load my profile'
      })
      .addCase(updateOwnProfile.pending, (state) => {
        state.loading = 'loading'
        state.error = null
      })
      .addCase(updateOwnProfile.fulfilled, (state, action) => {
        state.loading = 'succeeded'
        state.profile = action.payload || state.profile
      })
      .addCase(updateOwnProfile.rejected, (state, action) => {
        state.loading = 'failed'
        state.error = action.error?.message || 'Failed to update my profile'
      })
      .addCase(changeOwnPassword.pending, (state) => {
        state.loading = state.loading === 'loading' ? 'loading' : 'updating'
        state.error = null
      })
      .addCase(changeOwnPassword.fulfilled, (state) => {
        state.loading = 'succeeded'
      })
      .addCase(changeOwnPassword.rejected, (state, action) => {
        state.loading = 'failed'
        state.error = action.error?.message || 'Failed to change password'
      })
      // Own avatar upload/delete
      .addCase(uploadOwnAvatar.pending, (state) => {
        state.loading = state.loading === 'loading' ? 'loading' : 'updating'
        state.error = null
      })
      .addCase(uploadOwnAvatar.fulfilled, (state, action) => {
        state.loading = 'succeeded'
        const payload = action.payload
        if (!payload) return
        // If backend returns full profile, replace; else update avatar fields
        if (payload && (payload.firstName || payload.email || payload.employeeId)) {
          state.profile = payload
        } else if (state.profile) {
          const url = payload?.avatar || payload?.avatarUrl || payload?.url || payload
          state.profile.avatar = url
        }
      })
      .addCase(uploadOwnAvatar.rejected, (state, action) => {
        state.loading = 'failed'
        state.error = action.error?.message || 'Failed to upload avatar'
      })
      .addCase(deleteOwnAvatar.pending, (state) => {
        state.loading = state.loading === 'loading' ? 'loading' : 'updating'
        state.error = null
      })
      .addCase(deleteOwnAvatar.fulfilled, (state) => {
        state.loading = 'succeeded'
        if (state.profile) {
          state.profile.avatar = ''
          if (state.profile.avatarUrl) state.profile.avatarUrl = ''
          if (state.profile.photo) state.profile.photo = ''
          if (state.profile.photoUrl) state.profile.photoUrl = ''
        }
      })
      .addCase(deleteOwnAvatar.rejected, (state, action) => {
        state.loading = 'failed'
        state.error = action.error?.message || 'Failed to delete avatar'
      })
  }
})

export const selectAdminProfile = (state) => state.adminUserProfile?.profile || null
export const selectAdminProfileLoading = (state) => state.adminUserProfile?.loading || 'idle'
export const selectAdminProfileError = (state) => state.adminUserProfile?.error || null

export default adminUserProfileSlice.reducer
