
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

export default function LeavesPage() {
  const dispatch = useDispatch()
  
  // Use safe selectors
  const leaveTypes = useSelector(safeSelectLeaveTypes)
  const loadingList = useSelector(safeSelectLeaveTypesListLoading)
  const listError = useSelector(safeSelectLeaveTypesListError)

  useEffect(() => {
    console.log('LeavesPage mounted, fetching leave types...')
    try {
      dispatch(fetchLeaveTypes())
    } catch (error) {
      console.error('Error dispatching fetchLeaveTypes:', error)
    }
  }, [dispatch])

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

        {/* Recent Leave Requests Skeleton */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Leave Requests</h3>
          </div>
          <div className="p-6">
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
            <div className="text-center py-4 text-sm text-gray-500">
              Leave requests table will be implemented soon
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}