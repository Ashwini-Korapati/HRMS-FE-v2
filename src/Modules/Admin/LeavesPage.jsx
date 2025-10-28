
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { PageHeading } from './components'
import LeaveTypesManagement from '../Admin/LeaveTypesManagement' // Import the management component
import { 
  fetchLeaveTypes, 
  selectLeaveTypes, 
  selectLeaveTypesListLoading, 
  selectLeaveTypesListError 
} from '../../Redux/Public/leaveTypesSlice'
import { CheckCircle, XCircle, Calendar, RefreshCw } from 'lucide-react'
import { toAssetUrl } from '../../config/config'
import { 
  fetchPendingApprovals, 
  fetchApprovedApprovals,
  fetchRejectedApprovals,
  approveLeave, 
  rejectLeave, 
  selectPendingApprovals, 
  selectApprovalsLoading, 
  selectApprovalsError, 
  selectApprovedApprovals,
  selectRejectedApprovals,
  selectApprovedLoading,
  selectRejectedLoading,
  selectApprovedError,
  selectRejectedError,
  selectApprovingMap, 
  selectRejectingMap 
} from '../../Redux/Public/leaveApprovalsSlice'

const LEAVE_TYPE_OPTIONS = [
  { value: 'ANNUAL', label: 'Annual Leave' },
  { value: 'SICK', label: 'Sick Leave' },
  { value: 'CASUAL', label: 'Casual Leave' },
  { value: 'MATERNITY', label: 'Maternity Leave' },
  { value: 'PATERNITY', label: 'Paternity Leave' },
  { value: 'BEREAVEMENT', label: 'Bereavement Leave' },
  { value: 'COMPENSATORY', label: 'Compensatory Leave' },
  { value: 'SABBATICAL', label: 'Sabbatical Leave' },
]

// Safe selector functions to prevent errors
const safeSelectLeaveTypes = (state) => {
  try {
    return selectLeaveTypes(state) || []
  } catch (error) {
    console.error('Error selecting leave types:', error)
    return []
  }
}

const safeSelectLeaveTypesListLoading = (state) => {
  try {
    return selectLeaveTypesListLoading(state) || 'idle'
  } catch (error) {
    console.error('Error selecting loading state:', error)
    return 'idle'
  }
}

const safeSelectLeaveTypesListError = (state) => {
  try {
    return selectLeaveTypesListError(state) || null
  } catch (error) {
    console.error('Error selecting error state:', error)
    return null
  }
}

// (SmartApprovalSwitchCard removed: history now uses smart table view)

export default function LeavesPage() {
  const dispatch = useDispatch()
  const auth = useSelector(state => state.auth)
  const companyId = auth?.company?.id
  const userId = auth?.user?.id
  const designationId = auth?.user?.designationId || auth?.user?.designation?.id || auth?.user?.designationParentId
  const [recentLiveEvents, setRecentLiveEvents] = React.useState([])
  const [historyTab, setHistoryTab] = React.useState('approved') // 'approved' | 'rejected'
  //
  
  // Use safe selectors
  const leaveTypes = useSelector(safeSelectLeaveTypes)
  const loadingList = useSelector(safeSelectLeaveTypesListLoading)
  const listError = useSelector(safeSelectLeaveTypesListError)

  // Pending approvals state
  const pending = useSelector(selectPendingApprovals)
  const approvalsLoading = useSelector(selectApprovalsLoading)
  const approvalsError = useSelector(selectApprovalsError)
  // Approved/Rejected history state
  const approved = useSelector(selectApprovedApprovals)
  const rejected = useSelector(selectRejectedApprovals)
  const approvedLoading = useSelector(selectApprovedLoading)
  const rejectedLoading = useSelector(selectRejectedLoading)
  const approvedError = useSelector(selectApprovedError)
  const rejectedError = useSelector(selectRejectedError)
  const approvingMap = useSelector(selectApprovingMap)
  const rejectingMap = useSelector(selectRejectingMap)

  useEffect(() => {
    console.log('LeavesPage mounted, fetching leave types...')
    try {
      dispatch(fetchLeaveTypes())
    } catch (error) {
      console.error('Error dispatching fetchLeaveTypes:', error)
    }
  }, [dispatch])

  useEffect(() => {
    if (companyId && userId && designationId) {
      dispatch(fetchPendingApprovals({ companyId, userId, designationId }))
    }
  }, [dispatch, companyId, userId, designationId])

  // Fetch history when tab changes
  useEffect(() => {
    if (!companyId || !userId || !designationId) return
    if (historyTab === 'approved') {
      dispatch(fetchApprovedApprovals({ companyId, userId, designationId }))
    } else if (historyTab === 'rejected') {
      dispatch(fetchRejectedApprovals({ companyId, userId, designationId }))
    }
  }, [historyTab, companyId, userId, designationId, dispatch])

  // Live socket subscription for leave events
  useEffect(() => {
    if (!companyId || !designationId) {
      console.log('[LeavesPage] Missing companyId or designationId:', { companyId, designationId })
      return
    }
    try {
      const { getSocket } = require('../../Redux/Public/notificationsSocket')
      const s = getSocket()
      if (!s) {
        console.log('[LeavesPage] Socket not available')
        return
      }
      console.log('[LeavesPage] Socket connected:', s.connected, 'id:', s.id)
      
      const onNotification = (evt) => {
        const type = evt?.type
        if (!type || !['leave.created','leave.approved','leave.rejected'].includes(type)) return
        
        // Match if event is for my company OR my designation path
        const matchCompany = evt.companyId && String(evt.companyId) === String(companyId)
        const matchDesignation = evt.designationParentId && String(evt.designationParentId) === String(designationId)
        
        // Accept if either company or designation matches
        if (!matchCompany && !matchDesignation) return
        
        console.log('[LeavesPage] Received leave event:', {
          type,
          leaveId: evt.leaveId,
          userId: evt.userId,
          companyId: evt.companyId,
          designationParentId: evt.designationParentId,
          matchCompany,
          matchDesignation
        })
        
        setRecentLiveEvents(prev => {
          // Generate unique ID with timestamp to avoid duplicates
          const uniqueId = evt.id || `${type}:${evt.leaveId}:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`
          
          // Check if this exact event already exists to prevent duplicates
          const exists = prev.some(e => 
            e.type === type && 
            e.leaveId === evt.leaveId && 
            e.userId === evt.userId &&
            Math.abs(new Date(e.at).getTime() - new Date(evt.at || evt.timestamp || new Date()).getTime()) < 1000
          )
          
          if (exists) {
            console.log('[LeavesPage] Duplicate event detected, skipping')
            return prev
          }
          
          return ([{
            id: uniqueId,
            type,
            userId: evt.userId,
            leaveId: evt.leaveId,
            at: evt.at || evt.timestamp || new Date().toISOString(),
            message: evt.message,
          }, ...prev]).slice(0, 25)
        })
        
        // Reflect status change in user leave history slice when approved/rejected
        try {
          if (['leave.approved','leave.rejected'].includes(type) && evt.leaveId) {
            const { applyLeaveEvent } = require('../../Redux/Public/UserleaveSlice')
            const newStatus = type === 'leave.approved' ? 'APPROVED' : 'REJECTED'
            dispatch(applyLeaveEvent({ leaveId: evt.leaveId, status: newStatus, at: evt.at || evt.timestamp }))
            // Refresh pending approvals snapshot to reflect changes
            if (companyId && userId && designationId) {
              dispatch(fetchPendingApprovals({ companyId, userId, designationId }))
            }
          }
          if (type === 'leave.created') {
            // Newly created leave might add to approver's pending list
            if (companyId && userId && designationId) {
              dispatch(fetchPendingApprovals({ companyId, userId, designationId }))
            }
          }
        } catch {}
      }
      s.off('notification', onNotification).on('notification', onNotification)
      return () => { try { s.off('notification', onNotification) } catch {} }
    } catch (err) {
      console.error('[LeavesPage] Socket setup error:', err)
    }
  }, [companyId, designationId, userId, dispatch])

  const getStatusBadge = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800 border border-green-200'
      : 'bg-gray-100 text-gray-600 border border-gray-200'
  }

  const getStatusIcon = (isActive) =>
    isActive ? (
      <CheckCircle className="text-green-500 w-4 h-4" />
    ) : (
      <XCircle className="text-amber-500 w-4 h-4" />
    )

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      return 'Invalid Date'
    }
  }

  const handleRetry = () => {
    try {
      dispatch(fetchLeaveTypes())
    } catch (error) {
      console.error('Error retrying fetch:', error)
    }
  }

  // Debug info
  console.log('LeavesPage render state:', {
    leaveTypesCount: leaveTypes?.length || 0,
    loadingList,
    listError
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <PageHeading 
          title="Leaves Management" 
          subtitle="Manage leave types, policies, and employee leave requests"
        />
        
        {/* Leave Types Management Section with Create Button */}
        <LeaveTypesManagement />

        {/* Leave Types Display Section (Read-only view) */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Available Leave Types</h3>
            <button
              onClick={handleRetry}
              disabled={loadingList === 'loading'}
              className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loadingList === 'loading' ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {loadingList === 'loading' ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-[#F97316] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div className="text-gray-600 mt-2">Loading leave types...</div>
            </div>
          ) : listError ? (
            <div className="p-6 text-center text-rose-600">
              <div className="font-medium mb-2">Error loading leave types</div>
              <div className="text-sm mb-4">{listError}</div>
              <button
                onClick={handleRetry}
                className="px-4 py-2 text-sm bg-rose-100 text-rose-700 rounded hover:bg-rose-200"
              >
                Try Again
              </button>
            </div>
          ) : !leaveTypes || leaveTypes.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <div className="text-lg font-medium mb-1">No Leave Types</div>
              <div className="text-sm">No leave types have been configured yet.</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Leave Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Max Days/Year</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Carry Forward</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Max Carry Forward</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Created</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y">
                  {leaveTypes.map(leaveType => (
                    <tr key={leaveType.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{leaveType.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {LEAVE_TYPE_OPTIONS.find(lt => lt.value === leaveType.type)?.label || leaveType.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {leaveType.maxDaysPerYear} days
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {leaveType.carryForward ? 'Yes' : 'No'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {leaveType.carryForward ? `${leaveType.maxCarryForward} days` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(leaveType.isActive)}`}>
                          {getStatusIcon(leaveType.isActive)} {leaveType.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(leaveType.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Coming Soon Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Leave Requests Section */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave Requests</h3>
            <div className="text-sm text-gray-700 space-y-2">
              <p>Leave requests management interface will be implemented here.</p>
              <p className="text-gray-500">
                Future enhancement: View, approve/reject leave requests with calendar integration.
              </p>
            </div>
          </div>
          
          {/* Leave Balance Section */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave Balance</h3>
            <div className="text-sm text-gray-700 space-y-2">
              <p>Employee leave balance tracking will be displayed here.</p>
              <p className="text-gray-500">
                Future enhancement: Track remaining leaves and usage patterns.
              </p>
            </div>
          </div>
        </div>

        {/* Recent Leave Requests (table) */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Leave Requests</h3>
          </div>
          <div className="p-6">
            {approvalsLoading === 'loading' ? (
              <div className="animate-pulse">
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : approvalsError ? (
              <div className="text-center text-rose-600">{approvalsError}</div>
            ) : !pending || pending.length === 0 ? (
              <div className="text-center py-4 text-sm text-gray-500">No recent leave requests</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Dates</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Days</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Reason</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y">
                    {pending.map(req => (
                      <tr key={req.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.userId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.leaveType?.name || req.leaveTypeId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                          {req.isHalfDay ? ' (Half day)' : ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.totalDays}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate" title={req.reason}>{req.reason}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => dispatch(approveLeave({ companyId, userId, designationId, leaveId: req.id }))}
                              disabled={!!approvingMap[req.id]}
                              className="px-3 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50"
                            >Approve</button>
                            <button
                              onClick={() => dispatch(rejectLeave({ companyId, userId, designationId, leaveId: req.id }))}
                              disabled={!!rejectingMap[req.id]}
                              className="px-3 py-1 rounded bg-rose-100 text-rose-700 hover:bg-rose-200 disabled:opacity-50"
                            >Reject</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Smart Switch Cards for Leave History */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Leave History</h3>
            {/* History filter switch (Approved/Rejected only) */}
            <div className="inline-flex rounded-full border border-gray-200 bg-gray-50 p-1 text-sm">
              {['approved','rejected'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setHistoryTab(tab)}
                  className={`px-3 py-1.5 rounded-full capitalize transition ${historyTab === tab ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  {tab}
                  {tab === 'approved' && approved?.length ? ` (${approved.length})` : ''}
                  {tab === 'rejected' && rejected?.length ? ` (${rejected.length})` : ''}
                </button>
              ))}
            </div>
          </div>
          <div className="p-6">
            {/* Resolve arrays and loading based on selected tab (Approved/Rejected) */}
            {(() => {
              const loading = historyTab === 'approved' ? approvedLoading : rejectedLoading
              const error = historyTab === 'approved' ? approvedError : rejectedError
              const items = historyTab === 'approved' ? approved : rejected
              if (loading === 'loading') {
                return (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
                    ))}
                  </div>
                )
              }
              if (error) return <div className="text-center text-rose-600">{error}</div>
              if (!items || items.length === 0) {
                const empty = historyTab === 'approved' ? 'No approved leave history' : 'No rejected leave history'
                return <div className="text-center py-4 text-sm text-gray-500">{empty}</div>
              }

              // fixed width smart table
              return (
                <div className="overflow-x-auto">
                  <table className="min-w-full table-fixed border-separate border-spacing-0">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider w-[280px]">Employee</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider w-[140px]">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider w-[220px]">Dates</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider w-[80px]">Days</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider w-[260px]">Reason</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider w-[140px]">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider w-[170px]">Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((req, idx) => {
                        const fullName = `${req?.user?.firstName || ''} ${req?.user?.lastName || ''}`.trim() || (req.userId || '-')
                        const email = req?.user?.email || ''
                        const avatar = toAssetUrl(req?.user?.avatar || '')
                        const typeName = req?.leaveType?.name || req?.leaveTypeId || '-'
                        const status = req?.status || (historyTab === 'approved' ? 'APPROVED' : 'REJECTED')
                        const updated = req?.approvedDate || req?.rejectedDate || req?.updatedAt || req?.appliedDate
                        const isApproved = status === 'APPROVED'
                        return (
                          <tr key={req.id} className={`group transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-slate-100`}>
                            {/* Employee */}
                            <td className="px-4 py-3 align-middle">
                              <div className="flex items-center gap-3 min-w-0">
                                <img src={avatar} alt={fullName} className="h-9 w-9 rounded-full object-cover border border-gray-200 shadow-sm" />
                                <div className="min-w-0">
                                  <div className="text-sm font-medium text-gray-900 truncate">{fullName}</div>
                                  <div className="text-xs text-gray-500 truncate" title={email}>{email}</div>
                                </div>
                              </div>
                            </td>
                            {/* Type */}
                            <td className="px-4 py-3 align-middle">
                              <div className="text-sm text-gray-900 truncate">{typeName}</div>
                            </td>
                            {/* Dates */}
                            <td className="px-4 py-3 align-middle">
                              <div className="text-sm text-gray-900 whitespace-nowrap">
                                {new Date(req.startDate).toLocaleDateString()} – {new Date(req.endDate).toLocaleDateString()}
                                {req.isHalfDay ? <span className="text-xs text-gray-500"> (Half)</span> : null}
                              </div>
                            </td>
                            {/* Days */}
                            <td className="px-4 py-3 align-middle text-center">
                              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-medium w-[48px]">{req.totalDays}</span>
                            </td>
                            {/* Reason */}
                            <td className="px-4 py-3 align-middle">
                              <div className="text-sm text-gray-900 truncate" title={req.reason}>{req.reason || '—'}</div>
                            </td>
                            {/* Status */}
                            <td className="px-4 py-3 align-middle">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${isApproved ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-rose-100 text-rose-700 border border-rose-200'}`}>
                                {isApproved ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                {isApproved ? 'Approved' : 'Rejected'}
                              </span>
                            </td>
                            {/* Updated */}
                            <td className="px-4 py-3 align-middle">
                              <div className="text-sm text-gray-900 whitespace-nowrap">{updated ? new Date(updated).toLocaleString() : '-'}</div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )
            })()}
          </div>
        </div>

        {/* Live events from socket */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mt-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Live Leave Activity</h3>
          </div>
          <div className="p-6">
            {recentLiveEvents.length === 0 ? (
              <div className="text-sm text-gray-500">No recent activity.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Event</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Leave</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">At</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y">
                    {recentLiveEvents.map(e => (
                      <tr key={e.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-3 text-sm text-gray-900">{e.type.replace('leave.','')}</td>
                        <td className="px-6 py-3 text-sm text-gray-900">{e.userId}</td>
                        <td className="px-6 py-3 text-sm text-gray-900">{e.leaveId || '-'}</td>
                        <td className="px-6 py-3 text-sm text-gray-900">{new Date(e.at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}