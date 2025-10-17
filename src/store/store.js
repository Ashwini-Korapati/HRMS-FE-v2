import { configureStore, isRejectedWithValue } from '@reduxjs/toolkit'
import plansReducer from '../Redux/Public/plansSlice'
import authChallengeReducer from '../Redux/Public/authChallengeSlice'
import projectsReducer from '../Redux/Public/projectsSlice'
import authReducer, { authSubscribe, initAuthScheduling } from '../Redux/Public/authSlice'
import themeReducer from '../Redux/Public/themeSlice'
import departmentReducer from '../Redux/Public/departmentSlice'
import designationReducer from '../Redux/Public/designationSlice'
import employeesReducer from '../Redux/Public/employeesSlice'
import foldersReducer from '../Redux/Public/foldersSlice'
import onboardingUserReducer from '../Redux/Public/onboardinguserSlice'
import { attachAuthStore } from '../auth/auth'
import { attachStore } from '../config/httphandler'
import userleaveReducer from '../Redux/Public/UserleaveSlice'
import leaveTypesReducer from '../Redux/Public/leaveTypesSlice'
import notificationsReducer from '../Redux/Public/notificationsSlice'
import leaveApprovalsReducer from '../Redux/Public/leaveApprovalsSlice'
import adminUserProfileReducer from '../Redux/Public/adminUserProfileSlice'
import  WorkShiftsReducer from '../Redux/Public/WorkShiftsSlice'
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
  departments: departmentReducer,
  designations: designationReducer, // Add this line
  employees: employeesReducer,
  folders: foldersReducer,
  onboardingUser: onboardingUserReducer,
  userleave: userleaveReducer, // Add userleave slice to store
  leaveTypes: leaveTypesReducer, // Add this
  notifications: notificationsReducer,
  leaveApprovals: leaveApprovalsReducer,
  adminUserProfile: adminUserProfileReducer,
    workShifts: WorkShiftsReducer, // Add this reducer

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
