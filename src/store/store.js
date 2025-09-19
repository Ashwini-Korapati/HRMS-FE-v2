import { configureStore, isRejectedWithValue } from '@reduxjs/toolkit'
import plansReducer from '../Redux/Public/plansSlice'
import authChallengeReducer from '../Redux/Public/authChallengeSlice'
import projectsReducer from '../Redux/Public/projectsSlice'
import authReducer, { authSubscribe, initAuthScheduling } from '../Redux/Public/authSlice'
import themeReducer from '../Redux/Public/themeSlice'
import { attachAuthStore } from '../auth/auth'
import { attachStore } from '../config/httphandler'

// Simple action logger (dev only)
const actionLogger = store => next => action => {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.debug('[Redux]', action.type, action.payload)
  }
  return next(action)
}

// Error reporter middleware
const errorReporter = store => next => action => {
  const result = next(action)
  if (isRejectedWithValue(action)) {
    // eslint-disable-next-line no-console
    console.warn('Rejected action:', action)
  }
  return result
}

export const store = configureStore({
  reducer: {
    plans: plansReducer,
  authChallenge: authChallengeReducer,
  auth: authReducer,
  theme: themeReducer,
  projects: projectsReducer,
  },
  middleware: getDefault => getDefault({ serializableCheck: false }).concat(actionLogger, errorReporter)
})

export const dispatch = store.dispatch

// Attach store for http handler refresh logic
attachStore(store)
// Setup auth scheduling for persisted tokens
initAuthScheduling(store.dispatch, store.getState)
authSubscribe(store)
attachAuthStore(store)
