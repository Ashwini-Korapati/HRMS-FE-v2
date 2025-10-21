import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  fetchWorkShifts, 
  deleteWorkShift,
  selectWorkShifts,
  selectWorkShiftsListLoading,
  selectWorkShiftsListError,
  selectWorkShiftDeleting,
  selectWorkShiftSuccessMessage,
  clearErrors,
  clearSuccessMessage
} from '../../Redux/Public/WorkShiftsSlice'
import CreateWorkShiftForm from '../../components/Forms/CreateWorkShiftForm'
import EditWorkShiftForm from '../../components/Forms/EditWorkShiftForm'

export default function WorkShiftsPage() {
  const dispatch = useDispatch()
  const shifts = useSelector(selectWorkShifts)
  const loading = useSelector(selectWorkShiftsListLoading)
  const error = useSelector(selectWorkShiftsListError)
  const deleting = useSelector(selectWorkShiftDeleting)
  const successMessage = useSelector(selectWorkShiftSuccessMessage)
  
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingShift, setEditingShift] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    dispatch(fetchWorkShifts())
  }, [dispatch])

  useEffect(() => {
    if (successMessage) {
      setShowSuccess(true)
      const timer = setTimeout(() => {
        setShowSuccess(false)
        dispatch(clearSuccessMessage())
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [successMessage, dispatch])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearErrors())
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, dispatch])

  const handleDelete = async (shiftId) => {
    if (window.confirm('Are you sure you want to delete this work shift?')) {
      setDeletingId(shiftId)
      await dispatch(deleteWorkShift(shiftId))
      setDeletingId(null)
    }
  }

  const handleEdit = (shift) => {
    setEditingShift(shift)
  }

  const handleCloseForm = () => {
    setShowCreateForm(false)
    setEditingShift(null)
  }

  if (loading === 'idle' || loading === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-7 bg-gray-200 rounded w-48 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                  <div className="h-5 bg-gray-200 rounded w-32 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Work Shifts</h1>
              <p className="text-gray-600 text-xs mt-1">Manage employee work schedules</p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-gradient-to-r from-[#CA3500] to-[#FF6900] text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-sm font-medium flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Create Shift</span>
            </button>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && successMessage && (
          <div className="mb-4 animate-in slide-in-from-top duration-300">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-green-700 text-sm font-medium flex-1">{successMessage}</p>
                <button
                  onClick={() => setShowSuccess(false)}
                  className="text-green-600 hover:text-green-800"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 animate-in slide-in-from-top duration-300">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-700 text-sm font-medium flex-1">{error}</p>
                <button
                  onClick={() => dispatch(clearErrors())}
                  className="text-red-600 hover:text-red-800"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Forms */}
        {showCreateForm && (
          <div className="mb-4 animate-in slide-in-from-top duration-300">
            <CreateWorkShiftForm 
              onSuccess={handleCloseForm}
              onCancel={handleCloseForm}
            />
          </div>
        )}

        {editingShift && (
          <div className="mb-4 animate-in slide-in-from-top duration-300">
            <EditWorkShiftForm 
              shift={editingShift}
              onSuccess={handleCloseForm}
              onCancel={handleCloseForm}
            />
          </div>
        )}

        {/* Shifts Grid */}
        {!showCreateForm && !editingShift && (
          <div className="animate-in fade-in duration-300">
            {shifts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">No work shifts</h3>
                <p className="text-gray-500 text-sm mb-4 max-w-md mx-auto">
                  Create your first work shift to manage schedules.
                </p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-4 py-2 bg-gradient-to-r from-[#CA3500] to-[#FF6900] text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-sm font-medium"
                >
                  Create First Shift
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {shifts.map((shift, index) => (
                  <div 
                    key={shift.id} 
                    className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:scale-105 animate-in fade-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${index * 75}ms` }}
                  >
                    <div className="p-4">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className={`p-1.5 rounded-lg ${shift.isDefault ? 'bg-green-100' : 'bg-orange-100'}`}>
                            <svg className={`w-4 h-4 ${shift.isDefault ? 'text-green-600' : 'text-orange-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-sm flex items-center">
                              {shift.name}
                              {shift.isDefault && (
                                <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Default
                                </span>
                              )}
                            </h3>
                            <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{shift.description}</p>
                          </div>
                        </div>
                      </div>

                      {/* Shift Details */}
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Time</span>
                          <span className="font-medium text-gray-900">
                            {shift.defaultStart} - {shift.defaultEnd}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Grace</span>
                          <span className="font-medium text-gray-900">{shift.graceMinutes}m</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Break</span>
                          <span className="font-medium text-gray-900">{shift.breakMinutes}m</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Timezone</span>
                          <span className="font-medium text-gray-900 text-xs">{shift.timeZone}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <button
                          onClick={() => handleEdit(shift)}
                          className="px-3 py-1.5 text-blue-600 hover:text-blue-800 text-xs font-medium transition-colors duration-200 hover:bg-blue-50 rounded-lg"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(shift.id)}
                          disabled={deleting === 'loading' && deletingId === shift.id}
                          className="px-3 py-1.5 text-red-600 hover:text-red-800 text-xs font-medium transition-colors duration-200 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deleting === 'loading' && deletingId === shift.id ? (
                            <span className="flex items-center space-x-1">
                              <svg className="animate-spin h-3 w-3 text-red-600" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Deleting</span>
                            </span>
                          ) : (
                            'Delete'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}