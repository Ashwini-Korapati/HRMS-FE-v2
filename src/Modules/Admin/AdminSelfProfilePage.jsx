import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchAdminUserProfile, selectAdminProfile, selectAdminProfileLoading, selectAdminProfileError } from '../../Redux/Public/adminUserProfileSlice'

export default function AdminSelfProfilePage() {
  const dispatch = useDispatch()
  const auth = useSelector(state => state.auth)
  const companyId = auth?.company?.id
  const userId = auth?.user?.id
  const profile = useSelector(selectAdminProfile)
  const loading = useSelector(selectAdminProfileLoading)
  const error = useSelector(selectAdminProfileError)

  useEffect(() => {
    if (companyId && userId) dispatch(fetchAdminUserProfile({ companyId, userId }))
  }, [dispatch, companyId, userId])

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Breadcrumbs */}
      <nav className="text-sm text-gray-600">
        <Link to={`/${companyId}/overview`} className="hover:underline">Dashboard</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">My Profile</span>
      </nav>

      <header>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">My Profile</h1>
        <p className="text-gray-600 text-sm mt-1">View and manage your personal information</p>
      </header>

      {loading === 'loading' ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">Loading profile…</div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm text-rose-700">{error}</div>
      ) : !profile ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">No profile data</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 grid place-items-center text-lg font-semibold text-gray-700">
                {(profile.firstName?.[0] || profile.email?.[0] || 'U').toUpperCase()}
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">{profile.firstName} {profile.lastName}</div>
                <div className="text-sm text-gray-600">{profile.email}</div>
                <div className="text-xs text-gray-500">{profile.employeeId}</div>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-700 space-y-1">
              <div><span className="text-gray-500">Role:</span> <span className="font-medium">{profile.role}</span></div>
              <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{profile.phone || '-'}</span></div>
              <div><span className="text-gray-500">Designation:</span> <span className="font-medium">{profile.designation?.title || '-'}</span></div>
              <div><span className="text-gray-500">Department:</span> <span className="font-medium">{profile.department?.name || '-'}</span></div>
            </div>
          </div>
          <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Address</div>
                <div className="font-medium text-gray-900">{profile.address || '-'}</div>
              </div>
              <div>
                <div className="text-gray-500">Date of Birth</div>
                <div className="font-medium text-gray-900">{profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : '-'}</div>
              </div>
              <div>
                <div className="text-gray-500">Joining</div>
                <div className="font-medium text-gray-900">{profile.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : '-'}</div>
              </div>
              <div>
                <div className="text-gray-500">Last Login</div>
                <div className="font-medium text-gray-900">{profile.lastLogin ? new Date(profile.lastLogin).toLocaleString() : '-'}</div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-gray-500">Emergency Contact</div>
                <div className="font-medium text-gray-900">{profile.emergencyContact?.name || '-'} ({profile.emergencyContact?.relationship || '-'})</div>
                <div className="text-gray-700">{profile.emergencyContact?.email || '-'} · {profile.emergencyContact?.phone || '-'}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
