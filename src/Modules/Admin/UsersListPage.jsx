import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  selectEmployees, 
  selectEmployeesStatus, 
  selectEmployeesError, 
  fetchEmployees 
} from '../../Redux/Public/onboardinguserSlice';

// Base URL for API - adjust according to your environment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create a simple SVG avatar as data URL to avoid external requests
const DEFAULT_AVATAR_SVG = `data:image/svg+xml;base64,${btoa(`
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#6b7280"/>
    <circle cx="16" cy="12" r="5" fill="white"/>
    <path d="M16 32C22 32 26 28 26 22H6C6 28 10 32 16 32Z" fill="white"/>
  </svg>
`)}`;

// Custom Avatar Component to handle image loading properly
function UserAvatar({ src, alt, className = "w-12 h-12", placeholder }) {
  const [imgSrc, setImgSrc] = useState(DEFAULT_AVATAR_SVG);

  useEffect(() => {
    if (src) {
      // Build the correct image URL
      let imageUrl = src;
      
      // If it's a relative path (starts with /), prepend the API base URL
      if (src.startsWith('/') && !src.startsWith('http')) {
        imageUrl = `${API_BASE_URL}${src}`;
      }
      
      // Test if the image loads successfully
      const img = new Image();
      img.onload = () => {
        setImgSrc(imageUrl);
      };
      img.onerror = () => {
        console.warn(`Failed to load avatar: ${imageUrl}`);
        setImgSrc(DEFAULT_AVATAR_SVG);
      };
      img.src = imageUrl;
    } else if (placeholder) {
      // If we have a text placeholder, use the gradient avatar
      setImgSrc(DEFAULT_AVATAR_SVG);
    } else {
      setImgSrc(DEFAULT_AVATAR_SVG);
    }
  }, [src, placeholder]);

  if (placeholder && (!src || src === DEFAULT_AVATAR_SVG)) {
    // Show text placeholder if no avatar image
    return (
      <div className={`${className} bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center border border-gray-300 font-semibold text-white shadow-sm`}>
        {placeholder}
      </div>
    );
  }

  return (
    <img 
      src={imgSrc}
      alt={alt}
      className={`rounded-full object-cover border border-gray-300 shadow-sm ${className}`}
      loading="lazy"
      onError={() => setImgSrc(DEFAULT_AVATAR_SVG)}
    />
  );
}

export default function UsersListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector(s => s.auth)
  const companyId = auth?.company?.id
  const employees = useSelector(selectEmployees);
  const status = useSelector(selectEmployeesStatus);
  const error = useSelector(selectEmployeesError);

  // Fetch employees when component mounts
  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchEmployees());
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Get status badge style
  const getStatusBadge = (employee) => {
    if (!employee.isActive) {
      return 'bg-red-100 text-red-800 border border-red-200';
    }
    if (employee.isVerified) {
      return 'bg-green-100 text-green-800 border border-green-200';
    }
    return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
  };

  // Get status text
  const getStatusText = (employee) => {
    if (!employee.isActive) return 'Inactive';
    if (employee.isVerified) return 'Verified';
    return 'Pending Verification';
  };

  // Get role display text and style
  const getRoleDisplay = (role) => {
    if (role === 'ADMIN') return { text: 'Administrator', style: 'bg-purple-100 text-purple-800 border-purple-200' };
    if (role === 'USER') return { text: 'User', style: 'bg-blue-100 text-blue-800 border-blue-200' };
    return { text: role || 'User', style: 'bg-gray-100 text-gray-800 border-gray-200' };
  };

  // Get avatar placeholder based on name
  const getAvatarPlaceholder = (employee) => {
    const firstName = employee.firstName || '';
    const lastName = employee.lastName || '';
    if (firstName || lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
    }
    return employee.email?.charAt(0).toUpperCase() || 'U';
  };

  // Get card background based on role and status
  const getCardBackground = (employee) => {
    if (!employee.isActive) return 'bg-red-50 border-red-200';
    if (employee.role === 'ADMIN') return 'bg-purple-50 border-purple-200';
    if (employee.isVerified) return 'bg-green-50 border-green-200';
    return 'bg-orange-50 border-orange-200';
  };

  return (
    <div className="p-4 md:p-6 space-y-6 min-h-screen">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 via-rose-500 to-fuchsia-500 bg-clip-text text-transparent">
            Team Members
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Manage and view all employees in your organization
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button 
            onClick={handleRefresh}
            disabled={status === 'loading'}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:from-orange-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-md"
          >
            {status === 'loading' ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </>
            )}
          </button>
        </div>
      </header>

      {/* Stats Overview */}
      {status === 'succeeded' && Array.isArray(employees) && employees.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 border border-blue-600 shadow-md">
            <div className="text-2xl font-bold text-white">{employees.length}</div>
            <div className="text-blue-100 text-sm">Total Employees</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 border border-green-600 shadow-md">
            <div className="text-2xl font-bold text-white">
              {employees.filter(emp => emp.isVerified && emp.isActive).length}
            </div>
            <div className="text-green-100 text-sm">Active & Verified</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 border border-purple-600 shadow-md">
            <div className="text-2xl font-bold text-white">
              {employees.filter(emp => emp.role === 'ADMIN').length}
            </div>
            <div className="text-purple-100 text-sm">Administrators</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 border border-orange-600 shadow-md">
            <div className="text-2xl font-bold text-white">
              {employees.filter(emp => !emp.isVerified && emp.isActive).length}
            </div>
            <div className="text-orange-100 text-sm">Pending Verification</div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {status === 'loading' && (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          </div>
          <div className="text-gray-700 text-lg">Loading team members...</div>
          <div className="text-gray-500 text-sm mt-2">Please wait while we fetch the employee data</div>
        </div>
      )}

      {/* Error State */}
      {status === 'failed' && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-red-800 font-medium">Failed to load employees</div>
              <div className="text-red-600 text-sm">{error || 'Unknown error occurred'}</div>
            </div>
          </div>
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 rounded-lg text-sm bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Success State - Card Layout */}
      {status === 'succeeded' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              All Employees ({Array.isArray(employees) ? employees.length : 0})
            </h2>
            <div className="text-gray-600 text-sm">
              Sorted by latest join date
            </div>
          </div>
          
          {!Array.isArray(employees) || employees.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="text-gray-700 text-lg mb-2">No employees found</div>
              <div className="text-gray-500 text-sm">Start by onboarding new team members to your organization</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {employees.map((employee) => {
                const roleInfo = getRoleDisplay(employee.role);
                const placeholder = getAvatarPlaceholder(employee);
                return (
                  <div 
                    key={employee.user_id || employee.email} 
                    onClick={() => companyId && (employee.user_id || employee.id) && navigate(`/${companyId}/users/list/${employee.user_id || employee.id}/profile`)}
                    className={`cursor-pointer rounded-xl border ${getCardBackground(employee)} p-4 hover:scale-105 transition-all duration-200 hover:shadow-lg shadow-sm`}
                  >
                    {/* Header with Avatar and Status */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar 
                          src={employee.avatar} 
                          alt={employee.firstName && employee.lastName 
                            ? `${employee.firstName} ${employee.lastName}`
                            : employee.name || 'Employee'
                          }
                          placeholder={placeholder}
                        />
                        <div>
                          <div className="font-semibold text-gray-900 truncate max-w-[120px]">
                            {employee.firstName && employee.lastName 
                              ? `${employee.firstName} ${employee.lastName}`
                              : employee.name || 'Unnamed Employee'
                            }
                          </div>
                          <div className="text-gray-600 text-xs">
                            {employee.employeeId}
                          </div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-[10px] font-medium whitespace-nowrap ${getStatusBadge(employee)}`}>
                        {getStatusText(employee)}
                      </span>
                    </div>

                    {/* Role Badge */}
                    <div className="mb-3">
                      <span className={`px-2 py-1 rounded text-[10px] font-medium border ${roleInfo.style}`}>
                        {roleInfo.text}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-gray-700">
                        <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="truncate text-gray-900 font-medium">{employee.email}</span>
                      </div>
                      
                      {employee.phone && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="text-gray-900 font-medium">{employee.phone}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-gray-700">
                        <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0A1.5 1.5 0 013 15.546V6a2 2 0 012-2h14a2 2 0 012 2v9.546z" />
                        </svg>
                        <span className="text-gray-900 font-medium">{employee.designation?.title || 'No designation'}</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-700">
                        <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-gray-900 font-medium">Joined {formatDate(employee.joiningDate)}</span>
                      </div>

                      {employee.salary && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          <span className="text-gray-900 font-medium">₹{parseInt(employee.salary).toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Last Login */}
                    {employee.lastLogin && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="text-[10px] text-gray-500">
                          Last login: {formatDate(employee.lastLogin)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Idle State */}
      {status === 'idle' && (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <div className="text-gray-700 text-lg mb-2">Ready to load team members</div>
          <div className="text-gray-500 text-sm">Click refresh to fetch employee data</div>
        </div>
      )}
    </div>
  );
}