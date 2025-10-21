import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Calendar, Clock, AlertCircle, CheckCircle2, ChevronDown } from 'lucide-react'
import { 
  createLeave, 
  selectUserLeaveCreating, 
  selectUserLeaveCreateError,
  selectUserLeaveBalance,
  fetchLeaveBalance,
  selectUserLeaveBalanceLoading,
  resetUserLeaveState,
  fetchUserLeaveTypes,
  selectUserLeaveTypes,
  selectUserLeaveTypesLoading,
  selectUserLeaveTypesError
} from '../../Redux/Public/UserleaveSlice'

const blankForm = {
  leaveTypeId: '',
  startDate: '',
  endDate: '',
  reason: '',
  isHalfDay: false
}

function Input({ label, error, required, className = "", ...props }) {
  return (
    <label className="flex flex-col gap-1.5 w-full">
      <span className="text-sm font-medium text-gray-800">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <input
        {...props}
        className={`w-full bg-white border rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-500 
          outline-none transition-all duration-200 
          focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 
          ${error 
            ? "border-rose-500 focus:ring-rose-500/30" 
            : "border-gray-300 hover:border-blue-500/50"
          } ${className}`}
      />
      {error && <span className="text-xs text-rose-500 mt-0.5">{error}</span>}
    </label>
  )
}

// Select component not used; custom dropdown and simple select are defined below

function TextArea({ label, error, required, className = "", ...props }) {
  return (
    <label className="flex flex-col gap-1.5 w-full">
      <span className="text-sm font-medium text-gray-800">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <textarea
        {...props}
        className={`w-full bg-white border rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-500 
          outline-none transition-all duration-200 min-h-[100px] resize-vertical
          focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 
          ${error 
            ? "border-rose-500 focus:ring-rose-500/30" 
            : "border-gray-300 hover:border-blue-500/50"
          } ${className}`}
      />
      {error && <span className="text-xs text-rose-500 mt-0.5">{error}</span>}
    </label>
  )
}

function Checkbox({ label, checked, onChange, className = "" }) {
  return (
    <label className={`flex items-center gap-2 cursor-pointer ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
      />
      <span className="text-sm text-gray-800">{label}</span>
    </label>
  )
}

// Fixed Custom Dropdown Component
function LeaveTypeDropdown({ 
  label, 
  error, 
  required, 
  value, 
  onChange, 
  onBlur, 
  userLeaveTypes,
  leaveBalance,
  className = "" 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const getLeaveBalanceForType = (leaveTypeId) => {
    if (!leaveTypeId) return 0
    const leaveType = userLeaveTypes.find(lt => (lt.leaveTypeId || lt.id) === leaveTypeId)
    if (!leaveType) return 0
    // Prefer API-provided remaining when available; fallback to legacy balance by type
    if (typeof leaveType.remaining === 'number') return leaveType.remaining
    if (leaveBalance && leaveType.type) return leaveBalance[leaveType.type] || 0
    return 0
  }

  const getBalanceColor = (leaveTypeId) => {
    const balance = getLeaveBalanceForType(leaveTypeId)
    if (balance > 10) return 'text-green-600'
    if (balance > 5) return 'text-blue-600'
    if (balance > 0) return 'text-orange-600'
    return 'text-red-600'
  }

  const selectedLeaveType = userLeaveTypes.find(lt => (lt.leaveTypeId || lt.id) === value)

  const handleSelect = (leaveTypeId) => {
    onChange(leaveTypeId)
    setIsOpen(false)
    onBlur?.()
  }

  return (
    <label className="flex flex-col gap-1.5 w-full">
      <span className="text-sm font-medium text-gray-800">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full bg-white border rounded-lg px-4 py-2.5 text-left text-gray-900 
            outline-none transition-all duration-200 flex items-center justify-between
            focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
            ${error 
              ? "border-rose-500 focus:ring-rose-500/30" 
              : "border-gray-300 hover:border-blue-500/50"
            } ${isOpen ? 'ring-2 ring-blue-500/40 border-blue-500' : ''}
            ${className}`}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
              {selectedLeaveType ? (
              <>
                <span className="font-medium truncate">{selectedLeaveType.name}</span>
                <span className={`text-xs ${getBalanceColor(selectedLeaveType.leaveTypeId || selectedLeaveType.id)} flex-shrink-0`}>
                  ({getLeaveBalanceForType(selectedLeaveType.leaveTypeId || selectedLeaveType.id)} days available)
                </span>
              </>
            ) : (
              <span className="text-gray-500">Select leave type</span>
            )}
          </div>
          <ChevronDown 
            className={`w-4 h-4 text-gray-500 transition-transform duration-200 flex-shrink-0 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {userLeaveTypes.length > 0 ? (
              userLeaveTypes.map(leaveType => (
                <button
                  key={leaveType.leaveTypeId || leaveType.id}
                  type="button"
                  onClick={() => handleSelect(leaveType.leaveTypeId || leaveType.id)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 
                    transition-colors duration-200 flex items-center justify-between
                    ${value === (leaveType.leaveTypeId || leaveType.id) ? 'bg-blue-50 border-blue-200' : ''}`}
                >
                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <span className="font-medium text-gray-900 truncate">{leaveType.name}</span>
                    <span className="text-xs text-gray-500 capitalize">{leaveType.type?.toLowerCase()} leave</span>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0 ml-2">
                    <span className={`text-sm font-semibold ${getBalanceColor(leaveType.leaveTypeId || leaveType.id)}`}>
                      {getLeaveBalanceForType(leaveType.leaveTypeId || leaveType.id)} days
                    </span>
                    <span className="text-xs text-gray-500">available</span>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-center text-gray-500">
                No leave types available
              </div>
            )}
          </div>
        )}
      </div>
      
      {error && <span className="text-xs text-rose-500 mt-0.5">{error}</span>}
    </label>
  )
}

// Alternative: Simple Select Component (if custom dropdown still has issues)
function SimpleLeaveTypeSelect({ 
  label, 
  error, 
  required, 
  value, 
  onChange, 
  onBlur, 
  userLeaveTypes,
  leaveBalance,
  className = "" 
}) {
  const getLeaveBalanceForType = (leaveTypeId) => {
    if (!leaveTypeId) return 0
    const leaveType = userLeaveTypes.find(lt => (lt.leaveTypeId || lt.id) === leaveTypeId)
    if (!leaveType) return 0
    if (typeof leaveType.remaining === 'number') return leaveType.remaining
    if (leaveBalance && leaveType.type) return leaveBalance[leaveType.type] || 0
    return 0
  }

  return (
    <label className="flex flex-col gap-1.5 w-full">
      <span className="text-sm font-medium text-gray-800">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className={`w-full bg-white border rounded-lg px-4 py-2.5 text-gray-900 
            placeholder-gray-500 outline-none appearance-none transition-all duration-200 
            focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
            ${error 
              ? "border-rose-500 focus:ring-rose-500/30" 
              : "border-gray-300 hover:border-blue-500/50"
            } ${className}`}
        >
          <option value="">Select leave type</option>
          {userLeaveTypes.map(leaveType => (
            <option key={leaveType.leaveTypeId || leaveType.id} value={leaveType.leaveTypeId || leaveType.id}>
              {leaveType.name} ({getLeaveBalanceForType(leaveType.leaveTypeId || leaveType.id)} days available)
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      {error && <span className="text-xs text-rose-500 mt-0.5">{error}</span>}
    </label>
  )
}

export default function LeaveApplicationForm() {
  const dispatch = useDispatch()
  const creating = useSelector(selectUserLeaveCreating)
  const createError = useSelector(selectUserLeaveCreateError)
  const leaveBalance = useSelector(selectUserLeaveBalance)
  const balanceLoading = useSelector(selectUserLeaveBalanceLoading)
  const userLeaveTypes = useSelector(selectUserLeaveTypes)
  const userLeaveTypesLoading = useSelector(selectUserLeaveTypesLoading)
  const userLeaveTypesError = useSelector(selectUserLeaveTypesError)

  const [form, setForm] = useState(blankForm)
  const [touched, setTouched] = useState({})
  const [calculatedDuration, setCalculatedDuration] = useState(0)
  const [useSimpleSelect, setUseSimpleSelect] = useState(false) // Toggle between custom and simple select

  // Prefer fetchLeaveBalance data.items when present (new API shape)
  const availableLeaveTypes = useMemo(() => {
    const items = leaveBalance?.data?.items
    if (Array.isArray(items) && items.length > 0) return items
    return Array.isArray(userLeaveTypes) ? userLeaveTypes : []
  }, [leaveBalance, userLeaveTypes])


  // Fetch leave balance and user leave types on component mount
  useEffect(() => {
    dispatch(fetchLeaveBalance())
    dispatch(fetchUserLeaveTypes())
  }, [dispatch])

  // Calculate duration when dates change
  useEffect(() => {
    if (form.startDate && form.endDate) {
      const start = new Date(form.startDate)
      const end = new Date(form.endDate)
      
      // Reset time part to avoid timezone issues
      start.setHours(0, 0, 0, 0)
      end.setHours(0, 0, 0, 0)
      
      const timeDiff = end.getTime() - start.getTime()
      const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1 // Inclusive of both dates
      setCalculatedDuration(dayDiff > 0 ? dayDiff : 0)
    } else {
      setCalculatedDuration(0)
    }
  }, [form.startDate, form.endDate])

  const updateForm = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const markTouched = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const getErrors = () => {
    const errors = {}
    
    if (!form.leaveTypeId) errors.leaveTypeId = 'Leave type is required'
    
    if (!form.startDate) errors.startDate = 'Start date is required'
    
    if (!form.endDate) errors.endDate = 'End date is required'
    
    if (form.startDate && form.endDate) {
      const start = new Date(form.startDate)
      const end = new Date(form.endDate)
      if (start > end) {
        errors.endDate = 'End date cannot be before start date'
      }
      
      // Check if start date is in the past
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (start < today) {
        errors.startDate = 'Start date cannot be in the past'
      }
    }
    
    if (!form.reason) {
      errors.reason = 'Reason is required'
    } else if (form.reason.length < 10) {
      errors.reason = 'Reason must be at least 10 characters'
    } else if (form.reason.length > 500) {
      errors.reason = 'Reason must be less than 500 characters'
    }
    
    // Check leave balance against remaining
    if (form.leaveTypeId && calculatedDuration > 0) {
      const selectedLeaveType = availableLeaveTypes.find(lt => (lt.leaveTypeId || lt.id) === form.leaveTypeId)
      const balance = selectedLeaveType
        ? (typeof selectedLeaveType.remaining === 'number'
            ? selectedLeaveType.remaining
            : (leaveBalance && selectedLeaveType.type ? (leaveBalance[selectedLeaveType.type] || 0) : 0)
          )
        : 0
      if (calculatedDuration > balance) {
        errors.leaveTypeId = `Insufficient ${selectedLeaveType?.name || 'leave'} balance. Available: ${balance} days, Requested: ${calculatedDuration} days`
      }
    }

    return errors
  }

  const errors = getErrors()
  const isValid = Object.keys(errors).length === 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Mark all fields as touched
    const allTouched = {}
    Object.keys(form).forEach(key => { allTouched[key] = true })
    setTouched(allTouched)

    if (!isValid) {
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0]
      const element = document.querySelector(`[name="${firstErrorField}"]`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        element.focus()
      }
      return
    }

    const leaveData = {
      leaveTypeId: form.leaveTypeId,
      startDate: form.startDate,
      endDate: form.endDate,
      reason: form.reason.trim(),
      isHalfDay: form.isHalfDay
    }

    try {
      await dispatch(createLeave(leaveData)).unwrap()
      // Reset form on success
      setForm(blankForm)
      setTouched({})
      setCalculatedDuration(0)
      // Refetch balance
      dispatch(fetchLeaveBalance())
    } catch (error) {
      console.error('Leave application failed:', error)
    }
  }

  const getLeaveBalanceForType = (leaveTypeId) => {
    if (!leaveTypeId) return 0
    const leaveType = availableLeaveTypes.find(lt => (lt.leaveTypeId || lt.id) === leaveTypeId)
    if (!leaveType) return 0
    if (typeof leaveType.remaining === 'number') return leaveType.remaining
    if (leaveBalance && leaveType.type) return leaveBalance[leaveType.type] || 0
    return 0
  }

  const getBalanceColor = (leaveTypeId) => {
    const balance = getLeaveBalanceForType(leaveTypeId)
    if (balance > 10) return 'text-green-600'
    if (balance > 5) return 'text-blue-600'
    if (balance > 0) return 'text-orange-600'
    return 'text-red-600'
  }

  const handleReset = () => {
    setForm(blankForm)
    setTouched({})
    setCalculatedDuration(0)
    dispatch(resetUserLeaveState())
  }

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0]
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Apply for Leave</h1>
        <p className="text-gray-600">Submit a new leave request for approval</p>
      </div>

      {/* Debug Toggle (remove in production) */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setUseSimpleSelect(!useSimpleSelect)}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          {useSimpleSelect ? 'Use Custom Dropdown' : 'Use Simple Select'}
        </button>
      </div>

      {/* Leave Balance Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Your Leave Balance
        </h2>
        {balanceLoading === 'loading' || userLeaveTypesLoading === 'loading' ? (
          <div className="flex items-center justify-center py-4">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-gray-600">Loading balance...</span>
          </div>
        ) : userLeaveTypesError ? (
          <div className="text-center py-4 text-rose-500">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <div>Error loading leave types</div>
            <div className="text-sm mt-1">{userLeaveTypesError}</div>
          </div>
        ) : availableLeaveTypes.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {availableLeaveTypes.map(leaveType => (
              <div key={leaveType.leaveTypeId || leaveType.id} className="text-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className={`text-lg font-bold ${getBalanceColor(leaveType.leaveTypeId || leaveType.id)}`}>
                  {getLeaveBalanceForType(leaveType.leaveTypeId || leaveType.id)}
                </div>
                <div className="text-xs text-gray-600 mt-1">days</div>
                <div className="text-xs font-medium text-gray-800 mt-2">{leaveType.name}</div>
                <div className="text-xs text-gray-500 capitalize mt-1">{leaveType.type?.toLowerCase()}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            {availableLeaveTypes.length === 0 ? 'No leave types available' : 'Unable to load leave balance'}
          </div>
        )}
      </div>

      {/* Leave Application Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        {/* Leave Type Selection */}
        {useSimpleSelect ? (
          <SimpleLeaveTypeSelect
            label="Leave Type"
            value={form.leaveTypeId}
            onChange={(value) => updateForm('leaveTypeId', value)}
            onBlur={() => markTouched('leaveTypeId')}
            error={touched.leaveTypeId && errors.leaveTypeId}
            required
            userLeaveTypes={availableLeaveTypes}
            leaveBalance={leaveBalance}
          />
        ) : (
          <LeaveTypeDropdown
            label="Leave Type"
            value={form.leaveTypeId}
            onChange={(value) => updateForm('leaveTypeId', value)}
            onBlur={() => markTouched('leaveTypeId')}
            error={touched.leaveTypeId && errors.leaveTypeId}
            required
            userLeaveTypes={availableLeaveTypes}
            leaveBalance={leaveBalance}
          />
        )}

        {/* Dates and Duration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Start Date"
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={(e) => updateForm('startDate', e.target.value)}
            onBlur={() => markTouched('startDate')}
            error={touched.startDate && errors.startDate}
            required
            min={getTodayDate()}
          />
          <Input
            label="End Date"
            name="endDate"
            type="date"
            value={form.endDate}
            onChange={(e) => updateForm('endDate', e.target.value)}
            onBlur={() => markTouched('endDate')}
            error={touched.endDate && errors.endDate}
            required
            min={form.startDate || getTodayDate()}
          />
          <div>
            <label className="flex flex-col gap-1.5 w-full">
              <span className="text-sm font-medium text-gray-800">Duration</span>
              <div className={`w-full border rounded-lg px-4 py-2.5 text-center font-semibold ${
                calculatedDuration > 0 
                  ? 'bg-green-50 border-green-200 text-green-700' 
                  : 'bg-gray-50 border-gray-300 text-gray-600'
              }`}>
                {calculatedDuration > 0 ? `${calculatedDuration} day${calculatedDuration > 1 ? 's' : ''}` : '0 days'}
              </div>
              {calculatedDuration > 0 && (
                <span className="text-xs text-gray-500 text-center">
                  Including both start and end dates
                </span>
              )}
            </label>
          </div>
        </div>

        {/* Half Day Checkbox */}
        <Checkbox
          label="This is a half-day leave"
          checked={form.isHalfDay}
          onChange={(e) => updateForm('isHalfDay', e.target.checked)}
        />

        {/* Reason */}
        <div>
          <TextArea
            label="Reason for Leave"
            name="reason"
            value={form.reason}
            onChange={(e) => updateForm('reason', e.target.value)}
            onBlur={() => markTouched('reason')}
            error={touched.reason && errors.reason}
            required
            placeholder="Please provide a detailed reason for your leave request..."
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-1">
            {touched.reason && errors.reason ? (
              <div className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-rose-500" />
                <span className="text-xs text-rose-500">{errors.reason}</span>
              </div>
            ) : (
              <div></div>
            )}
            <span className={`text-xs ${
              form.reason.length > 450 ? 'text-rose-500' : 'text-gray-500'
            }`}>
              {form.reason.length}/500
            </span>
          </div>
        </div>

        {/* Status Messages */}
        {createError && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <div className="font-medium">Submission Failed</div>
              <div className="text-sm mt-1">{createError}</div>
            </div>
          </div>
        )}

        {creating === 'succeeded' && (
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <div>
              <div className="font-medium">Success!</div>
              <div className="text-sm mt-1">Your leave application has been submitted successfully and is pending approval.</div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleReset}
            disabled={creating === 'loading'}
            className="px-6 py-3 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset Form
          </button>
          
          <button
            type="submit"
            disabled={creating === 'loading' || !isValid}
            className={`inline-flex items-center gap-2 px-8 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              creating === 'loading' || !isValid
                ? "bg-gray-100 text-gray-400 opacity-50 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
            }`}
          >
            {creating === 'loading' ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4" />
                Submit Leave Application
              </>
            )}
          </button>
        </div>
      </form>

      {/* Help Text */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-800">
            <div className="font-medium">Important Notes:</div>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Leave applications require manager approval</li>
              <li>Apply at least 3 days in advance for planned leaves</li>
              <li>For sick leaves, you may need to provide medical certificate</li>
              <li>Check your leave balance before applying</li>
              <li>Half-day leaves count as 0.5 days towards your balance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}