import { createSlice, createAsyncThunk, nanoid } from '@reduxjs/toolkit'
import { httpGetService } from '../../config/httphandler'

// Thunk: fetch login challenge
// args: { email, clientId, responseType }
export const fetchLoginChallenge = createAsyncThunk('authChallenge/fetch', async (args, { rejectWithValue }) => {
  const { email, clientId = 'hroffice-app', responseType = 'code' } = args || {}
  const query = `uas/auth/challenge?email=${encodeURIComponent(email)}&client_id=${encodeURIComponent(clientId)}&response_type=${encodeURIComponent(responseType)}`
  const res = await httpGetService(query)
  // eslint-disable-next-line no-console
  console.debug('[authChallenge] request', { query, status: res.status })
  if (res.status >= 200 && res.status < 300 && res.data?.success) {
    // eslint-disable-next-line no-console
    console.debug('[authChallenge] success payload', res.data.data)
    return res.data.data
  }
  // eslint-disable-next-line no-console
  console.warn('[authChallenge] failed', res.data)
  return rejectWithValue(res.data)
})

const initialState = {
  status: 'idle', // idle | loading | succeeded | failed
  error: null,
  loginChallenge: null,
  loginUrl: null,
  company: null,
  email: null,
  expiresAt: null,
  version: nanoid(6)
}

const authChallengeSlice = createSlice({
  name: 'authChallenge',
  initialState,
  reducers: {
    resetChallenge(state) {
      state.status = 'idle'
      state.error = null
      state.loginChallenge = null
      state.loginUrl = null
      state.company = null
      state.expiresAt = null
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchLoginChallenge.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchLoginChallenge.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.loginChallenge = action.payload.loginChallenge
        state.loginUrl = action.payload.loginUrl
        state.company = action.payload.company
  state.email = action.meta.arg?.email || state.email
        // server gives expiresIn (seconds). compute absolute timestamp.
        if (action.payload.expiresIn) {
          state.expiresAt = Date.now() + action.payload.expiresIn * 1000
        }
      })
      .addCase(fetchLoginChallenge.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload?.message || 'Failed to start login challenge'
      })
  }
})

export const { resetChallenge } = authChallengeSlice.actions

// Selectors
export const selectAuthChallengeState = s => s.authChallenge
export const selectLoginChallengeStatus = s => s.authChallenge.status
export const selectLoginUrl = s => s.authChallenge.loginUrl
export const selectLoginCompany = s => s.authChallenge.company
export const selectLoginChallengeError = s => s.authChallenge.error

export default authChallengeSlice.reducer
