// 

import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAdminUserProfile, selectAdminProfile, selectAdminProfileLoading, selectAdminProfileError, uploadOwnAvatar, deleteOwnAvatar, changeOwnPassword, updateOwnProfile } from '../../Redux/Public/adminUserProfileSlice'
import { toAssetUrl } from '../../config/config'
import SmartToster from '../../components/Prop/SmartToster'
import { User, Mail, Phone, MapPin, Calendar, Shield, Clock, Edit3, Key, Save, X, Building, VenetianMask, DollarSign, LogOut, Cake, Users, Target } from 'lucide-react'

function SmartGlassModal({ open, onClose, children }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[100] animate-fade-in">
      <div className="absolute inset-0 bg-neutral-900/30 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-white/20 bg-white/80 dark:bg-neutral-900/70 backdrop-blur-xl shadow-2xl p-6 animate-scale-in">
          {children}
        </div>
      </div>
    </div>
  )
}

export default function AdminSelfProfilePage() {
  const dispatch = useDispatch()
  const auth = useSelector(state => state.auth)
  const companyId = auth?.company?.id
  const userId = auth?.user?.id
  const profile = useSelector(selectAdminProfile)
  const loading = useSelector(selectAdminProfileLoading)
  const error = useSelector(selectAdminProfileError)

  const [toast, setToast] = useState('')
  const [pwOpen, setPwOpen] = useState(false)
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [pwError, setPwError] = useState('')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    phone: '',
    address: '',
    emergencyContact: { name: '', email: '', phone: '', relationship: '' },
    gender: '',
    dateOfBirth: '',
  })
  
  // Track if form has been initialized
  const [formInitialized, setFormInitialized] = useState(false)

  useEffect(() => {
    if (companyId && userId) dispatch(fetchAdminUserProfile({ companyId, userId }))
  }, [dispatch, companyId, userId])

  const avatarUrl = toAssetUrl(profile?.avatar)

  useEffect(() => {
    // Only initialize form once when profile loads and form hasn't been initialized
    if (!profile || formInitialized) return
    
    setForm({
      phone: profile.phone || '',
      address: profile.address || '',
      gender: profile.gender || '',
      dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '',
      emergencyContact: profile.emergencyContact ? {
        name: profile.emergencyContact.name || '',
        email: profile.emergencyContact.email || '',
        phone: profile.emergencyContact.phone || '',
        relationship: profile.emergencyContact.relationship || ''
      } : { name: '', email: '', phone: '', relationship: '' }
    })
    setFormInitialized(true)
  }, [profile, formInitialized])

  // Reset form initialization when editing is cancelled or saved
  useEffect(() => {
    if (!editing) {
      setFormInitialized(false)
    }
  }, [editing])

  // Transform gender values to match backend expectations
  const transformGender = (gender) => {
    if (!gender) return null
    const genderMap = {
      'MALE': 'Male',
      'FEMALE': 'Female', 
      'OTHER': 'Other'
    }
    return genderMap[gender] || gender
  }

  const onChangePassword = async () => {
    setPwError('')
    if (!pw.currentPassword || !pw.newPassword) { setPwError('Please fill all fields'); return }
    if (pw.newPassword !== pw.confirm) { setPwError('Passwords do not match'); return }
    try {
      const res = await dispatch(changeOwnPassword({ companyId, userId, currentPassword: pw.currentPassword, newPassword: pw.newPassword }))
      if (res?.type?.endsWith('fulfilled')) {
        setToast('Password changed successfully')
        setPw({ currentPassword: '', newPassword: '', confirm: '' })
        setPwOpen(false)
      } else {
        setToast(res?.error?.message || 'Failed to change password')
      }
    } catch (e) {
      setToast(e.message || 'Failed to change password')
    }
  }

  const onSave = async () => {
    if (!companyId || !userId) return
    const payload = {
      phone: form.phone,
      address: form.address,
      gender: transformGender(form.gender), // Apply transformation
      dateOfBirth: form.dateOfBirth,
      emergencyContact: form.emergencyContact,
    }
    
    try {
      const res = await dispatch(updateOwnProfile({ companyId, userId, payload }))
      if (res?.type?.endsWith('fulfilled')) {
        setToast('Profile updated successfully')
        setEditing(false)
        // Refresh the profile data after successful update
        dispatch(fetchAdminUserProfile({ companyId, userId }))
      } else {
        setToast(res?.error?.message || 'Failed to update profile')
      }
    } catch (e) {
      setToast(e.message || 'Failed to update profile')
    }
  }

  const onCancel = () => {
    setEditing(false)
    // Reset form to original profile data
    if (profile) {
      setForm({
        phone: profile.phone || '',
        address: profile.address || '',
        gender: profile.gender || '',
        dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '',
        emergencyContact: profile.emergencyContact ? {
          name: profile.emergencyContact.name || '',
          email: profile.emergencyContact.email || '',
          phone: profile.emergencyContact.phone || '',
          relationship: profile.emergencyContact.relationship || ''
        } : { name: '', email: '', phone: '', relationship: '' }
      })
    }
  }

  // Format currency for salary
  const formatSalary = (salary) => {
    if (!salary) return '-'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(salary)
  }

  // Format gender for display
  const formatGender = (gender) => {
    const genderMap = {
      'MALE': 'Male',
      'FEMALE': 'Female',
      'OTHER': 'Other',
      'Male': 'Male',
      'Female': 'Female', 
      'Other': 'Other'
    }
    return genderMap[gender] || gender || '-'
  }

  // Add these styles to your global CSS
  const styles = `
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes scale-in {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-5px); }
    }
    @keyframes glow {
      0%, 100% { box-shadow: 0 0 20px rgba(249, 115, 22, 0.1); }
      50% { box-shadow: 0 0 30px rgba(249, 115, 22, 0.2); }
    }
    .animate-fade-in { animation: fade-in 0.3s ease-out; }
    .animate-scale-in { animation: scale-in 0.2s ease-out; }
    .animate-float { animation: float 3s ease-in-out infinite; }
    .animate-glow { animation: glow 2s ease-in-out infinite; }
    .gradient-border {
      background: linear-gradient(135deg, #f97316, #ec4899, #8b5cf6);
      padding: 1px;
      border-radius: 16px;
    }
    .glass-effect {
      backdrop-filter: blur(16px);
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .clickable {
      cursor: pointer;
      transition: all 0.2s ease-in-out;
    }
    .clickable:hover {
      transform: translateY(-2px);
    }
  `

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 p-4 md:p-6">
      <style>{styles}</style>
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-orange-200 rounded-full blur-3xl opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-rose-200 rounded-full blur-3xl opacity-20 animate-float" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-amber-200 rounded-full blur-3xl opacity-10 animate-float" style={{animationDelay: '2.5s'}}></div>
      </div>

      <div className="relative space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 via-rose-500 to-purple-500 bg-clip-text text-transparent">
              My Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
              Manage your personal information and preferences
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPwOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-border hover:animate-glow transition-all duration-300 group clickable"
            >
              <div className="flex items-center gap-2 bg-white dark:bg-neutral-800 rounded-xl px-3 py-2 group-hover:bg-orange-50 dark:group-hover:bg-neutral-700 transition-colors">
                <Key size={16} className="text-orange-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</span>
              </div>
            </button>
            {!editing ? (
              <button 
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 hover:border-orange-300 dark:hover:border-orange-600 text-gray-700 dark:text-gray-300 hover:text-orange-600 transition-all duration-300 clickable"
              >
                <Edit3 size={16} />
                <span className="text-sm font-medium">Edit Profile</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={onSave}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:from-orange-600 hover:to-rose-600 transition-all duration-300 shadow-lg hover:shadow-xl clickable"
                >
                  <Save size={16} />
                  <span className="text-sm font-medium">Save</span>
                </button>
                <button 
                  onClick={onCancel}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 hover:border-red-300 text-gray-700 dark:text-gray-300 hover:text-red-600 transition-all duration-300 clickable"
                >
                  <X size={16} />
                  <span className="text-sm font-medium">Cancel</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {loading === 'loading' ? (
          <div className="gradient-border animate-pulse">
            <div className="rounded-2xl bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl p-12 text-center shadow-xl">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-4">Loading profile...</p>
            </div>
          </div>
        ) : error ? (
          <div className="gradient-border animate-shake">
            <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 text-center shadow-xl">
              <div className="text-red-600 dark:text-red-400 text-lg">⚠️</div>
              <p className="text-red-700 dark:text-red-300 mt-2">{error}</p>
            </div>
          </div>
        ) : !profile ? (
          <div className="gradient-border">
            <div className="rounded-2xl bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl p-12 text-center shadow-xl">
              <div className="text-gray-400 text-4xl mb-4">👤</div>
              <p className="text-gray-600 dark:text-gray-400">No profile data available</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="xl:col-span-1 space-y-6">
              <div className="gradient-border hover:animate-glow transition-all duration-500">
                <div className="rounded-2xl bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl p-6 shadow-xl">
                  <div className="flex flex-col items-center text-center">
                    {/* Avatar */}
                    <div className="relative mb-4">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-orange-400 via-rose-400 to-purple-400 p-1 shadow-2xl">
                        <div className="w-full h-full rounded-full bg-white dark:bg-neutral-800 overflow-hidden relative group">
                          {avatarUrl ? (
                            <img 
                              src={avatarUrl} 
                              alt={profile?.firstName || 'Avatar'} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full grid place-items-center text-2xl font-bold bg-gradient-to-br from-orange-100 to-rose-100 dark:from-neutral-700 dark:to-neutral-600 text-orange-600 dark:text-orange-400">
                              {(profile?.firstName || profile?.email || 'U')[0]}
                            </div>
                          )}
                          
                          {/* Avatar Actions */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full grid place-items-center">
                            <div className="flex flex-col gap-2">
                              <label className="px-3 py-1.5 rounded-full text-xs bg-white/95 text-gray-800 border border-gray-300 cursor-pointer hover:bg-white transition-colors clickable">
                                📷 Change
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0]
                                    if (!file) return
                                    try {
                                      const res = await dispatch(uploadOwnAvatar({ companyId, userId, file }))
                                      if (res?.type?.endsWith('fulfilled')) {
                                        setToast('Avatar updated successfully!')
                                        // Refresh profile data
                                        dispatch(fetchAdminUserProfile({ companyId, userId }))
                                      } else {
                                        setToast(res?.error?.message || 'Failed to update avatar')
                                      }
                                    } catch (err) {
                                      setToast(err.message || 'Failed to update avatar')
                                    } finally {
                                      e.target.value = ''
                                    }
                                  }}
                                />
                              </label>
                              {avatarUrl && (
                                <button
                                  onClick={async () => {
                                    try {
                                      const res = await dispatch(deleteOwnAvatar({ companyId, userId }))
                                      if (res?.type?.endsWith('fulfilled')) {
                                        setToast('Avatar removed successfully!')
                                        // Refresh profile data
                                        dispatch(fetchAdminUserProfile({ companyId, userId }))
                                      } else {
                                        setToast(res?.error?.message || 'Failed to remove avatar')
                                      }
                                    } catch (err) {
                                      setToast(err.message || 'Failed to remove avatar')
                                    }
                                  }}
                                  className="px-3 py-1.5 rounded-full text-xs bg-white/95 text-gray-800 border border-gray-300 hover:bg-white transition-colors clickable"
                                >
                                  🗑️ Remove
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Role Badge */}
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 text-white text-xs font-bold border-2 border-white dark:border-neutral-800 shadow-lg">
                        {profile.role || auth?.user?.role || 'USER'}
                      </div>
                    </div>

                    {/* User Info */}
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      {profile.firstName} {profile.lastName}
                    </h2>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mt-1">
                      <Mail size={14} />
                      <span className="text-sm">{profile.email}</span>
                    </div>
                    {profile.employeeId && (
                      <div className="text-xs text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-neutral-700 px-3 py-1 rounded-full mt-2">
                        ID: {profile.employeeId}
                      </div>
                    )}

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4 mt-6 w-full">
                      <div className="text-center p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                        <Phone size={16} className="mx-auto text-orange-600 dark:text-orange-400" />
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Phone</div>
                        <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                          {profile.phone || 'Not set'}
                        </div>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
                        <Shield size={16} className="mx-auto text-rose-600 dark:text-rose-400" />
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Status</div>
                        <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                          {profile.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Company & Department Info Card */}
              <div className="gradient-border">
                <div className="rounded-2xl bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl p-6 shadow-xl">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                    <Building size={18} className="text-orange-500" />
                    Organization
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-neutral-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Company</span>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {profile.company?.name || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-neutral-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Designation</span>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {profile.designation?.title || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-neutral-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Department</span>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {profile.department?.name || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Joined</span>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {profile.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info Card */}
              <div className="gradient-border">
                <div className="rounded-2xl bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl p-6 shadow-xl">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                    <Target size={18} className="text-orange-500" />
                    Additional Info
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-neutral-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Platform</span>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {profile.platform || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-neutral-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Verified</span>
                      <span className={`text-sm font-medium ${profile.isVerified ? 'text-green-600' : 'text-red-600'}`}>
                        {profile.isVerified ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-neutral-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Project Status</span>
                      <span className={`text-sm font-medium ${profile.isActiveInProject ? 'text-green-600' : 'text-yellow-600'}`}>
                        {profile.isActiveInProject ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Salary</span>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {formatSalary(profile.salary)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Details Card */}
            <div className="xl:col-span-2">
              <div className="gradient-border">
                <div className="rounded-2xl bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl p-6 shadow-xl">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">
                    Personal Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        <User size={16} className="text-orange-500" />
                        Personal Info
                      </h4>
                      
                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Gender</label>
                        {!editing ? (
                          <div className="px-4 py-3 rounded-xl bg-gray-50 dark:bg-neutral-700/50 border border-gray-200 dark:border-neutral-600 text-gray-800 dark:text-gray-200 flex items-center gap-2">
                            <VenetianMask size={14} className="text-orange-500" />
                            {formatGender(profile.gender)}
                          </div>
                        ) : (
                          <select
                            value={form.gender}
                            onChange={(e) => setForm(f => ({ ...f, gender: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl border border-orange-300 bg-white dark:bg-neutral-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                          >
                            <option value="">Select Gender</option>
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                          </select>
                        )}
                      </div>

                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Date of Birth</label>
                        {!editing ? (
                          <div className="px-4 py-3 rounded-xl bg-gray-50 dark:bg-neutral-700/50 border border-gray-200 dark:border-neutral-600 text-gray-800 dark:text-gray-200 flex items-center gap-2">
                            <Cake size={14} className="text-orange-500" />
                            {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'Not provided'}
                          </div>
                        ) : (
                          <input 
                            type="date"
                            value={form.dateOfBirth}
                            onChange={(e) => setForm(f => ({ ...f, dateOfBirth: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl border border-orange-300 bg-white dark:bg-neutral-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                          />
                        )}
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        <Phone size={16} className="text-orange-500" />
                        Contact Info
                      </h4>
                      
                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Phone Number</label>
                        {!editing ? (
                          <div className="px-4 py-3 rounded-xl bg-gray-50 dark:bg-neutral-700/50 border border-gray-200 dark:border-neutral-600 text-gray-800 dark:text-gray-200">
                            {profile.phone || 'Not provided'}
                          </div>
                        ) : (
                          <input 
                            value={form.phone} 
                            onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl border border-orange-300 bg-white dark:bg-neutral-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                            placeholder="Enter phone number"
                          />
                        )}
                      </div>

                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Last Login</label>
                        <div className="px-4 py-3 rounded-xl bg-gray-50 dark:bg-neutral-700/50 border border-gray-200 dark:border-neutral-600 text-gray-800 dark:text-gray-200 flex items-center gap-2">
                          <Clock size={14} className="text-orange-500" />
                          {profile.lastLogin ? new Date(profile.lastLogin).toLocaleString() : 'Never logged in'}
                        </div>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-3">
                        <MapPin size={16} className="text-orange-500" />
                        Address
                      </h4>
                      {!editing ? (
                        <div className="px-4 py-3 rounded-xl bg-gray-50 dark:bg-neutral-700/50 border border-gray-200 dark:border-neutral-600 text-gray-800 dark:text-gray-200 min-h-[80px]">
                          {profile.address || 'No address provided'}
                        </div>
                      ) : (
                        <textarea 
                          value={form.address} 
                          onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl border border-orange-300 bg-white dark:bg-neutral-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                          placeholder="Enter your address"
                        />
                      )}
                    </div>

                    {/* Emergency Contact */}
                    <div className="md:col-span-2">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                        <Shield size={16} className="text-orange-500" />
                        Emergency Contact
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-rose-50 dark:from-neutral-700/50 dark:to-neutral-700/30 border border-orange-200 dark:border-orange-800">
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Name</label>
                          {!editing ? (
                            <div className="px-3 py-2 rounded-lg bg-white dark:bg-neutral-600 border border-gray-200 dark:border-neutral-500 text-gray-800 dark:text-gray-200">
                              {profile.emergencyContact?.name || '-'}
                            </div>
                          ) : (
                            <input 
                              value={form.emergencyContact.name} 
                              onChange={(e) => setForm(f => ({ ...f, emergencyContact: { ...f.emergencyContact, name: e.target.value } }))}
                              className="w-full px-3 py-2 rounded-lg border border-orange-300 bg-white dark:bg-neutral-600 text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-orange-500"
                            />
                          )}
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Phone</label>
                          {!editing ? (
                            <div className="px-3 py-2 rounded-lg bg-white dark:bg-neutral-600 border border-gray-200 dark:border-neutral-500 text-gray-800 dark:text-gray-200">
                              {profile.emergencyContact?.phone || '-'}
                            </div>
                          ) : (
                            <input 
                              value={form.emergencyContact.phone} 
                              onChange={(e) => setForm(f => ({ ...f, emergencyContact: { ...f.emergencyContact, phone: e.target.value } }))}
                              className="w-full px-3 py-2 rounded-lg border border-orange-300 bg-white dark:bg-neutral-600 text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-orange-500"
                            />
                          )}
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Email</label>
                          {!editing ? (
                            <div className="px-3 py-2 rounded-lg bg-white dark:bg-neutral-600 border border-gray-200 dark:border-neutral-500 text-gray-800 dark:text-gray-200">
                              {profile.emergencyContact?.email || '-'}
                            </div>
                          ) : (
                            <input 
                              value={form.emergencyContact.email} 
                              onChange={(e) => setForm(f => ({ ...f, emergencyContact: { ...f.emergencyContact, email: e.target.value } }))}
                              className="w-full px-3 py-2 rounded-lg border border-orange-300 bg-white dark:bg-neutral-600 text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-orange-500"
                            />
                          )}
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Relationship</label>
                          {!editing ? (
                            <div className="px-3 py-2 rounded-lg bg-white dark:bg-neutral-600 border border-gray-200 dark:border-neutral-500 text-gray-800 dark:text-gray-200">
                              {profile.emergencyContact?.relationship || '-'}
                            </div>
                          ) : (
                            <input 
                              value={form.emergencyContact.relationship} 
                              onChange={(e) => setForm(f => ({ ...f, emergencyContact: { ...f.emergencyContact, relationship: e.target.value } }))}
                              className="w-full px-3 py-2 rounded-lg border border-orange-300 bg-white dark:bg-neutral-600 text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-orange-500"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Password Change Modal */}
        <SmartGlassModal open={pwOpen} onClose={() => setPwOpen(false)}>
          <div className="text-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-rose-500 rounded-full grid place-items-center mx-auto mb-3">
              <Key size={24} className="text-white" />
            </div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Change Password
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Enter your current and new password
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <input 
                type="password" 
                value={pw.currentPassword} 
                onChange={(e) => setPw(p => ({ ...p, currentPassword: e.target.value }))}
                placeholder="Current password" 
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <input 
                type="password" 
                value={pw.newPassword} 
                onChange={(e) => setPw(p => ({ ...p, newPassword: e.target.value }))}
                placeholder="New password" 
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <input 
                type="password" 
                value={pw.confirm} 
                onChange={(e) => setPw(p => ({ ...p, confirm: e.target.value }))}
                placeholder="Confirm new password" 
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>
            
            {pwError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                {pwError}
              </div>
            )}
            
            <div className="flex items-center justify-end gap-3 pt-2">
              <button 
                onClick={() => setPwOpen(false)}
                className="px-6 py-2.5 rounded-xl border border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors font-medium clickable"
              >
                Cancel
              </button>
              <button 
                disabled={loading === 'loading'}
                onClick={onChangePassword}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:from-orange-600 hover:to-rose-600 disabled:opacity-50 transition-all duration-300 font-medium shadow-lg hover:shadow-xl clickable"
              >
                Update Password
              </button>
            </div>
          </div>
        </SmartGlassModal>

        <SmartToster message={toast} onClose={() => setToast('')} duration={2500} />
      </div>
    </div>
  )
}