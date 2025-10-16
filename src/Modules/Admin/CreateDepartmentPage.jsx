import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  createDepartment,
  selectDepartmentCreating,
  selectDepartmentCreateError,
  resetDepartmentState
} from '../../Redux/Public/departmentSlice';
import { PageHeading } from './components';

const CreateDepartmentPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const creating = useSelector(selectDepartmentCreating);
  const error = useSelector(selectDepartmentCreateError);

  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (creating === 'succeeded') {
      setFormData({ name: '', description: '' });
      setShowSuccess(true);

      const timer = setTimeout(() => {
        setShowSuccess(false);
        dispatch(resetDepartmentState());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [creating, dispatch]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSuccess(false);
    dispatch(createDepartment(formData));
  };

  const handleBackToList = () => {
    navigate('/departments/list');
  };

  const handleCreateAnother = () => {
    setFormData({ name: '', description: '' });
    setShowSuccess(false);
    dispatch(resetDepartmentState());
  };

  const isFormValid = formData.name.trim();

  return (
    <div className="min-h-screen flex items-center justify-center   p-6">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-gray-200 p-6">
        <PageHeading
          title="Create Department"
          subtitle="Add a new department to your organization"
        />

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Department Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => handleInputChange('name', e.target.value)}
              required
              disabled={creating === 'loading'}
              className={`w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                creating === 'loading' ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={e => handleInputChange('description', e.target.value)}
              rows={3}
              disabled={creating === 'loading'}
              className={`w-full p-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                creating === 'loading' ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            ></textarea>
          </div>

          {error && (
            <div
              className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-md text-sm"
              role="alert"
            >
              <div className="flex justify-between">
                <span>{error}</span>
                <button
                  type="button"
                  className="ml-2 text-xs text-red-600"
                  onClick={() => dispatch(resetDepartmentState())}
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {showSuccess && (
            <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-2 rounded-md text-sm">
              Department created successfully!
            </div>
          )}

          <hr className="border-gray-200" />

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={!isFormValid || creating === 'loading'}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-amber-900 
                bg-gradient-to-r from-amber-100 to-orange-200
                hover:from-yellow-200 hover:to-yellow-300
                disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed`}
            >
              {creating === 'loading' && (
                <svg
                  className="animate-spin h-4 w-4 text-amber-900"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  ></path>
                </svg>
              )}
              {creating === 'loading' ? 'Creating...' : 'Create'}
            </button>

            <button
              type="button"
              onClick={handleBackToList}
              disabled={creating === 'loading'}
              className="px-4 py-2 rounded-md border text-sm font-medium border-gray-300 hover:bg-gray-100 disabled:opacity-50"
            >
              Back to List
            </button>

            <button
              type="button"
              onClick={handleCreateAnother}
              disabled={creating === 'loading'}
              className="px-4 py-2 rounded-md text-sm text-amber-600 hover:underline disabled:text-gray-400"
            >
              Create Another
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDepartmentPage;
