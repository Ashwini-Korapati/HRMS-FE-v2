import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Plus, Edit2, Trash2, Shield, Calendar, Search, X, CheckCircle, XCircle } from 'lucide-react'
import { Close, Cancel } from '@mui/icons-material'
import { 
  createLeaveType,
  fetchLeaveTypes,
  updateLeaveType,
  deleteLeaveType,
  selectLeaveTypes,
  selectLeaveTypesCreating,
  selectLeaveTypesCreateError,
  selectLeaveTypesListLoading,
  selectLeaveTypesListError,
  selectLeaveTypeDeleting,
  resetLeaveTypeState
} from '../../Redux/Public/leaveTypesSlice'
import { selectDesignations, fetchDesignations } from '../../Redux/Public/designationSlice'

const blankForm = {
  name: '',
  type: '',
  maxDaysPerYear: '',
  carryForward: false,
  maxCarryForward: '',
  designationIds: [],
  isActive: true
}

const LEAVE_TYPE_OPTIONS = [
  { value: 'ANNUAL', label: 'Annual Leave' },
  { value: 'SICK', label: 'Sick Leave' },
  { value: 'CASUAL', label: 'Casual Leave' },
  { value: 'MATERNITY', label: 'Maternity Leave' },
  { value: 'PATERNITY', label: 'Paternity Leave' },
  { value: 'BEREAVEMENT', label: 'Bereavement Leave' },
  { value: 'COMPENSATORY', label: 'Compensatory Leave' },
  { value: 'SABBATICAL', label: 'Sabbatical Leave' }
]

function Input({ label, error, required, className = "", ...props }) {
  return (
    <label className="flex flex-col gap-1.5 w-full">
      <span className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <input
        {...props}
        className={`flex-1 px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316] ${
          error ? "border-rose-500" : ""
        } ${className}`}
      />
      {error && <span className="text-xs text-rose-500 mt-0.5">{error}</span>}
    </label>
  )
}

function Select({ label, error, required, children, className = "", ...props }) {
  return (
    <label className="flex flex-col gap-1.5 w-full">
      <span className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <div className="relative">
        <select
          {...props}
          className={`flex-1 px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316] appearance-none ${
            error ? "border-rose-500" : ""
          } ${className}`}
        >
          {children}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
          ▼
        </div>
      </div>
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
        className="w-4 h-4 text-[#F97316] bg-gray-100 border-gray-300 rounded focus:ring-[#F97316] focus:ring-2"
      />
      <span className="text-sm text-gray-800">{label}</span>
    </label>
  )
}

export default function LeaveTypesManagement() {
  const dispatch = useDispatch()
  const leaveTypes = useSelector(selectLeaveTypes)
  const creating = useSelector(selectLeaveTypesCreating)
  const createError = useSelector(selectLeaveTypesCreateError)
  const loadingList = useSelector(selectLeaveTypesListLoading)
  const listError = useSelector(selectLeaveTypesListError)
  const deleting = useSelector(selectLeaveTypeDeleting)
  const designations = useSelector(selectDesignations)

  const [form, setForm] = useState(blankForm)
  const [touched, setTouched] = useState({})
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    dispatch(fetchLeaveTypes())
    dispatch(fetchDesignations())
  }, [dispatch])

  useEffect(() => {
    if (creating === 'succeeded') {
      const message = editingId 
        ? `Leave type "${form.name}" updated successfully!`
        : `Leave type "${form.name}" created successfully!`
      setSuccessMessage(message)
      setShowSuccess(true)
      handleReset()

      const t = setTimeout(() => {
        setShowSuccess(false)
        dispatch(resetLeaveTypeState())
      }, 4500)
      return () => clearTimeout(t)
    }
  }, [creating, editingId, form.name, dispatch])

  const updateForm = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const markTouched = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const getErrors = () => {
    const errors = {}
    
    if (!form.name) errors.name = 'Leave type name is required'
    if (!form.type) errors.type = 'Leave type is required'
    if (!form.maxDaysPerYear || form.maxDaysPerYear < 1) errors.maxDaysPerYear = 'Maximum days per year must be at least 1'
    if (form.carryForward && (!form.maxCarryForward || form.maxCarryForward < 0)) {
      errors.maxCarryForward = 'Maximum carry forward days must be 0 or more'
    }
    if (form.designationIds.length === 0) errors.designationIds = 'At least one designation must be selected'

    return errors
  }

  const errors = getErrors()
  const isValid = Object.keys(errors).length === 0

  const filteredLeaveTypes = leaveTypes.filter(leaveType => 
    leaveType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    leaveType.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const allTouched = {}
    Object.keys(form).forEach(key => { allTouched[key] = true })
    setTouched(allTouched)

    if (!isValid) return

    const leaveTypeData = {
      name: form.name.trim(),
      type: form.type,
      maxDaysPerYear: parseInt(form.maxDaysPerYear),
      carryForward: form.carryForward,
      maxCarryForward: form.carryForward ? parseInt(form.maxCarryForward) : 0,
      designationIds: form.designationIds,
      isActive: form.isActive
    }

    try {
      if (editingId) {
        await dispatch(updateLeaveType({ id: editingId, ...leaveTypeData })).unwrap()
      } else {
        await dispatch(createLeaveType(leaveTypeData)).unwrap()
      }
      dispatch(fetchLeaveTypes())
    } catch (error) {
      console.error('Leave type operation failed:', error)
    }
  }

  const handleEdit = (leaveType) => {
    setForm({
      name: leaveType.name,
      type: leaveType.type,
      maxDaysPerYear: leaveType.maxDaysPerYear.toString(),
      carryForward: leaveType.carryForward,
      maxCarryForward: leaveType.maxCarryForward?.toString() || '',
      designationIds: leaveType.designationIds || [],
      isActive: leaveType.isActive
    })
    setEditingId(leaveType.id)
    setIsFormOpen(true)
  }

  const handleDelete = async (leaveTypeId) => {
    if (window.confirm('Are you sure you want to delete this leave type?')) {
      try {
        await dispatch(deleteLeaveType(leaveTypeId)).unwrap()
        dispatch(fetchLeaveTypes())
      } catch (error) {
        console.error('Delete failed:', error)
      }
    }
  }

  const handleReset = () => {
    setForm(blankForm)
    setTouched({})
    setEditingId(null)
    setIsFormOpen(false)
  }

  const handleCloseSuccess = () => {
    setShowSuccess(false)
    dispatch(resetLeaveTypeState())
  }

  const handleCloseError = () => {
    dispatch(resetLeaveTypeState())
  }

  const toggleDesignation = (designationId) => {
    const currentIds = form.designationIds
    if (currentIds.includes(designationId)) {
      updateForm('designationIds', currentIds.filter(id => id !== designationId))
    } else {
      updateForm('designationIds', [...currentIds, designationId])
    }
  }

  // Fixed getDesignationNames function with null checks
  const getDesignationNames = (designationIds) => {
    if (!designationIds || !Array.isArray(designationIds)) return 'None'
    if (!designations || !Array.isArray(designations)) return 'Loading...'
    
    const names = designationIds.map(id => {
      const designation = designations.find(d => d && d.id === id)
      return designation?.title || 'Unknown'
    }).filter(name => name !== 'Unknown')
    
    return names.length > 0 ? names.join(', ') : 'None'
  }

  const getStatusBadge = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800 border border-green-200'
      : 'bg-gray-100 text-gray-600 border border-gray-200'
  }

  const getStatusIcon = (status) =>
    status ? (
      <CheckCircle className="text-green-500 w-4 h-4" />
    ) : (
      <XCircle className="text-amber-500 w-4 h-4" />
    )

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Leave Types Management</h1>
              <p className="text-gray-600">Configure and manage company leave policies</p>
            </div>
            <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow hover:translate-y-[-2px] hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Leave Type
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search leave types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316]"
            />
          </div>
        </div>

        {/* Admin Only Notice */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-blue-600" />
            <div>
              <div className="font-medium text-blue-800">Administrator Access Only</div>
              <div className="text-sm text-blue-600 mt-1">
                Only users with ADMIN role can create, edit, or delete leave types.
              </div>
            </div>
          </div>
        </div>

        {/* Leave Types List */}
        <div className="mt-6 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {loadingList === 'loading' ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-[#F97316] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div className="text-gray-600 mt-2">Loading leave types...</div>
            </div>
          ) : listError ? (
            <div className="p-6 text-center text-rose-600">
              <div>Error loading leave types: {listError}</div>
              <button
                onClick={() => dispatch(fetchLeaveTypes())}
                className="mt-2 px-4 py-2 text-sm bg-rose-100 text-rose-700 rounded hover:bg-rose-200"
              >
                Try Again
              </button>
            </div>
          ) : filteredLeaveTypes.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <div className="text-lg font-medium mb-1">
                {searchTerm ? 'No matching leave types found' : 'No Leave Types'}
              </div>
              <div className="text-sm">
                {searchTerm 
                  ? 'Try adjusting your search terms' 
                  : 'Get started by creating your first leave type policy.'
                }
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Leave Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Max Days/Year</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Carry Forward</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Applicable To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y">
                  {filteredLeaveTypes.map(leaveType => (
                    <tr key={leaveType.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{leaveType.name}</div>
                        <div className="text-sm text-gray-500">{LEAVE_TYPE_OPTIONS.find(lt => lt.value === leaveType.type)?.label}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {leaveType.maxDaysPerYear} days
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {leaveType.carryForward ? `${leaveType.maxCarryForward} days` : 'No'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {getDesignationNames(leaveType.applicableDesignations)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(leaveType.isActive)}`}>
                          {getStatusIcon(leaveType.isActive)} {leaveType.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(leaveType)}
                            className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded hover:bg-blue-50"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(leaveType.id)}
                            disabled={deleting === 'loading'}
                            className="text-rose-600 hover:text-rose-900 transition-colors p-1 rounded hover:bg-rose-50 disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create/Edit Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingId ? 'Edit Leave Type' : 'Create New Leave Type'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Leave Type Name"
                    name="name"
                    value={form.name}
                    onChange={(e) => updateForm('name', e.target.value)}
                    onBlur={() => markTouched('name')}
                    error={touched.name && errors.name}
                    required
                    placeholder="e.g., Annual Leave"
                  />
                  <Select
                    label="Leave Type"
                    name="type"
                    value={form.type}
                    onChange={(e) => updateForm('type', e.target.value)}
                    onBlur={() => markTouched('type')}
                    error={touched.type && errors.type}
                    required
                  >
                    <option value="">Select type</option>
                    {LEAVE_TYPE_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>

                {/* Days Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Maximum Days Per Year"
                    name="maxDaysPerYear"
                    type="number"
                    min="1"
                    value={form.maxDaysPerYear}
                    onChange={(e) => updateForm('maxDaysPerYear', e.target.value)}
                    onBlur={() => markTouched('maxDaysPerYear')}
                    error={touched.maxDaysPerYear && errors.maxDaysPerYear}
                    required
                  />
                  <div className="flex flex-col justify-end">
                    <Checkbox
                      label="Allow Carry Forward"
                      checked={form.carryForward}
                      onChange={(e) => updateForm('carryForward', e.target.checked)}
                    />
                  </div>
                </div>

                {form.carryForward && (
                  <Input
                    label="Maximum Carry Forward Days"
                    name="maxCarryForward"
                    type="number"
                    min="0"
                    value={form.maxCarryForward}
                    onChange={(e) => updateForm('maxCarryForward', e.target.value)}
                    onBlur={() => markTouched('maxCarryForward')}
                    error={touched.maxCarryForward && errors.maxCarryForward}
                    required={form.carryForward}
                  />
                )}

                {/* Designations */}
                <div>
                  <span className="block text-sm font-medium text-gray-700 mb-2">
                    Applicable Designations {<span className="text-rose-500">*</span>}
                  </span>
                  {touched.designationIds && errors.designationIds && (
                    <span className="text-xs text-rose-500">{errors.designationIds}</span>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                    {designations && Array.isArray(designations) ? (
                      designations.map(designation => (
                        <Checkbox
                          key={designation.id}
                          label={designation.title}
                          checked={form.designationIds.includes(designation.id)}
                          onChange={() => toggleDesignation(designation.id)}
                        />
                      ))
                    ) : (
                      <div className="text-sm text-gray-500">Loading designations...</div>
                    )}
                  </div>
                </div>

                {/* Status */}
                <Checkbox
                  label="Active Leave Type"
                  checked={form.isActive}
                  onChange={(e) => updateForm('isActive', e.target.checked)}
                />

                {/* Error Message */}
                {createError && (
                  <div className="mt-3 inline-flex items-center gap-3 bg-red-50 text-red-700 px-3 py-2 rounded">
                    <div className="font-medium">Error:</div>
                    <div className="text-sm">{createError}</div>
                    <button
                      onClick={handleCloseError}
                      className="ml-auto p-1 rounded hover:bg-red-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating === 'loading' || !isValid}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded font-semibold ${
                      creating === 'loading' || !isValid
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow hover:translate-y-[-2px] hover:shadow-lg transition-all"
                    }`}
                  >
                    {creating === 'loading' ? 'Saving...' : editingId ? 'Update Leave Type' : 'Create Leave Type'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Success toast */}
        {showSuccess && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded shadow flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <div className="text-sm">{successMessage}</div>
              <button
                onClick={handleCloseSuccess}
                className="ml-2 p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
                aria-label="close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
