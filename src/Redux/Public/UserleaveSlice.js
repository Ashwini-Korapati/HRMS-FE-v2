// // import { createSlice, createAsyncThunk, nanoid } from '@reduxjs/toolkit'
// // import { httpPostService, httpGetService, httpPatchService, httpDeleteService } from '../../config/httphandler'
// // import { selectAuthUser, selectAuthCompany } from './authSlice'

// // // Create leave application
// // export const createLeave = createAsyncThunk('userleave/create', async (payload, { getState, rejectWithValue }) => {
// //   try {
// //     const state = getState()
// //     const user = selectAuthUser(state)
// //     const company = selectAuthCompany(state)
// //     if (!company?.id) return rejectWithValue({ message: 'Missing company context' })
    
// //     const endpoint = `${company.id}/auth/${user.id}/leaves`
// //     const res = await httpPostService(endpoint, payload)
    
// //     if (res.status >= 200 && res.status < 300) {
// //       return res.data?.data || res.data
// //     }
// //     return rejectWithValue(res.data || { message: 'Failed to create leave application' })
// //   } catch (e) {
// //     return rejectWithValue({ message: e.message || 'Unexpected error' })
// //   }
// // })

// // // Fetch user's leave applications
// // export const fetchLeaves = createAsyncThunk('userleave/fetchList', async (_, { getState, rejectWithValue }) => {
// //   try {
// //     const state = getState()
// //     const user = selectAuthUser(state)
// //     const company = selectAuthCompany(state)
// //     if (!company?.id) return rejectWithValue({ message: 'Missing company context' })
    
// //     const endpoint = `${company.id}/auth/${user.id}/leaves`
// //     const res = await httpGetService(endpoint)
    
// //     if (res.status >= 200 && res.status < 300) return res.data?.data || res.data
// //     return rejectWithValue(res.data || { message: 'Failed to load leave applications' })
// //   } catch (e) {
// //     return rejectWithValue({ message: e.message || 'Unexpected error' })
// //   }
// // })

// // // Fetch leave by ID
// // export const fetchLeaveById = createAsyncThunk('userleave/fetchOne', async (leaveId, { getState, rejectWithValue }) => {
// //   try {
// //     const state = getState()
// //     const user = selectAuthUser(state)
// //     const company = selectAuthCompany(state)
// //     if (!company?.id) return rejectWithValue({ message: 'Missing company context' })
    
// //     const endpoint = `${company.id}/auth/${user.id}/leaves/${leaveId}`
// //     const res = await httpGetService(endpoint)
    
// //     if (res.status >= 200 && res.status < 300) return res.data?.data || res.data
// //     return rejectWithValue(res.data || { message: 'Failed to load leave application' })
// //   } catch (e) {
// //     return rejectWithValue({ message: e.message || 'Unexpected error' })
// //   }
// // })

// // // Update leave application - using httpPatchService instead of httpPutService
// // export const updateLeave = createAsyncThunk('userleave/updateOne', async ({ id, ...payload }, { getState, rejectWithValue }) => {
// //   try {
// //     const state = getState()
// //     const user = selectAuthUser(state)
// //     const company = selectAuthCompany(state)
// //     if (!company?.id) return rejectWithValue({ message: 'Missing company context' })
    
// //     const endpoint = `${company.id}/auth/${user.id}/leaves/${id}`
// //     const res = await httpPatchService(endpoint, payload) // Changed to httpPatchService
    
// //     if (res.status >= 200 && res.status < 300) return res.data?.data || res.data
// //     return rejectWithValue(res.data || { message: 'Failed to update leave application' })
// //   } catch (e) {
// //     return rejectWithValue({ message: e.message || 'Unexpected error' })
// //   }
// // })

// // // Delete leave application
// // export const deleteLeave = createAsyncThunk('userleave/deleteOne', async (leaveId, { getState, rejectWithValue }) => {
// //   try {
// //     const state = getState()
// //     const user = selectAuthUser(state)
// //     const company = selectAuthCompany(state)
// //     if (!company?.id) return rejectWithValue({ message: 'Missing company context' })
    
// //     const endpoint = `${company.id}/auth/${user.id}/leaves/${leaveId}`
// //     const res = await httpDeleteService(endpoint)
    
// //     if (res.status >= 200 && res.status < 300) return { id: leaveId }
// //     return rejectWithValue(res.data || { message: 'Failed to delete leave application' })
// //   } catch (e) {
// //     return rejectWithValue({ message: e.message || 'Unexpected error' })
// //   }
// // })

// // // Fetch leave balance
// // export const fetchLeaveBalance = createAsyncThunk('userleave/fetchBalance', async (_, { getState, rejectWithValue }) => {
// //   try {
// //     const state = getState()
// //     const user = selectAuthUser(state)
// //     const company = selectAuthCompany(state)
// //     if (!company?.id) return rejectWithValue({ message: 'Missing company context' })
    
// //     const endpoint = `${company.id}/auth/${user.id}/leave-balance`
// //     const res = await httpGetService(endpoint)
    
// //     if (res.status >= 200 && res.status < 300) return res.data?.data || res.data
// //     return rejectWithValue(res.data || { message: 'Failed to load leave balance' })
// //   } catch (e) {
// //     return rejectWithValue({ message: e.message || 'Unexpected error' })
// //   }
// // })

// // const initialState = {
// //   items: [],
// //   pagination: null,
// //   itemsLoaded: false,
// //   loadingList: 'idle',
// //   loadingOne: 'idle',
// //   creating: 'idle',
// //   updating: 'idle',
// //   deleting: 'idle',
// //   balanceLoading: 'idle',
// //   createError: null,
// //   listError: null,
// //   detailError: null,
// //   updateError: null,
// //   deleteError: null,
// //   balanceError: null,
// //   lastCreated: null,
// //   leaveBalance: null,
// //   version: nanoid(6)
// // }

// // const userleaveSlice = createSlice({
// //   name: 'userleave',
// //   initialState,
// //   reducers: {
// //     resetUserLeaveState(state) {
// //       state.creating = 'idle'
// //       state.createError = null
// //       state.lastCreated = null
// //     },
// //     clearUserLeaveErrors(state) {
// //       state.createError = null
// //       state.listError = null
// //       state.detailError = null
// //       state.updateError = null
// //       state.deleteError = null
// //       state.balanceError = null
// //     }
// //   },
// //   extraReducers: builder => {
// //     builder
// //       // Create leave
// //       .addCase(createLeave.pending, (state) => {
// //         state.creating = 'loading'
// //         state.createError = null
// //       })
// //       .addCase(createLeave.fulfilled, (state, action) => {
// //         state.creating = 'succeeded'
// //         const leave = action.payload
// //         state.lastCreated = leave
// //         if (leave && leave.id && !state.items.find(l => l.id === leave.id)) {
// //           state.items.unshift(leave) // Add to beginning
// //         }
// //       })
// //       .addCase(createLeave.rejected, (state, action) => {
// //         state.creating = 'failed'
// //         state.createError = action.payload?.message || 'Create failed'
// //       })
// //       // Fetch list
// //       .addCase(fetchLeaves.pending, (state) => {
// //         state.loadingList = 'loading'
// //         state.listError = null
// //       })
// //       .addCase(fetchLeaves.fulfilled, (state, action) => {
// //         state.loadingList = 'succeeded'
// //         const payload = action.payload || {}
// //         const pag = payload.pagination || null
// //         const list = payload.items || payload.leaves || payload || []
// //         const rawItems = Array.isArray(list) ? list : Array.isArray(list?.items) ? list.items : []
        
// //         state.items = rawItems
// //         state.pagination = pag
// //         state.itemsLoaded = true
// //       })
// //       .addCase(fetchLeaves.rejected, (state, action) => {
// //         state.loadingList = 'failed'
// //         state.listError = action.payload?.message || 'Load failed'
// //       })
// //       // Fetch one
// //       .addCase(fetchLeaveById.pending, (state) => {
// //         state.loadingOne = 'loading'
// //         state.detailError = null
// //       })
// //       .addCase(fetchLeaveById.fulfilled, (state, action) => {
// //         state.loadingOne = 'succeeded'
// //         const leave = action.payload
// //         if (leave && leave.id) {
// //           const idx = state.items.findIndex(l => l.id === leave.id)
// //           if (idx >= 0) state.items[idx] = { ...state.items[idx], ...leave }
// //           else state.items.unshift(leave)
// //         }
// //       })
// //       .addCase(fetchLeaveById.rejected, (state, action) => {
// //         state.loadingOne = 'failed'
// //         state.detailError = action.payload?.message || 'Load failed'
// //       })
// //       // Update
// //       .addCase(updateLeave.pending, (state) => {
// //         state.updating = 'loading'
// //         state.updateError = null
// //       })
// //       .addCase(updateLeave.fulfilled, (state, action) => {
// //         state.updating = 'succeeded'
// //         const leave = action.payload
// //         if (leave && leave.id) {
// //           const idx = state.items.findIndex(l => l.id === leave.id)
// //           if (idx >= 0) state.items[idx] = { ...state.items[idx], ...leave }
// //         }
// //       })
// //       .addCase(updateLeave.rejected, (state, action) => {
// //         state.updating = 'failed'
// //         state.updateError = action.payload?.message || 'Update failed'
// //       })
// //       // Delete
// //       .addCase(deleteLeave.pending, (state) => {
// //         state.deleting = 'loading'
// //         state.deleteError = null
// //       })
// //       .addCase(deleteLeave.fulfilled, (state, action) => {
// //         state.deleting = 'succeeded'
// //         const id = action.payload?.id
// //         if (id) state.items = state.items.filter(l => l.id !== id)
// //       })
// //       .addCase(deleteLeave.rejected, (state, action) => {
// //         state.deleting = 'failed'
// //         state.deleteError = action.payload?.message || 'Delete failed'
// //       })
// //       // Balance
// //       .addCase(fetchLeaveBalance.pending, (state) => {
// //         state.balanceLoading = 'loading'
// //         state.balanceError = null
// //       })
// //       .addCase(fetchLeaveBalance.fulfilled, (state, action) => {
// //         state.balanceLoading = 'succeeded'
// //         state.leaveBalance = action.payload || null
// //       })
// //       .addCase(fetchLeaveBalance.rejected, (state, action) => {
// //         state.balanceLoading = 'failed'
// //         state.balanceError = action.payload?.message || 'Balance load failed'
// //       })
// //   }
// // })

// // export const { resetUserLeaveState, clearUserLeaveErrors } = userleaveSlice.actions

// // // Selectors - Updated to use userleave namespace
// // export const selectUserLeaveState = (s) => s.userleave
// // export const selectUserLeaveCreating = (s) => s.userleave.creating
// // export const selectUserLeaveCreateError = (s) => s.userleave.createError
// // export const selectUserLeaves = (s) => s.userleave.items
// // export const selectUserLeavesPagination = (s) => s.userleave.pagination
// // export const selectLastCreatedUserLeave = (s) => s.userleave.lastCreated
// // export const selectUserLeavesListLoading = (s) => s.userleave.loadingList
// // export const selectUserLeavesListError = (s) => s.userleave.listError
// // export const selectUserLeaveDetailLoading = (s) => s.userleave.loadingOne
// // export const selectUserLeaveDetailError = (s) => s.userleave.detailError
// // export const selectUserLeaveUpdating = (s) => s.userleave.updating
// // export const selectUserLeaveUpdateError = (s) => s.userleave.updateError
// // export const selectUserLeaveDeleting = (s) => s.userleave.deleting
// // export const selectUserLeaveDeleteError = (s) => s.userleave.deleteError
// // export const selectUserLeaveBalance = (s) => s.userleave.leaveBalance
// // export const selectUserLeaveBalanceLoading = (s) => s.userleave.balanceLoading
// // export const selectUserLeaveBalanceError = (s) => s.userleave.balanceError

// // export default userleaveSlice.reducer

// import { createSlice, createAsyncThunk, nanoid } from '@reduxjs/toolkit'
// import { httpPostService, httpGetService, httpPatchService, httpDeleteService } from '../../config/httphandler'
// import { selectAuthUser, selectAuthCompany } from './authSlice'

// // Create leave application
// export const createLeave = createAsyncThunk('userleave/create', async (payload, { getState, rejectWithValue }) => {
//   try {
//     const state = getState()
//     const user = selectAuthUser(state)
//     const company = selectAuthCompany(state)
//     if (!company?.id) return rejectWithValue({ message: 'Missing company context' })
    
//     const endpoint = `${company.id}/auth/${user.id}/leaves`
//     const res = await httpPostService(endpoint, {
//       leaveTypeId: payload.leaveTypeId,
//       startDate: payload.startDate,
//       endDate: payload.endDate,
//       reason: payload.reason,
//       isHalfDay: payload.isHalfDay || false
//     })
    
//     if (res.status >= 200 && res.status < 300) {
//       return res.data?.data || res.data
//     }
//     return rejectWithValue(res.data || { message: 'Failed to create leave application' })
//   } catch (e) {
//     return rejectWithValue({ message: e.message || 'Unexpected error' })
//   }
// })

// // Fetch user's leave applications - UPDATED ENDPOINT
// export const fetchLeaves = createAsyncThunk('userleave/fetchList', async (_, { getState, rejectWithValue }) => {
//   try {
//     const state = getState()
//     const user = selectAuthUser(state)
//     const company = selectAuthCompany(state)
//     if (!company?.id) return rejectWithValue({ message: 'Missing company context' })
    
//     // Updated endpoint to match your API
//     const endpoint = `${company.id}/auth/${user.id}/leaves/my-leaves`
//     const res = await httpGetService(endpoint)
    
//     if (res.status >= 200 && res.status < 300) {
//       const responseData = res.data?.data || res.data
//       return Array.isArray(responseData) ? responseData : []
//     }
//     return rejectWithValue(res.data || { message: 'Failed to load leave applications' })
//   } catch (e) {
//     return rejectWithValue({ message: e.message || 'Unexpected error' })
//   }
// })

// // Fetch leave by ID
// export const fetchLeaveById = createAsyncThunk('userleave/fetchOne', async (leaveId, { getState, rejectWithValue }) => {
//   try {
//     const state = getState()
//     const user = selectAuthUser(state)
//     const company = selectAuthCompany(state)
//     if (!company?.id) return rejectWithValue({ message: 'Missing company context' })
    
//     const endpoint = `${company.id}/auth/${user.id}/leaves/${leaveId}`
//     const res = await httpGetService(endpoint)
    
//     if (res.status >= 200 && res.status < 300) return res.data?.data || res.data
//     return rejectWithValue(res.data || { message: 'Failed to load leave application' })
//   } catch (e) {
//     return rejectWithValue({ message: e.message || 'Unexpected error' })
//   }
// })

// // Update leave application
// export const updateLeave = createAsyncThunk('userleave/updateOne', async ({ id, ...payload }, { getState, rejectWithValue }) => {
//   try {
//     const state = getState()
//     const user = selectAuthUser(state)
//     const company = selectAuthCompany(state)
//     if (!company?.id) return rejectWithValue({ message: 'Missing company context' })
    
//     const endpoint = `${company.id}/auth/${user.id}/leaves/${id}`
//     const res = await httpPatchService(endpoint, payload)
    
//     if (res.status >= 200 && res.status < 300) return res.data?.data || res.data
//     return rejectWithValue(res.data || { message: 'Failed to update leave application' })
//   } catch (e) {
//     return rejectWithValue({ message: e.message || 'Unexpected error' })
//   }
// })

// // Delete leave application
// export const deleteLeave = createAsyncThunk('userleave/deleteOne', async (leaveId, { getState, rejectWithValue }) => {
//   try {
//     const state = getState()
//     const user = selectAuthUser(state)
//     const company = selectAuthCompany(state)
//     if (!company?.id) return rejectWithValue({ message: 'Missing company context' })
    
//     const endpoint = `${company.id}/auth/${user.id}/leaves/${leaveId}`
//     const res = await httpDeleteService(endpoint)
    
//     if (res.status >= 200 && res.status < 300) return { id: leaveId }
//     return rejectWithValue(res.data || { message: 'Failed to delete leave application' })
//   } catch (e) {
//     return rejectWithValue({ message: e.message || 'Unexpected error' })
//   }
// })

// // Fetch leave balance
// export const fetchLeaveBalance = createAsyncThunk('userleave/fetchBalance', async (_, { getState, rejectWithValue }) => {
//   try {
//     const state = getState()
//     const user = selectAuthUser(state)
//     const company = selectAuthCompany(state)
//     if (!company?.id) return rejectWithValue({ message: 'Missing company context' })
    
//     const endpoint = `${company.id}/auth/${user.id}/leave-balance`
//     const res = await httpGetService(endpoint)
    
//     if (res.status >= 200 && res.status < 300) return res.data?.data || res.data
//     return rejectWithValue(res.data || { message: 'Failed to load leave balance' })
//   } catch (e) {
//     return rejectWithValue({ message: e.message || 'Unexpected error' })
//   }
// })

// const initialState = {
//   items: [],
//   pagination: null,
//   itemsLoaded: false,
//   loadingList: 'idle',
//   loadingOne: 'idle',
//   creating: 'idle',
//   updating: 'idle',
//   deleting: 'idle',
//   balanceLoading: 'idle',
//   createError: null,
//   listError: null,
//   detailError: null,
//   updateError: null,
//   deleteError: null,
//   balanceError: null,
//   lastCreated: null,
//   leaveBalance: null,
//   version: nanoid(6)
// }

// const userleaveSlice = createSlice({
//   name: 'userleave',
//   initialState,
//   reducers: {
//     resetUserLeaveState(state) {
//       state.creating = 'idle'
//       state.createError = null
//       state.lastCreated = null
//     },
//     clearUserLeaveErrors(state) {
//       state.createError = null
//       state.listError = null
//       state.detailError = null
//       state.updateError = null
//       state.deleteError = null
//       state.balanceError = null
//     }
//   },
//   extraReducers: builder => {
//     builder
//       // Create leave
//       .addCase(createLeave.pending, (state) => {
//         state.creating = 'loading'
//         state.createError = null
//       })
//       .addCase(createLeave.fulfilled, (state, action) => {
//         state.creating = 'succeeded'
//         const leave = action.payload
//         state.lastCreated = leave
//         if (leave && leave.id && !state.items.find(l => l.id === leave.id)) {
//           state.items.unshift(leave)
//         }
//       })
//       .addCase(createLeave.rejected, (state, action) => {
//         state.creating = 'failed'
//         state.createError = action.payload?.message || 'Create failed'
//       })
//       // Fetch list - UPDATED
//       .addCase(fetchLeaves.pending, (state) => {
//         state.loadingList = 'loading'
//         state.listError = null
//       })
//       .addCase(fetchLeaves.fulfilled, (state, action) => {
//         state.loadingList = 'succeeded'
//         const leaves = action.payload || []
//         state.items = Array.isArray(leaves) ? leaves : []
//         state.itemsLoaded = true
//       })
//       .addCase(fetchLeaves.rejected, (state, action) => {
//         state.loadingList = 'failed'
//         state.listError = action.payload?.message || 'Load failed'
//       })
//       // Fetch one
//       .addCase(fetchLeaveById.pending, (state) => {
//         state.loadingOne = 'loading'
//         state.detailError = null
//       })
//       .addCase(fetchLeaveById.fulfilled, (state, action) => {
//         state.loadingOne = 'succeeded'
//         const leave = action.payload
//         if (leave && leave.id) {
//           const idx = state.items.findIndex(l => l.id === leave.id)
//           if (idx >= 0) state.items[idx] = { ...state.items[idx], ...leave }
//           else state.items.unshift(leave)
//         }
//       })
//       .addCase(fetchLeaveById.rejected, (state, action) => {
//         state.loadingOne = 'failed'
//         state.detailError = action.payload?.message || 'Load failed'
//       })
//       // Update
//       .addCase(updateLeave.pending, (state) => {
//         state.updating = 'loading'
//         state.updateError = null
//       })
//       .addCase(updateLeave.fulfilled, (state, action) => {
//         state.updating = 'succeeded'
//         const leave = action.payload
//         if (leave && leave.id) {
//           const idx = state.items.findIndex(l => l.id === leave.id)
//           if (idx >= 0) state.items[idx] = { ...state.items[idx], ...leave }
//         }
//       })
//       .addCase(updateLeave.rejected, (state, action) => {
//         state.updating = 'failed'
//         state.updateError = action.payload?.message || 'Update failed'
//       })
//       // Delete
//       .addCase(deleteLeave.pending, (state) => {
//         state.deleting = 'loading'
//         state.deleteError = null
//       })
//       .addCase(deleteLeave.fulfilled, (state, action) => {
//         state.deleting = 'succeeded'
//         const id = action.payload?.id
//         if (id) state.items = state.items.filter(l => l.id !== id)
//       })
//       .addCase(deleteLeave.rejected, (state, action) => {
//         state.deleting = 'failed'
//         state.deleteError = action.payload?.message || 'Delete failed'
//       })
//       // Balance
//       .addCase(fetchLeaveBalance.pending, (state) => {
//         state.balanceLoading = 'loading'
//         state.balanceError = null
//       })
//       .addCase(fetchLeaveBalance.fulfilled, (state, action) => {
//         state.balanceLoading = 'succeeded'
//         state.leaveBalance = action.payload || null
//       })
//       .addCase(fetchLeaveBalance.rejected, (state, action) => {
//         state.balanceLoading = 'failed'
//         state.balanceError = action.payload?.message || 'Balance load failed'
//       })
//   }
// })

// export const { resetUserLeaveState, clearUserLeaveErrors } = userleaveSlice.actions

// // Selectors
// export const selectUserLeaveState = (s) => s.userleave
// export const selectUserLeaveCreating = (s) => s.userleave.creating
// export const selectUserLeaveCreateError = (s) => s.userleave.createError
// export const selectUserLeaves = (s) => s.userleave.items
// export const selectUserLeavesPagination = (s) => s.userleave.pagination
// export const selectLastCreatedUserLeave = (s) => s.userleave.lastCreated
// export const selectUserLeavesListLoading = (s) => s.userleave.loadingList
// export const selectUserLeavesListError = (s) => s.userleave.listError
// export const selectUserLeaveDetailLoading = (s) => s.userleave.loadingOne
// export const selectUserLeaveDetailError = (s) => s.userleave.detailError
// export const selectUserLeaveUpdating = (s) => s.userleave.updating
// export const selectUserLeaveUpdateError = (s) => s.userleave.updateError
// export const selectUserLeaveDeleting = (s) => s.userleave.deleting
// export const selectUserLeaveDeleteError = (s) => s.userleave.deleteError
// export const selectUserLeaveBalance = (s) => s.userleave.leaveBalance
// export const selectUserLeaveBalanceLoading = (s) => s.userleave.balanceLoading
// export const selectUserLeaveBalanceError = (s) => s.userleave.balanceError

// export default userleaveSlice.reducer


import { createSlice, createAsyncThunk, nanoid } from '@reduxjs/toolkit'
import { httpPostService, httpGetService, httpPatchService, httpDeleteService } from '../../config/httphandler'
import { selectAuthUser, selectAuthCompany } from './authSlice'

// Create leave application
export const createLeave = createAsyncThunk('userleave/create', async (payload, { getState, rejectWithValue }) => {
  try {
    const state = getState()
    const user = selectAuthUser(state)
    const company = selectAuthCompany(state)
    if (!company?.id) return rejectWithValue({ message: 'Missing company context' })
    
    const endpoint = `${company.id}/auth/${user.id}/leaves`
    const res = await httpPostService(endpoint, {
      leaveTypeId: payload.leaveTypeId,
      startDate: payload.startDate,
      endDate: payload.endDate,
      reason: payload.reason,
      isHalfDay: payload.isHalfDay || false
    })
    
    if (res.status >= 200 && res.status < 300) {
      return res.data?.data || res.data
    }
    return rejectWithValue(res.data || { message: 'Failed to create leave application' })
  } catch (e) {
    return rejectWithValue({ message: e.message || 'Unexpected error' })
  }
})

// Fetch user's leave applications
export const fetchLeaves = createAsyncThunk('userleave/fetchList', async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState()
    const user = selectAuthUser(state)
    const company = selectAuthCompany(state)
    if (!company?.id) return rejectWithValue({ message: 'Missing company context' })
    
    const endpoint = `${company.id}/auth/${user.id}/leaves/my-leaves`
    const res = await httpGetService(endpoint)
    
    if (res.status >= 200 && res.status < 300) {
      const responseData = res.data?.data || res.data
      return Array.isArray(responseData) ? responseData : []
    }
    return rejectWithValue(res.data || { message: 'Failed to load leave applications' })
  } catch (e) {
    return rejectWithValue({ message: e.message || 'Unexpected error' })
  }
})

// Fetch user's available leave types - NEW THUNK
export const fetchUserLeaveTypes = createAsyncThunk('userleave/fetchUserLeaveTypes', async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState()
    const user = selectAuthUser(state)
    const company = selectAuthCompany(state)
    if (!company?.id) return rejectWithValue({ message: 'Missing company context' })
    
    const endpoint = `${company.id}/auth/${user.id}/leaves/my-leave-types`
    const res = await httpGetService(endpoint)
    
    if (res.status >= 200 && res.status < 300) {
      const responseData = res.data?.data || res.data
      return Array.isArray(responseData) ? responseData : []
    }
    return rejectWithValue(res.data || { message: 'Failed to load leave types' })
  } catch (e) {
    return rejectWithValue({ message: e.message || 'Unexpected error' })
  }
})

// Fetch leave by ID
export const fetchLeaveById = createAsyncThunk('userleave/fetchOne', async (leaveId, { getState, rejectWithValue }) => {
  try {
    const state = getState()
    const user = selectAuthUser(state)
    const company = selectAuthCompany(state)
    if (!company?.id) return rejectWithValue({ message: 'Missing company context' })
    
    const endpoint = `${company.id}/auth/${user.id}/leaves/${leaveId}`
    const res = await httpGetService(endpoint)
    
    if (res.status >= 200 && res.status < 300) return res.data?.data || res.data
    return rejectWithValue(res.data || { message: 'Failed to load leave application' })
  } catch (e) {
    return rejectWithValue({ message: e.message || 'Unexpected error' })
  }
})

// Update leave application
export const updateLeave = createAsyncThunk('userleave/updateOne', async ({ id, ...payload }, { getState, rejectWithValue }) => {
  try {
    const state = getState()
    const user = selectAuthUser(state)
    const company = selectAuthCompany(state)
    if (!company?.id) return rejectWithValue({ message: 'Missing company context' })
    
    const endpoint = `${company.id}/auth/${user.id}/leaves/${id}`
    const res = await httpPatchService(endpoint, payload)
    
    if (res.status >= 200 && res.status < 300) return res.data?.data || res.data
    return rejectWithValue(res.data || { message: 'Failed to update leave application' })
  } catch (e) {
    return rejectWithValue({ message: e.message || 'Unexpected error' })
  }
})

// Delete leave application
export const deleteLeave = createAsyncThunk('userleave/deleteOne', async (leaveId, { getState, rejectWithValue }) => {
  try {
    const state = getState()
    const user = selectAuthUser(state)
    const company = selectAuthCompany(state)
    if (!company?.id) return rejectWithValue({ message: 'Missing company context' })
    
    const endpoint = `${company.id}/auth/${user.id}/leaves/${leaveId}`
    const res = await httpDeleteService(endpoint)
    
    if (res.status >= 200 && res.status < 300) return { id: leaveId }
    return rejectWithValue(res.data || { message: 'Failed to delete leave application' })
  } catch (e) {
    return rejectWithValue({ message: e.message || 'Unexpected error' })
  }
})

// Fetch leave balance
export const fetchLeaveBalance = createAsyncThunk('userleave/fetchBalance', async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState()
    const user = selectAuthUser(state)
    const company = selectAuthCompany(state)
    if (!company?.id) return rejectWithValue({ message: 'Missing company context' })
    
    const endpoint = `${company.id}/auth/${user.id}/leave-balance`
    const res = await httpGetService(endpoint)
    
    if (res.status >= 200 && res.status < 300) return res.data?.data || res.data
    return rejectWithValue(res.data || { message: 'Failed to load leave balance' })
  } catch (e) {
    return rejectWithValue({ message: e.message || 'Unexpected error' })
  }
})

const initialState = {
  items: [],
  userLeaveTypes: [], // NEW STATE: User's available leave types
  pagination: null,
  itemsLoaded: false,
  userLeaveTypesLoaded: false, // NEW STATE: Track if user leave types are loaded
  loadingList: 'idle',
  loadingUserLeaveTypes: 'idle', // NEW STATE: Loading state for user leave types
  loadingOne: 'idle',
  creating: 'idle',
  updating: 'idle',
  deleting: 'idle',
  balanceLoading: 'idle',
  createError: null,
  listError: null,
  userLeaveTypesError: null, // NEW STATE: Error state for user leave types
  detailError: null,
  updateError: null,
  deleteError: null,
  balanceError: null,
  lastCreated: null,
  leaveBalance: null,
  version: nanoid(6)
}

const userleaveSlice = createSlice({
  name: 'userleave',
  initialState,
  reducers: {
    resetUserLeaveState(state) {
      state.creating = 'idle'
      state.createError = null
      state.lastCreated = null
    },
    clearUserLeaveErrors(state) {
      state.createError = null
      state.listError = null
      state.userLeaveTypesError = null
      state.detailError = null
      state.updateError = null
      state.deleteError = null
      state.balanceError = null
    }
  },
  extraReducers: builder => {
    builder
      // Create leave
      .addCase(createLeave.pending, (state) => {
        state.creating = 'loading'
        state.createError = null
      })
      .addCase(createLeave.fulfilled, (state, action) => {
        state.creating = 'succeeded'
        const leave = action.payload
        state.lastCreated = leave
        if (leave && leave.id && !state.items.find(l => l.id === leave.id)) {
          state.items.unshift(leave)
        }
      })
      .addCase(createLeave.rejected, (state, action) => {
        state.creating = 'failed'
        state.createError = action.payload?.message || 'Create failed'
      })
      // Fetch list
      .addCase(fetchLeaves.pending, (state) => {
        state.loadingList = 'loading'
        state.listError = null
      })
      .addCase(fetchLeaves.fulfilled, (state, action) => {
        state.loadingList = 'succeeded'
        const leaves = action.payload || []
        state.items = Array.isArray(leaves) ? leaves : []
        state.itemsLoaded = true
      })
      .addCase(fetchLeaves.rejected, (state, action) => {
        state.loadingList = 'failed'
        state.listError = action.payload?.message || 'Load failed'
      })
      // Fetch user leave types - NEW REDUCER
      .addCase(fetchUserLeaveTypes.pending, (state) => {
        state.loadingUserLeaveTypes = 'loading'
        state.userLeaveTypesError = null
      })
      .addCase(fetchUserLeaveTypes.fulfilled, (state, action) => {
        state.loadingUserLeaveTypes = 'succeeded'
        const leaveTypes = action.payload || []
        state.userLeaveTypes = Array.isArray(leaveTypes) ? leaveTypes : []
        state.userLeaveTypesLoaded = true
      })
      .addCase(fetchUserLeaveTypes.rejected, (state, action) => {
        state.loadingUserLeaveTypes = 'failed'
        state.userLeaveTypesError = action.payload?.message || 'Failed to load leave types'
      })
      // Fetch one
      .addCase(fetchLeaveById.pending, (state) => {
        state.loadingOne = 'loading'
        state.detailError = null
      })
      .addCase(fetchLeaveById.fulfilled, (state, action) => {
        state.loadingOne = 'succeeded'
        const leave = action.payload
        if (leave && leave.id) {
          const idx = state.items.findIndex(l => l.id === leave.id)
          if (idx >= 0) state.items[idx] = { ...state.items[idx], ...leave }
          else state.items.unshift(leave)
        }
      })
      .addCase(fetchLeaveById.rejected, (state, action) => {
        state.loadingOne = 'failed'
        state.detailError = action.payload?.message || 'Load failed'
      })
      // Update
      .addCase(updateLeave.pending, (state) => {
        state.updating = 'loading'
        state.updateError = null
      })
      .addCase(updateLeave.fulfilled, (state, action) => {
        state.updating = 'succeeded'
        const leave = action.payload
        if (leave && leave.id) {
          const idx = state.items.findIndex(l => l.id === leave.id)
          if (idx >= 0) state.items[idx] = { ...state.items[idx], ...leave }
        }
      })
      .addCase(updateLeave.rejected, (state, action) => {
        state.updating = 'failed'
        state.updateError = action.payload?.message || 'Update failed'
      })
      // Delete
      .addCase(deleteLeave.pending, (state) => {
        state.deleting = 'loading'
        state.deleteError = null
      })
      .addCase(deleteLeave.fulfilled, (state, action) => {
        state.deleting = 'succeeded'
        const id = action.payload?.id
        if (id) state.items = state.items.filter(l => l.id !== id)
      })
      .addCase(deleteLeave.rejected, (state, action) => {
        state.deleting = 'failed'
        state.deleteError = action.payload?.message || 'Delete failed'
      })
      // Balance
      .addCase(fetchLeaveBalance.pending, (state) => {
        state.balanceLoading = 'loading'
        state.balanceError = null
      })
      .addCase(fetchLeaveBalance.fulfilled, (state, action) => {
        state.balanceLoading = 'succeeded'
        state.leaveBalance = action.payload || null
      })
      .addCase(fetchLeaveBalance.rejected, (state, action) => {
        state.balanceLoading = 'failed'
        state.balanceError = action.payload?.message || 'Balance load failed'
      })
  }
})

export const { resetUserLeaveState, clearUserLeaveErrors } = userleaveSlice.actions

// Selectors
export const selectUserLeaveState = (s) => s.userleave
export const selectUserLeaveCreating = (s) => s.userleave.creating
export const selectUserLeaveCreateError = (s) => s.userleave.createError
export const selectUserLeaves = (s) => s.userleave.items
export const selectUserLeavesPagination = (s) => s.userleave.pagination
export const selectLastCreatedUserLeave = (s) => s.userleave.lastCreated
export const selectUserLeavesListLoading = (s) => s.userleave.loadingList
export const selectUserLeavesListError = (s) => s.userleave.listError

// NEW SELECTORS for user leave types
export const selectUserLeaveTypes = (s) => s.userleave.userLeaveTypes
export const selectUserLeaveTypesLoading = (s) => s.userleave.loadingUserLeaveTypes
export const selectUserLeaveTypesError = (s) => s.userleave.userLeaveTypesError
export const selectUserLeaveTypesLoaded = (s) => s.userleave.userLeaveTypesLoaded

export const selectUserLeaveDetailLoading = (s) => s.userleave.loadingOne
export const selectUserLeaveDetailError = (s) => s.userleave.detailError
export const selectUserLeaveUpdating = (s) => s.userleave.updating
export const selectUserLeaveUpdateError = (s) => s.userleave.updateError
export const selectUserLeaveDeleting = (s) => s.userleave.deleting
export const selectUserLeaveDeleteError = (s) => s.userleave.deleteError
export const selectUserLeaveBalance = (s) => s.userleave.leaveBalance
export const selectUserLeaveBalanceLoading = (s) => s.userleave.balanceLoading
export const selectUserLeaveBalanceError = (s) => s.userleave.balanceError

export default userleaveSlice.reducer