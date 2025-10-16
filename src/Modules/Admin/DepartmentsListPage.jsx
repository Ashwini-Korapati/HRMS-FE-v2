import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectDepartments,
  selectDepartmentsListLoading,
  selectDepartmentsListError,
  selectDepartmentDeleting,
  selectDepartmentDeleteError,
  fetchDepartments,
  deleteDepartment,
  deleteDepartmentsBulk,
  clearDepartmentErrors
} from '../../Redux/Public/departmentSlice';
import DepartmentFormDialog from './DepartmentFormDialog';
import { FiEdit, FiTrash2, FiPlus, FiRefreshCcw } from 'react-icons/fi';

const DepartmentListPage = () => {
  const dispatch = useDispatch();
  const departments = useSelector(selectDepartments);
  const loading = useSelector(selectDepartmentsListLoading);
  const error = useSelector(selectDepartmentsListError);
  const deleting = useSelector(selectDepartmentDeleting);
  const deleteError = useSelector(selectDepartmentDeleteError);

  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const [bulkDelete, setBulkDelete] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState(null);

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
    setCurrentDepartment(department);
    setFormDialogOpen(true);
  };

  const handleCreateNew = () => {
    setCurrentDepartment(null);
    setFormDialogOpen(true);
  };

  const handleFormClose = (refresh) => {
    setFormDialogOpen(false);
    setCurrentDepartment(null);
    if (refresh) dispatch(fetchDepartments());
  };

  if (loading === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6  flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 text-transparent bg-clip-text">
          Departments List
        </h1>
        <div className="flex gap-3">
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md shadow-md transition"
          >
            <FiPlus /> Create Department
          </button>
          <button
            onClick={() => dispatch(fetchDepartments())}
            className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition"
          >
            <FiRefreshCcw /> Refresh
          </button>
        </div>
      </div>

      {/* Error Alerts */}
      {(error || deleteError) && (
        <div className="bg-red-100 text-red-700 px-4 py-3 rounded-md shadow-sm">
          <div className="flex justify-between items-center">
            <span>{error || deleteError}</span>
            <button onClick={() => dispatch(clearDepartmentErrors())} className="text-sm underline">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* No Data */}
      {departments.length === 0 ? (
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-gray-600 mb-3">No departments found</h2>
          <button
            onClick={handleCreateNew}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md"
          >
            Create First Department
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Table Actions */}
          <div className="flex items-center p-3 border-b border-gray-200">
            <label className="flex items-center gap-2 text-gray-600">
              <input
                type="checkbox"
                checked={selectedDepartments.length === departments.length}
                onChange={handleSelectAll}
                className="accent-orange-500"
              />
              Select All
            </label>
            {selectedDepartments.length > 0 && (
              <button
                onClick={handleBulkDeleteClick}
                disabled={deleting === 'loading'}
                className="ml-3 text-red-600 border border-red-400 px-3 py-1.5 rounded-md hover:bg-red-50 transition"
              >
                <FiTrash2 className="inline mr-1" />
                Delete Selected ({selectedDepartments.length})
              </button>
            )}
          </div>

          {/* Table */}
          <table className="w-full border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-sm font-medium text-gray-700">
                <th className="p-3 w-10"></th>
                <th className="p-3">Name</th>
                <th className="p-3">Code</th>
                <th className="p-3">Description</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr
                  key={dept.id}
                  className="border-b hover:bg-gray-50 text-gray-700 transition"
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedDepartments.includes(dept.id)}
                      onChange={() => handleSelectDepartment(dept.id)}
                      className="accent-orange-500"
                    />
                  </td>
                  <td className="p-3">{dept.name}</td>
                  <td className="p-3">{dept.code}</td>
                  <td className="p-3">{dept.description || '-'}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        dept.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {dept.status || 'ACTIVE'}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(dept)}
                      className="text-blue-600 hover:text-blue-800 transition"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(dept)}
                      disabled={deleting === 'loading'}
                      className="text-red-600 hover:text-red-800 transition"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 animate-fadeIn">
            <h3 className="text-lg font-semibold mb-4">
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
                className="px-4 py-2 border rounded-md hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting === 'loading'}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition"
              >
                {deleting === 'loading' ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Dialog */}
      <DepartmentFormDialog
        open={formDialogOpen}
        onClose={handleFormClose}
        department={currentDepartment}
      />
    </div>
  );
};

export default DepartmentListPage;
