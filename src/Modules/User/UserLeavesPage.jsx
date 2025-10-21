import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { PageHeading, TableSkeleton } from './components'
import {
  fetchLeaveBalance,
  selectUserLeaveBalance,
  selectUserLeaveBalanceLoading,
  selectUserLeaveBalanceError,
} from '../../Redux/Public/UserleaveSlice'
import {
  fetchPendingApprovals,
  approveLeave,
  rejectLeave,
  selectPendingApprovals,
  selectApprovalsLoading,
  selectApprovalsError,
  selectApprovingMap,
  selectRejectingMap,
} from '../../Redux/Public/leaveApprovalsSlice'

export default function UserLeavesPage() {
  const dispatch = useDispatch()
  const auth = useSelector(state => state.auth)
  const companyId = auth?.company?.id
  const userId = auth?.user?.id
  const designationId = auth?.user?.designationId || auth?.user?.designation?.id || auth?.user?.designationParentId
  const parentDesignationId = auth?.user?.designationParentId || auth?.user?.designation?.parentId || designationId
  const [liveEvents, setLiveEvents] = React.useState([])

  const pending = useSelector(selectPendingApprovals)
  const loading = useSelector(selectApprovalsLoading)
  const error = useSelector(selectApprovalsError)
  const approving = useSelector(selectApprovingMap)
  const rejecting = useSelector(selectRejectingMap)

  // Leave balance state
  const leaveBalance = useSelector(selectUserLeaveBalance)
  const balanceLoading = useSelector(selectUserLeaveBalanceLoading)
  const balanceError = useSelector(selectUserLeaveBalanceError)

  useEffect(() => {
    if (companyId && userId && designationId) {
      dispatch(fetchPendingApprovals({ companyId, userId, designationId }))
    }
  }, [dispatch, companyId, userId, designationId])

  useEffect(() => {
    if (companyId && userId) {
      dispatch(fetchLeaveBalance())
    }
  }, [dispatch, companyId, userId])

  // Subscribe to live leave events via notifications socket
  useEffect(() => {
    try {
      const { getSocket } = require('../../Redux/Public/notificationsSocket')
      const s = getSocket()
      if (!s) return
      const onNotification = (evt) => {
        const type = evt?.type
        if (!type || !['leave.created','leave.approved','leave.rejected'].includes(type)) return
        const matchCompany = evt.companyId && String(evt.companyId) === String(companyId)
        const matchDesignation = evt.designationParentId && String(evt.designationParentId) === String(parentDesignationId)
        if (!matchCompany && !matchDesignation) return
        setLiveEvents(prev => ([{
          id: evt.id || `${type}:${evt.leaveId || evt.at || Date.now()}`,
          type,
          userId: evt.userId,
          leaveId: evt.leaveId,
          at: evt.at || new Date().toISOString(),
          reason: evt.reason,
        }, ...prev]).slice(0, 25))
        // Reflect status change for current user's history immediately
        try {
          if (['leave.approved','leave.rejected'].includes(type) && evt.leaveId) {
            const { applyLeaveEvent } = require('../../Redux/Public/UserleaveSlice')
            const newStatus = type === 'leave.approved' ? 'APPROVED' : 'REJECTED'
            dispatch(applyLeaveEvent({ leaveId: evt.leaveId, status: newStatus, at: evt.at || evt.timestamp }))
          }
        } catch {}
      }
      s.off('notification', onNotification).on('notification', onNotification)
      return () => { try { s.off('notification', onNotification) } catch {} }
    } catch {}
  }, [companyId, parentDesignationId, dispatch])

  return (
    <div>
      <PageHeading title="My Leaves" subtitle="Leave balances and requests" />
      {/* Live Recent Leave Requests */}
      <div className="mt-2">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Leave Requests (Live)</h3>
        {liveEvents.length === 0 ? (
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
                {liveEvents.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{e.type.replace('leave.','')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{e.userId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{e.leaveId || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(e.at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Leave Balance */}
      <div className="mt-2">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Leave Balance {leaveBalance?.year ? `(${leaveBalance.year})` : ''}</h3>

        {balanceLoading === 'loading' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-4 rounded-lg border border-gray-200 bg-white animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : balanceError ? (
          <div className="text-sm text-rose-600">{balanceError}</div>
        ) : leaveBalance?.summary ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border border-gray-200 bg-white">
              <div className="text-sm text-gray-500">Entitlement</div>
              <div className="mt-1 text-2xl font-semibold text-gray-900">{leaveBalance.summary.totalEntitlement}</div>
              <div className="text-xs text-gray-500 mt-1">Allowance {leaveBalance.summary.totalAllowance} + Carried {leaveBalance.summary.totalCarried}</div>
            </div>
            <div className="p-4 rounded-lg border border-gray-200 bg-white">
              <div className="text-sm text-gray-500">Used (Approved)</div>
              <div className="mt-1 text-2xl font-semibold text-gray-900">{leaveBalance.summary.totalUsedApproved}</div>
              <div className="text-xs text-gray-500 mt-1">Pending {leaveBalance.summary.totalUsedPending}</div>
            </div>
            <div className="p-4 rounded-lg border border-gray-200 bg-white">
              <div className="text-sm text-gray-500">Used (Total)</div>
              <div className="mt-1 text-2xl font-semibold text-gray-900">{leaveBalance.summary.totalUsed}</div>
            </div>
            <div className="p-4 rounded-lg border border-gray-200 bg-white">
              <div className="text-sm text-gray-500">Remaining</div>
              <div className="mt-1 text-2xl font-semibold text-gray-900">{leaveBalance.summary.totalRemaining}</div>
            </div>
          </div>
        ) : null}

        {/* Per-type breakdown */}
        <div className="mt-6">
          {balanceLoading === 'loading' ? (
            <TableSkeleton columns={['Type','Allowance','Carried','Used (Appr/Pend/Total)','Remaining','Unlimited']} />
          ) : balanceError ? null : !leaveBalance?.items || leaveBalance.items.length === 0 ? (
            <div className="text-sm text-gray-500">No leave balance items.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Allowance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Carried</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Used (A/P/T)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Remaining</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Unlimited</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y">
                  {leaveBalance.items.map((it) => (
                    <tr key={it.leaveTypeId} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="font-medium">{it.name}</div>
                        <div className="text-xs text-gray-500">{it.type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{it.allowance}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{it.carriedForward}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{it.usedApproved}/{it.usedPending}/{it.usedTotal}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{it.remaining}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{it.isUnlimited ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Pending approvals for approvers */}
      {designationId && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Pending Approvals</h3>
          {loading === 'loading' ? (
            <TableSkeleton columns={['Employee','Type','Dates','Days','Reason','Actions']} />
          ) : error ? (
            <div className="text-sm text-rose-600">{error}</div>
          ) : !pending || pending.length === 0 ? (
            <div className="text-sm text-gray-500">No pending leave approvals</div>
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
                            disabled={!!approving[req.id]}
                            className="px-3 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50"
                          >Approve</button>
                          <button
                            onClick={() => dispatch(rejectLeave({ companyId, userId, designationId, leaveId: req.id }))}
                            disabled={!!rejecting[req.id]}
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
      )}
    </div>
  )
}
