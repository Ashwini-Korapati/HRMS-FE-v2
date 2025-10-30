import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectDepartments,
  selectDepartmentsListLoading,
  selectDepartmentsListError,
  selectDepartmentDeleting,
  selectDepartmentDeleteError,
  selectDepartmentCreating,
  selectDepartmentCreateError,
  selectDepartmentUpdating,
  selectDepartmentUpdateError,
  selectCurrentEditingDepartment,
  fetchDepartments,
  deleteDepartment,
  deleteDepartmentsBulk,
  createDepartment,
  updateDepartment,
  clearDepartmentErrors,
  resetDepartmentState,
  clearUpdateState,
  setCurrentEditing
} from '../../Redux/Public/departmentSlice';
import { FiEdit, FiTrash2, FiPlus, FiRefreshCcw, FiList, FiGrid, FiSave, FiX } from 'react-icons/fi';

const DepartmentManagementPage = () => {
  const dispatch = useDispatch();
  const departments = useSelector(selectDepartments);
  const loading = useSelector(selectDepartmentsListLoading);
  const error = useSelector(selectDepartmentsListError);
  const deleting = useSelector(selectDepartmentDeleting);
  const deleteError = useSelector(selectDepartmentDeleteError);
  const creating = useSelector(selectDepartmentCreating);
  const createError = useSelector(selectDepartmentCreateError);
  const updating = useSelector(selectDepartmentUpdating);
  const updateError = useSelector(selectDepartmentUpdateError);
  const currentEditing = useSelector(selectCurrentEditingDepartment);

  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const [bulkDelete, setBulkDelete] = useState(false);
  const [currentView, setCurrentView] = useState('list');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  useEffect(() => {
    if (deleting === 'succeeded') {
      setDeleteDialogOpen(false);
      setDepartmentToDelete(null);
      setSelectedDepartments([]);
      dispatch(fetchDepartments());
    }
  }, [deleting, dispatch]);

  useEffect(() => {
    if (creating === 'succeeded') {
      setFormData({ name: '', description: '' });
      setSuccessMessage('Department created successfully!');
      setShowSuccess(true);
      
      const timer = setTimeout(() => {
        setShowSuccess(false);
        dispatch(resetDepartmentState());
        setCurrentView('list');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [creating, dispatch]);

  useEffect(() => {
    if (updating === 'succeeded') {
      setSuccessMessage('Department updated successfully!');
      setShowSuccess(true);
      
      const timer = setTimeout(() => {
        setShowSuccess(false);
        dispatch(clearUpdateState());
        setCurrentView('list');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [updating, dispatch]);

  // List View Handlers
  const handleDeleteClick = (department) => {
    setDepartmentToDelete(department);
    setBulkDelete(false);
    setDeleteDialogOpen(true);
  };

  const handleBulkDeleteClick = () => {
    if (selectedDepartments.length > 0) {
      setBulkDelete(true);
      setDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = () => {
    if (bulkDelete) {
      dispatch(deleteDepartmentsBulk(selectedDepartments));
    } else if (departmentToDelete) {
      dispatch(deleteDepartment(departmentToDelete.id));
    }
  };

  const handleSelectDepartment = (departmentId) => {
    setSelectedDepartments(prev =>
      prev.includes(departmentId)
        ? prev.filter(id => id !== departmentId)
        : [...prev, departmentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDepartments.length === departments.length) {
      setSelectedDepartments([]);
    } else {
      setSelectedDepartments(departments.map(dept => dept.id));
    }
  };

  const handleEdit = (department) => {
    setFormData({
      name: department.name,
      description: department.description || ''
    });
    dispatch(setCurrentEditing(department));
    setCurrentView('create');
  };

  // Create/Update View Handlers
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSuccess(false);
    
    if (currentEditing) {
      // Update existing department using PUT
      dispatch(updateDepartment({ 
        id: currentEditing.id, 
        ...formData 
      }));
    } else {
      // Create new department
      dispatch(createDepartment(formData));
    }
  };

  const handleCreateAnother = () => {
    setFormData({ name: '', description: '' });
    setShowSuccess(false);
    dispatch(resetDepartmentState());
    dispatch(clearUpdateState());
  };

  const handleSwitchView = (view) => {
    setCurrentView(view);
    setFormData({ name: '', description: '' });
    setShowSuccess(false);
    dispatch(clearDepartmentErrors());
    dispatch(clearUpdateState());
    dispatch(setCurrentEditing(null));
  };

  const handleCancelEdit = () => {
    setFormData({ name: '', description: '' });
    dispatch(setCurrentEditing(null));
    setCurrentView('list');
  };

  const isFormValid = formData.name.trim();

  if (loading === 'loading' && currentView === 'list') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 text-transparent bg-clip-text">
            Department Management
          </h1>
          <p className="text-gray-600 mt-2">
            {currentView === 'list' 
              ? 'Manage your departments' 
              : currentEditing 
                ? `Editing: ${currentEditing.name}` 
                : 'Create new department'
            }
          </p>
        </div>
        
        {/* View Toggle Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => handleSwitchView('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
              currentView === 'list'
                ? 'bg-orange-500 text-white shadow-lg transform scale-105'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <FiList className="text-lg" />
            List View
          </button>
          <button
            onClick={() => handleSwitchView('create')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
              currentView === 'create' && !currentEditing
                ? 'bg-green-500 text-white shadow-lg transform scale-105'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <FiPlus className="text-lg" />
            Create New
          </button>
        </div>
      </div>

      {/* Error Alerts */}
      {(error || deleteError || createError || updateError) && (
        <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-sm animate-fadeIn">
          <div className="flex justify-between items-center">
            <span>{error || deleteError || createError || updateError}</span>
            <button 
              onClick={() => dispatch(clearDepartmentErrors())} 
              className="text-sm underline hover:text-red-800 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccess && (
        <div className="mb-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg shadow-sm animate-fadeIn">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {successMessage}
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="animate-fadeInUp">
        {currentView === 'list' ? (
          /* List View */
          <div className="space-y-6">
            {/* List Actions */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => dispatch(fetchDepartments())}
                  className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-300 hover:shadow-md"
                >
                  <FiRefreshCcw className={`${loading === 'loading' ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                
                {selectedDepartments.length > 0 && (
                  <button
                    onClick={handleBulkDeleteClick}
                    disabled={deleting === 'loading'}
                    className="flex items-center gap-2 text-red-600 border border-red-400 px-4 py-2 rounded-lg hover:bg-red-50 transition-all duration-300 disabled:opacity-50"
                  >
                    <FiTrash2 />
                    Delete Selected ({selectedDepartments.length})
                  </button>
                )}
              </div>
              
              <div className="text-sm text-gray-500">
                {departments.length} department(s) found
              </div>
            </div>

            {/* Departments Table */}
            {departments.length === 0 ? (
              <div className="text-center p-12 bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-orange-100 to-pink-100 rounded-full flex items-center justify-center">
                  <FiGrid className="text-3xl text-orange-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-700 mb-2">No departments found</h2>
                <p className="text-gray-500 mb-6">Get started by creating your first department</p>
                <button
                  onClick={() => setCurrentView('create')}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-300 hover:scale-105"
                >
                  Create First Department
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Table Header with Select All */}
                <div className="flex items-center p-4 border-b border-gray-200 bg-gray-50">
                  <label className="flex items-center gap-3 text-gray-700 font-medium">
                    <input
                      type="checkbox"
                      checked={selectedDepartments.length === departments.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-orange-500 bg-gray-100 border-gray-300 rounded focus:ring-orange-400"
                    />
                    Select All
                  </label>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr className="text-left text-sm font-semibold text-gray-700">
                        <th className="p-4 w-12"></th>
                        <th className="p-4">Name</th>
                        <th className="p-4">Code</th>
                        <th className="p-4">Description</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {departments.map((dept) => (
                        <tr
                          key={dept.id}
                          className="hover:bg-gray-50 transition-colors duration-200 group"
                        >
                          <td className="p-4">
                            <input
                              type="checkbox"
                              checked={selectedDepartments.includes(dept.id)}
                              onChange={() => handleSelectDepartment(dept.id)}
                              className="w-4 h-4 text-orange-500 bg-gray-100 border-gray-300 rounded focus:ring-orange-400"
                            />
                          </td>
                          <td className="p-4 font-medium text-gray-900">{dept.name}</td>
                          <td className="p-4 text-gray-600">{dept.code}</td>
                          <td className="p-4 text-gray-600 max-w-xs truncate">
                            {dept.description || '-'}
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                dept.status === 'ACTIVE'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {dept.status || 'ACTIVE'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <button
                                onClick={() => handleEdit(dept)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                title="Edit department"
                              >
                                <FiEdit className="text-lg" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(dept)}
                                disabled={deleting === 'loading'}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
                                title="Delete department"
                              >
                                <FiTrash2 className="text-lg" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Create/Edit View */
          <div className="flex justify-center">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg border border-gray-200 p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {currentEditing ? 'Edit Department' : 'Create New Department'}
                </h2>
                <p className="text-gray-600">
                  {currentEditing 
                    ? `Update details for ${currentEditing.name}` 
                    : 'Add a new department to your organization'
                  }
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Department Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    required
                    disabled={creating === 'loading' || updating === 'loading'}
                    className={`w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300 ${
                      (creating === 'loading' || updating === 'loading') 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:border-gray-400'
                    }`}
                    placeholder="Enter department name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={e => handleInputChange('description', e.target.value)}
                    rows={4}
                    disabled={creating === 'loading' || updating === 'loading'}
                    className={`w-full p-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300 ${
                      (creating === 'loading' || updating === 'loading') 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:border-gray-400'
                    }`}
                    placeholder="Enter department description (optional)"
                  ></textarea>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-6">
                  <button
                    type="submit"
                    disabled={!isFormValid || creating === 'loading' || updating === 'loading'}
                    className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                      !isFormValid || creating === 'loading' || updating === 'loading'
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:shadow-lg hover:scale-105'
                    }`}
                  >
                    {(creating === 'loading' || updating === 'loading') && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    {updating === 'loading' ? 'Updating...' : 
                     creating === 'loading' ? 'Creating...' : 
                     currentEditing ? (
                      <>
                        <FiSave className="text-lg" />
                        Update Department
                      </>
                     ) : 'Create Department'}
                  </button>

                  {!currentEditing && (
                    <button
                      type="button"
                      onClick={handleCreateAnother}
                      disabled={creating === 'loading' || updating === 'loading'}
                      className="px-6 py-3 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-300 disabled:opacity-50"
                    >
                      Create Another
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={currentEditing ? handleCancelEdit : () => handleSwitchView('list')}
                    disabled={creating === 'loading' || updating === 'loading'}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-300 disabled:opacity-50"
                  >
                    <FiX />
                    {currentEditing ? 'Cancel Edit' : 'Back to List'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-scaleIn">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {bulkDelete ? 'Delete Selected Departments' : 'Delete Department'}
            </h3>
            <p className="text-gray-600 mb-6">
              {bulkDelete
                ? `Are you sure you want to delete ${selectedDepartments.length} department(s)? This action cannot be undone.`
                : `Are you sure you want to delete department "${departmentToDelete?.name}"? This action cannot be undone.`}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteDialogOpen(false)}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting === 'loading'}
                className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                {deleting === 'loading' ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagementPage;