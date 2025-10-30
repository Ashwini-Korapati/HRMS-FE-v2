import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectAuthState } from '../../Redux/Public/authSlice'
import { fetchOwnProfile, updateOwnProfile, changeOwnPassword, uploadOwnAvatar, deleteOwnAvatar, selectAdminProfile, selectAdminProfileLoading } from '../../Redux/Public/adminUserProfileSlice'
import SmartToster from '../../components/Prop/SmartToster'
import { toAssetUrl } from '../../config/config'
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
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-neutral-900/30 backdrop-blur-sm opacity-100 transition-opacity ease-out duration-200" onClick={onClose} />
      {/* Dialog */}
      <div className="absolute inset-0 grid place-items-center">
        <div className="w-[92vw] max-w-sm md:max-w-md rounded-2xl border border-white/20 bg-white/80 dark:bg-neutral-900/70 backdrop-blur-xl shadow-2xl p-4 translate-y-0 opacity-100 transition-all ease-out duration-200">
          {children}
        </div>
      </div>
    </div>
  )
}

// Enhanced Toast System Component
function ToastContainer({ toasts, onRemoveToast }) {
  if (!toasts.length) return null

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[1000] space-y-2 w-full max-w-md px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-xl border-2 backdrop-blur-xl shadow-2xl animate-fade-in transition-all duration-300 ${
            toast.type === 'error' 
              ? 'bg-red-50/90 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200' 
              : 'bg-green-50/90 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                toast.type === 'error' 
                  ? 'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-300' 
                  : 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300'
              }`}>
                {toast.type === 'error' ? '⚠️' : '✅'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{toast.message}</p>
                {toast.details && (
                  <p className="text-xs opacity-80 mt-1">{toast.details}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => onRemoveToast(toast.id)}
              className="flex-shrink-0 w-5 h-5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center transition-colors ml-2"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// Field Component
function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs text-neutral-500 mb-1 block">{label}</label>
      {children}
    </div>
  )
}

export default function UserProfilePage() {
  const dispatch = useDispatch()
  const auth = useSelector(selectAuthState)
  const profile = useSelector(selectAdminProfile)
  const loading = useSelector(selectAdminProfileLoading)

  const companyId = auth?.company?.id
  const userId = auth?.user?.id

  const [toasts, setToasts] = useState([])
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
  
  const [formInitialized, setFormInitialized] = useState(false)
  const [toast, setToast] = useState('')

  // Toast management functions
  const addToast = (message, type = 'success', details = null) => {
    const id = Date.now().toString()
    const toast = { id, message, type, details }
    setToasts(prev => [toast, ...prev])
    
    // Auto remove after 5 seconds for success, 8 seconds for errors
    const duration = type === 'error' ? 8000 : 5000
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const clearAllToasts = () => {
    setToasts([])
  }

  useEffect(() => {
    if (!companyId || !userId) return
    dispatch(fetchOwnProfile({ companyId, userId }))
  }, [dispatch, companyId, userId])

  const avatarUrl = toAssetUrl(profile?.avatar)

  useEffect(() => {
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

  useEffect(() => {
    if (!editing) {
      setFormInitialized(false)
    }
  }, [editing])

  const transformGender = (gender) => {
    if (!gender) return null
    const genderMap = {
      'MALE': 'Male',
      'FEMALE': 'Female', 
      'OTHER': 'Other'
    }
    return genderMap[gender] || gender
  }

  const onSave = async () => {
    if (!companyId || !userId) return
    const payload = {
      phone: form.phone,
      address: form.address,
      gender: transformGender(form.gender),
      dateOfBirth: form.dateOfBirth,
      emergencyContact: form.emergencyContact,
    }
    
    try {
      const res = await dispatch(updateOwnProfile({ companyId, userId, payload }))
      if (res?.type?.endsWith('fulfilled')) {
        addToast('Profile updated successfully', 'success')
        setEditing(false)
        dispatch(fetchOwnProfile({ companyId, userId }))
      } else {
        const errorMsg = res?.error?.message || 'Failed to update profile'
        addToast('Update failed', 'error', errorMsg)
      }
    } catch (e) {
      addToast('Update failed', 'error', e.message || 'Failed to update profile')
    }
  }

  const onChangePassword = async () => {
    setPwError('')
    if (!pw.currentPassword || !pw.newPassword) { 
      setPwError('Please fill all fields')
      addToast('Password change failed', 'error', 'Please fill all fields')
      return 
    }
    if (pw.newPassword !== pw.confirm) { 
      setPwError('Passwords do not match')
      addToast('Password change failed', 'error', 'Passwords do not match')
      return 
    }
    try {
      const res = await dispatch(changeOwnPassword({ companyId, userId, currentPassword: pw.currentPassword, newPassword: pw.newPassword }))
      if (res?.type?.endsWith('fulfilled')) {
        addToast('Password changed successfully', 'success')
        setPw({ currentPassword: '', newPassword: '', confirm: '' })
        setPwOpen(false)
      } else {
        const errorMsg = res?.error?.message || 'Failed to change password'
        addToast('Password change failed', 'error', errorMsg)
      }
    } catch (e) {
      addToast('Password change failed', 'error', e.message || 'Failed to change password')
    }
  }

  const onCancel = () => {
    setEditing(false)
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

  // Handle file upload with proper error handling
  const handleAvatarUpload = async (file) => {
    // Check file type
    const allowedTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'gif']
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    
    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
      const allowedTypesString = allowedTypes.map(type => `.${type}`).join(', ')
      addToast(
        'Invalid file type', 
        'error', 
        `File type .${fileExtension} is not allowed. Allowed types: ${allowedTypesString}`
      )
      return false
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      addToast('File too large', 'error', 'Maximum file size is 5MB')
      return false
    }

    try {
      const res = await dispatch(uploadOwnAvatar({ companyId, userId, file }))
      if (res?.type?.endsWith('fulfilled')) {
        addToast('Avatar updated successfully!', 'success')
        dispatch(fetchOwnProfile({ companyId, userId }))
        return true
      } else {
        const errorMsg = res?.error?.message || 'Failed to update avatar'
        addToast('Avatar update failed', 'error', errorMsg)
        return false
      }
    } catch (err) {
      addToast('Avatar update failed', 'error', err.message || 'Failed to update avatar')
      return false
    }
  }

  const handleAvatarRemove = async () => {
    try {
      const res = await dispatch(deleteOwnAvatar({ companyId, userId }))
      if (res?.type?.endsWith('fulfilled')) {
        addToast('Avatar removed successfully!', 'success')
        dispatch(fetchOwnProfile({ companyId, userId }))
      } else {
        const errorMsg = res?.error?.message || 'Failed to remove avatar'
        addToast('Avatar removal failed', 'error', errorMsg)
      }
    } catch (err) {
      addToast('Avatar removal failed', 'error', err.message || 'Failed to remove avatar')
    }
  }

  return (
    <div className="space-y-4">
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">My Profile</h1>
          <p className="text-xs text-neutral-500">Personal details and settings</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPwOpen(v => !v)}
            className="px-3 py-1.5 rounded-md text-xs border border-orange-500/40 text-orange-700 hover:bg-orange-50 dark:text-orange-300 dark:hover:bg-orange-500/10"
          >
            Change Password
          </button>
          {!editing ? (
            <button disabled={loading==='loading'} onClick={() => setEditing(true)} className="px-3 py-1.5 rounded-md text-xs border border-neutral-300 text-neutral-700 hover:bg-neutral-100 disabled:opacity-60 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800/50">Edit</button>
          ) : (
            <div className="flex items-center gap-2">
              <button disabled={loading==='loading'} onClick={onSave} className="px-3 py-1.5 rounded-md text-xs bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-60">Save</button>
              <button onClick={onCancel} className="px-3 py-1.5 rounded-md text-xs border border-neutral-300 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800/50">Cancel</button>
            </div>
          )}
        </div>
      </div>

      {/* Top card */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/40 backdrop-blur p-4 flex flex-col md:flex-row gap-4">
        <div className="flex items-start gap-4 md:w-1/3">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-orange-200 to-amber-200 p-[2px]">
              <div className="w-full h-full rounded-full bg-white overflow-hidden relative group">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={profile?.firstName || 'Avatar'} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full grid place-items-center text-lg font-semibold text-orange-700">
                    {(profile?.firstName || profile?.email || 'U')[0]}
                  </div>
                )}
                {/* Overlay controls */}
                <div className="absolute inset-0 bg-neutral-900/30 opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center">
                  <div className="flex gap-2">
                    <label className="px-2 py-1 rounded-md text-[11px] bg-white/90 text-neutral-800 border border-neutral-300 cursor-pointer">
                      Change
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          await handleAvatarUpload(file)
                          e.target.value = ''
                        }}
                      />
                    </label>
                    {avatarUrl ? (
                      <button
                        onClick={handleAvatarRemove}
                        className="px-2 py-1 rounded-md text-[11px] bg-white/90 text-neutral-800 border border-neutral-300"
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            <h2 className="text-lg font-semibold">
              {profile?.firstName} {profile?.lastName}
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
              <Mail size={14} />
              {profile?.email}
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
              <Shield size={14} />
              {profile?.role}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:flex-1">
          <Field label="Phone">
            {editing ? (
              <input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full px-3 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/60 text-sm" />
            ) : (
              <div className="text-sm text-neutral-800 dark:text-neutral-200">{profile?.phone || '—'}</div>
            )}
          </Field>
          <Field label="Date of Birth">
            <div className="text-sm text-neutral-800 dark:text-neutral-200">{profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : '—'}</div>
          </Field>
          <Field label="Joining Date">
            <div className="text-sm text-neutral-800 dark:text-neutral-200">{profile?.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : '—'}</div>
          </Field>
          <Field label="Last Login">
            <div className="text-sm text-neutral-800 dark:text-neutral-200">{profile?.lastLogin ? new Date(profile.lastLogin).toLocaleString() : '—'}</div>
          </Field>
        </div>
      </div>

      {/* Details cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/40 backdrop-blur p-4">
          <div className="text-sm font-semibold mb-3">Address</div>
          {editing ? (
            <textarea value={form.address} onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} rows={4} className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/60 text-sm" />
          ) : (
            <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-line min-h-[72px]">{profile?.address || '—'}</p>
          )}
        </div>
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/40 backdrop-blur p-4">
          <div className="text-sm font-semibold mb-3">Emergency Contact</div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name">
              {editing ? (
                <input value={form.emergencyContact.name} onChange={(e) => setForm(f => ({ ...f, emergencyContact: { ...f.emergencyContact, name: e.target.value } }))} className="w-full px-3 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/60 text-sm" />
              ) : (
                <div className="text-sm">{profile?.emergencyContact?.name || '—'}</div>
              )}
            </Field>
            <Field label="Phone">
              {editing ? (
                <input value={form.emergencyContact.phone} onChange={(e) => setForm(f => ({ ...f, emergencyContact: { ...f.emergencyContact, phone: e.target.value } }))} className="w-full px-3 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/60 text-sm" />
              ) : (
                <div className="text-sm">{profile?.emergencyContact?.phone || '—'}</div>
              )}
            </Field>
            <Field label="Email">
              {editing ? (
                <input value={form.emergencyContact.email} onChange={(e) => setForm(f => ({ ...f, emergencyContact: { ...f.emergencyContact, email: e.target.value } }))} className="w-full px-3 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/60 text-sm" />
              ) : (
                <div className="text-sm">{profile?.emergencyContact?.email || '—'}</div>
              )}
            </Field>
            <Field label="Relationship">
              {editing ? (
                <input value={form.emergencyContact.relationship} onChange={(e) => setForm(f => ({ ...f, emergencyContact: { ...f.emergencyContact, relationship: e.target.value } }))} className="w-full px-3 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/60 text-sm" />
              ) : (
                <div className="text-sm">{profile?.emergencyContact?.relationship || '—'}</div>
              )}
            </Field>
          </div>
        </div>
      </div>

      {/* Change password full-screen glass modal */}
      <SmartGlassModal open={pwOpen} onClose={() => setPwOpen(false)}>
        <div className="text-sm font-semibold mb-2">Change Password</div>
        <div className="space-y-2">
          <input type="password" value={pw.currentPassword} onChange={(e) => setPw(p => ({ ...p, currentPassword: e.target.value }))} placeholder="Current password" className="w-full px-3 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white/90 dark:bg-neutral-900/70 text-sm" />
          <input type="password" value={pw.newPassword} onChange={(e) => setPw(p => ({ ...p, newPassword: e.target.value }))} placeholder="New password" className="w-full px-3 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white/90 dark:bg-neutral-900/70 text-sm" />
          <input type="password" value={pw.confirm} onChange={(e) => setPw(p => ({ ...p, confirm: e.target.value }))} placeholder="Confirm password" className="w-full px-3 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white/90 dark:bg-neutral-900/70 text-sm" />
          {pwError && <div className="text-xs text-red-600">{pwError}</div>}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button onClick={() => setPwOpen(false)} className="px-3 py-1.5 rounded-md text-xs border border-neutral-300 dark:border-neutral-600">Cancel</button>
            <button disabled={loading==='loading'} onClick={onChangePassword} className="px-3 py-1.5 rounded-md text-xs bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-60">Update</button>
          </div>
        </div>
      </SmartGlassModal>

      {/* Toast */}
      <SmartToster message={toast} onClose={() => setToast('')} duration={2500} />
    </div>
  )
}