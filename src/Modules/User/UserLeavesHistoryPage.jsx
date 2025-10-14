import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { PageHeading, PlaceholderPanel, TableSkeleton } from './components'
import { 
  fetchLeaves, 
  selectUserLeaves, 
  selectUserLeavesListLoading, 
  selectUserLeavesListError 
} from '../../Redux/Public/UserleaveSlice'
import { Calendar, Clock, CheckCircle, XCircle, Clock4, Filter, Search, RefreshCw } from 'lucide-react'

const STATUS_CONFIG = {
  PENDING: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock4, label: 'Pending' },
  APPROVED: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, label: 'Approved' },
  REJECTED: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, label: 'Rejected' }
}

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING
  const IconComponent = config.icon
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      <IconComponent className="w-3 h-3" />
      {config.label}
    </span>
  )
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function formatDateTime(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function UserLeavesHistoryPage() {
  const dispatch = useDispatch()
  const leaves = useSelector(selectUserLeaves)
  const loading = useSelector(selectUserLeavesListLoading)
  const error = useSelector(selectUserLeavesListError)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [dateFilter, setDateFilter] = useState('ALL')

  useEffect(() => {
    dispatch(fetchLeaves())
  }, [dispatch])

  const handleRetry = () => {
    dispatch(fetchLeaves())
  }

  const handleRefresh = () => {
    dispatch(fetchLeaves())
  }

  // Filter leaves based on search term and filters
  const filteredLeaves = leaves.filter(leave => {
    const matchesSearch = 
      leave.leaveType?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.id?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || leave.status === statusFilter
    const matchesDate = dateFilter === 'ALL' // Add date range filtering logic here if needed
    
    return matchesSearch && matchesStatus && matchesDate
  })

  const getStatusCounts = () => {
    const counts = { ALL: leaves.length }
    leaves.forEach(leave => {
      counts[leave.status] = (counts[leave.status] || 0) + 1
    })
    return counts
  }

  const statusCounts = getStatusCounts()

  if (loading === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          <PageHeading title="Leave History" subtitle="All past leave applications" />
          <TableSkeleton columns={['Ref', 'Type', 'From', 'To', 'Days', 'Status', 'Applied On', 'Actions']} />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          <PageHeading title="Leave History" subtitle="All past leave applications" />
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="text-rose-600 mb-4">
              <XCircle className="w-12 h-12 mx-auto mb-3" />
              <div className="font-medium text-lg">Error loading leave history</div>
              <div className="text-sm mt-1">{error}</div>
            </div>
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <PageHeading title="Leave History" subtitle="All past leave applications" />
        
        {/* Stats and Filters Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold text-gray-900">Leave Applications</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Total: {leaves.length} applications</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by type, reason, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">All Status ({statusCounts.ALL})</option>
                <option value="PENDING">Pending ({statusCounts.PENDING || 0})</option>
                <option value="APPROVED">Approved ({statusCounts.APPROVED || 0})</option>
                <option value="REJECTED">Rejected ({statusCounts.REJECTED || 0})</option>
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Period
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">All Time</option>
                <option value="THIS_MONTH">This Month</option>
                <option value="LAST_MONTH">Last Month</option>
                <option value="THIS_YEAR">This Year</option>
              </select>
            </div>
          </div>

          {/* Status Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{statusCounts.ALL || 0}</div>
              <div className="text-sm text-blue-800">Total</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{statusCounts.PENDING || 0}</div>
              <div className="text-sm text-yellow-800">Pending</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{statusCounts.APPROVED || 0}</div>
              <div className="text-sm text-green-800">Approved</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{statusCounts.REJECTED || 0}</div>
              <div className="text-sm text-red-800">Rejected</div>
            </div>
          </div>
        </div>

        {/* Leaves Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {filteredLeaves.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <div className="text-lg font-medium mb-1">
                {searchTerm || statusFilter !== 'ALL' ? 'No matching leaves found' : 'No Leave Applications'}
              </div>
              <div className="text-sm">
                {searchTerm || statusFilter !== 'ALL' 
                  ? 'Try adjusting your search terms or filters' 
                  : 'You haven\'t applied for any leaves yet.'
                }
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ref ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied On</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLeaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-900">{leave.id.slice(0, 8)}...</div>
                        <div className="text-xs text-gray-500">Ref</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{leave.leaveType?.name}</div>
                        <div className="text-xs text-gray-500 capitalize">{leave.leaveType?.type?.toLowerCase()}</div>
                        {leave.isHalfDay && (
                          <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            Half Day
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(leave.startDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(leave.endDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                        {leave.totalDays} day{leave.totalDays !== '1' ? 's' : ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={leave.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(leave.appliedDate || leave.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 transition-colors">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Results Count */}
        {filteredLeaves.length > 0 && (
          <div className="text-sm text-gray-500 text-center">
            Showing {filteredLeaves.length} of {leaves.length} leave applications
          </div>
        )}
      </div>
    </div>
  )
}