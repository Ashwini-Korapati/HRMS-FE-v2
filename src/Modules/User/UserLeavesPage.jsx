import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { PageHeading, PlaceholderPanel, TableSkeleton } from './components'
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

  const pending = useSelector(selectPendingApprovals)
  const loading = useSelector(selectApprovalsLoading)
  const error = useSelector(selectApprovalsError)
  const approving = useSelector(selectApprovingMap)
  const rejecting = useSelector(selectRejectingMap)

  useEffect(() => {
    if (companyId && userId && designationId) {
      dispatch(fetchPendingApprovals({ companyId, userId, designationId }))
    }
  }, [dispatch, companyId, userId, designationId])

  return (
    <div>
      <PageHeading title="My Leaves" subtitle="Leave balances and requests" />
      <PlaceholderPanel title="Balances">Leave balance cards placeholder.</PlaceholderPanel>
      <div className="mt-6">
        <TableSkeleton columns={['Type','Period','Days','Status','Applied On']} />
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
