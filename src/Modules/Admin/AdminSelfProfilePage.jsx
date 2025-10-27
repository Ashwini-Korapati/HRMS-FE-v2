import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAdminUserProfile, selectAdminProfile, selectAdminProfileLoading, selectAdminProfileError, uploadOwnAvatar, deleteOwnAvatar, changeOwnPassword, updateOwnProfile } from '../../Redux/Public/adminUserProfileSlice'
import { toAssetUrl } from '../../config/config'
import SmartToster from '../../components/Prop/SmartToster'

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
      <div className="absolute inset-0 bg-neutral-900/30 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 grid place-items-center">
        <div className="w-[92vw] max-w-sm md:max-w-md rounded-2xl border border-white/20 bg-white/80 dark:bg-neutral-900/70 backdrop-blur-xl shadow-2xl p-4">
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
  })

  useEffect(() => {
    if (companyId && userId) dispatch(fetchAdminUserProfile({ companyId, userId }))
  }, [dispatch, companyId, userId])

  const avatarUrl = toAssetUrl(profile?.avatar)

  useEffect(() => {
    if (!profile) return
    setForm({
      phone: profile.phone || '',
      address: profile.address || '',
      emergencyContact: {
        name: profile.emergencyContact?.name || '',
        email: profile.emergencyContact?.email || '',
        phone: profile.emergencyContact?.phone || '',
        relationship: profile.emergencyContact?.relationship || ''
      }
    })
  }, [profile])

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
      emergencyContact: form.emergencyContact,
    }
    try {
      const res = await dispatch(updateOwnProfile({ companyId, userId, payload }))
      if (res?.type?.endsWith('fulfilled')) {
        setToast('Profile updated successfully')
        setEditing(false)
      } else {
        setToast(res?.error?.message || 'Failed to update profile')
      }
    } catch (e) {
      setToast(e.message || 'Failed to update profile')
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-4">

      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">My Profile</h1>
          <p className="text-gray-600 text-sm mt-1">View and manage your personal information</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPwOpen(true)}
            className="px-3 py-1.5 rounded-md text-xs border border-orange-500/40 text-orange-700 hover:bg-orange-50 dark:text-orange-300 dark:hover:bg-orange-500/10"
          >
            Change Password
          </button>
          {!editing ? (
            <button disabled={loading==='loading'} onClick={() => setEditing(true)} className="px-3 py-1.5 rounded-md text-xs border border-neutral-300 text-neutral-700 hover:bg-neutral-100 disabled:opacity-60">Edit</button>
          ) : (
            <div className="flex items-center gap-2">
              <button disabled={loading==='loading'} onClick={onSave} className="px-3 py-1.5 rounded-md text-xs bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-60">Save</button>
              <button onClick={() => { setEditing(false) }} className="px-3 py-1.5 rounded-md text-xs border border-neutral-300 text-neutral-700 hover:bg-neutral-100">Cancel</button>
            </div>
          )}
        </div>
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
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-orange-200 to-amber-200 p-[2px]">
                  <div className="w-full h-full rounded-full bg-white overflow-hidden relative group">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={profile?.firstName || 'Avatar'} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full grid place-items-center text-lg font-semibold text-orange-700">
                        {(profile?.firstName || profile?.email || 'U')[0]}
                      </div>
                    )}
                    {/* Role badge */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] bg-neutral-900 text-white border border-white/30 shadow">
                      {(profile.role || auth?.user?.role || 'USER')}
                    </div>
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
                              try {
                                const res = await dispatch(uploadOwnAvatar({ companyId, userId, file }))
                                if (res?.type?.endsWith('fulfilled')) setToast('Avatar updated')
                                else setToast(res?.error?.message || 'Failed to update avatar')
                              } catch (err) {
                                setToast(err.message || 'Failed to update avatar')
                              } finally {
                                e.target.value = ''
                              }
                            }}
                          />
                        </label>
                        {avatarUrl ? (
                          <button
                            onClick={async () => {
                              try {
                                const res = await dispatch(deleteOwnAvatar({ companyId, userId }))
                                if (res?.type?.endsWith('fulfilled')) setToast('Avatar removed')
                                else setToast(res?.error?.message || 'Failed to remove avatar')
                              } catch (err) {
                                setToast(err.message || 'Failed to remove avatar')
                              }
                            }}
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
              <div className="sm:col-span-2">
                <div className="text-gray-500 mb-1">Address</div>
                {!editing ? (
                  <div className="font-medium text-gray-900 min-h-[44px] flex items-center">{profile.address || '-'}</div>
                ) : (
                  <textarea value={form.address} onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} rows={3} className="w-full px-3 py-2 rounded-md border border-neutral-300 bg-white text-sm" />
                )}
              </div>
              <div>
                <div className="text-gray-500 mb-1">Phone</div>
                {!editing ? (
                  <div className="font-medium text-gray-900 min-h-[38px] flex items-center">{profile.phone || '-'}</div>
                ) : (
                  <input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full px-3 py-2 rounded-md border border-neutral-300 bg-white text-sm" />
                )}
              </div>
              <div>
                <div className="text-gray-500 mb-1">Date of Birth</div>
                <div className="font-medium text-gray-900">{profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : '-'}</div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Joining</div>
                <div className="font-medium text-gray-900">{profile.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : '-'}</div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Last Login</div>
                <div className="font-medium text-gray-900">{profile.lastLogin ? new Date(profile.lastLogin).toLocaleString() : '-'}</div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-gray-500 mb-1">Emergency Contact</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-500">Name</div>
                    {!editing ? (
                      <div className="font-medium text-gray-900 min-h-[38px] flex items-center">{profile.emergencyContact?.name || '-'}</div>
                    ) : (
                      <input value={form.emergencyContact.name} onChange={(e) => setForm(f => ({ ...f, emergencyContact: { ...f.emergencyContact, name: e.target.value } }))} className="w-full px-3 py-2 rounded-md border border-neutral-300 bg-white text-sm" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Phone</div>
                    {!editing ? (
                      <div className="font-medium text-gray-900 min-h-[38px] flex items-center">{profile.emergencyContact?.phone || '-'}</div>
                    ) : (
                      <input value={form.emergencyContact.phone} onChange={(e) => setForm(f => ({ ...f, emergencyContact: { ...f.emergencyContact, phone: e.target.value } }))} className="w-full px-3 py-2 rounded-md border border-neutral-300 bg-white text-sm" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Email</div>
                    {!editing ? (
                      <div className="font-medium text-gray-900 min-h-[38px] flex items-center">{profile.emergencyContact?.email || '-'}</div>
                    ) : (
                      <input value={form.emergencyContact.email} onChange={(e) => setForm(f => ({ ...f, emergencyContact: { ...f.emergencyContact, email: e.target.value } }))} className="w-full px-3 py-2 rounded-md border border-neutral-300 bg-white text-sm" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Relationship</div>
                    {!editing ? (
                      <div className="font-medium text-gray-900 min-h-[38px] flex items-center">{profile.emergencyContact?.relationship || '-'}</div>
                    ) : (
                      <input value={form.emergencyContact.relationship} onChange={(e) => setForm(f => ({ ...f, emergencyContact: { ...f.emergencyContact, relationship: e.target.value } }))} className="w-full px-3 py-2 rounded-md border border-neutral-300 bg-white text-sm" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
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

      <SmartToster message={toast} onClose={() => setToast('')} duration={2500} />
    </div>
  )
}
