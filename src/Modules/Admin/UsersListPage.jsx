import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  selectEmployees, 
  selectEmployeesStatus, 
  selectEmployeesError, 
  fetchEmployees 
} from  '../../Redux/Public/onboardinguserSlice'

export default function UsersListPage() {
  const dispatch = useDispatch();
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
      return 'bg-red-500/20 text-red-400 border border-red-500/30';
    }
    if (employee.isVerified) {
      return 'bg-green-500/20 text-green-400 border border-green-500/30';
    }
    return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
  };

  // Get status text
  const getStatusText = (employee) => {
    if (!employee.isActive) return 'Inactive';
    if (employee.isVerified) return 'Verified';
    return 'Pending';
  };

  // Get role display text
  const getRoleDisplay = (role) => {
    if (role === 'ADMIN') return 'Administrator';
    if (role === 'USER') return 'User';
    return role || 'User';
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-lg font-semibold bg-gradient-to-r from-orange-400 via-rose-400 to-fuchsia-400 bg-clip-text text-transparent">
          Users List
        </h1>
        <div className="flex gap-2 flex-wrap">
          <button 
            onClick={handleRefresh}
            disabled={status === 'loading'}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 border border-white/20 text-neutral-200 hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </header>

      {/* Loading State */}
      {status === 'loading' && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
          <div className="text-neutral-400">Loading employees...</div>
        </div>
      )}

      {/* Error State */}
      {status === 'failed' && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <div className="text-red-400 text-sm">
            Error loading employees: {error || 'Unknown error occurred'}
          </div>
          <button 
            onClick={handleRefresh}
            className="mt-2 px-3 py-1 rounded text-xs bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Success State */}
      {status === 'succeeded' && (
        <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="px-4 py-2 text-[11px] uppercase tracking-wide text-neutral-400 border-b border-white/10">
            Employees ({Array.isArray(employees) ? employees.length : 0})
          </div>
          
          {!Array.isArray(employees) || employees.length === 0 ? (
            <div className="p-8 text-center text-neutral-500 text-sm">
              No employees found. Start by onboarding new employees.
            </div>
          ) : (
            <div className="divide-y divide-white/5 text-xs">
              {employees.map((employee) => (
                <div 
                  key={employee.user_id || employee.email} 
                  className="px-4 py-3 flex items-center justify-between hover:bg-white/5"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-neutral-200 truncate">
                        {employee.firstName && employee.lastName 
                          ? `${employee.firstName} ${employee.lastName}`
                          : employee.name || employee.employeeId || 'Unnamed Employee'
                        }
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded border border-blue-500/30">
                        {getRoleDisplay(employee.role)}
                      </span>
                    </div>
                    <div className="text-neutral-400 text-[11px] mt-1">
                      {employee.designation?.title || 'No designation'} • {employee.departmentId ? 'Department' : 'No department'}
                    </div>
                    <div className="text-neutral-500 text-[11px] mt-1">
                      ID: {employee.employeeId}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 ml-4">
                    <div className="text-right min-w-0">
                      <div className="text-neutral-300 truncate">{employee.email}</div>
                      <div className="text-neutral-500 text-[11px]">
                        Joined: {formatDate(employee.joiningDate)}
                      </div>
                    </div>
                    
                    <span className={`px-2 py-1 rounded-full text-[10px] font-medium whitespace-nowrap ${getStatusBadge(employee)}`}>
                      {getStatusText(employee)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Idle State */}
      {status === 'idle' && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
          <div className="text-neutral-400">Ready to load employees...</div>
        </div>
      )}
    </div>
  );
}