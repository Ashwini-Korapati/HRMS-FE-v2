import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectAuthState } from '../../Redux/Public/authSlice'
import { fetchOwnProfile, updateOwnProfile, changeOwnPassword, uploadOwnAvatar, deleteOwnAvatar, selectAdminProfile, selectAdminProfileLoading } from '../../Redux/Public/adminUserProfileSlice'
import SmartToster from '../../components/Prop/SmartToster'
import { toAssetUrl } from '../../config/config'

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wide text-neutral-500">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  )
}

function SmartGlassModal({ open, onClose, children }) {
  React.useEffect(() => {
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
        <div className="w-[92vw] max-w-sm md:max-w-md rounded-2xl border border-orange-500/20 dark:border-orange-500/40 bg-white dark:bg-neutral-900 backdrop-blur-xl shadow-2xl p-4 translate-y-0 opacity-100 transition-all ease-out duration-200">
          {children}
        </div>
      </div>
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

  const [toast, setToast] = React.useState('')
  const [editing, setEditing] = React.useState(false)
  const [form, setForm] = React.useState({
    phone: '',
    address: '',
    emergencyContact: { name: '', email: '', phone: '', relationship: '' },
  })

  const changeBtnRef = React.useRef(null)
  const [pwOpen, setPwOpen] = React.useState(false)
  const [pw, setPw] = React.useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [pwError, setPwError] = React.useState('')

  React.useEffect(() => {
    if (!companyId || !userId) return
    dispatch(fetchOwnProfile({ companyId, userId }))
  }, [dispatch, companyId, userId])

  React.useEffect(() => {
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

  const avatarUrl = toAssetUrl(profile?.avatar)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">My Profile</h1>
          <p className="text-xs text-neutral-500">Personal details and settings</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            ref={changeBtnRef}
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
              <button onClick={() => { setEditing(false); setPwError('') }} className="px-3 py-1.5 rounded-md text-xs border border-neutral-300 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800">Cancel</button>
            </div>
          )}
        </div>
      </div>

      {/* Top card */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 flex flex-col md:flex-row gap-4">
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
                    <label className="px-2 py-1 rounded-md text-[11px] bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 border border-neutral-300 cursor-pointer">
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
                        className="px-2 py-1 rounded-md text-[11px] bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 border border-neutral-300"
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-sm font-semibold">{profile?.firstName} {profile?.lastName}</div>
            <div className="text-xs text-neutral-500">{profile?.email}</div>
            <div className="text-xs text-neutral-600">
              <span className="font-medium">{profile?.designation?.title}</span>
              {profile?.department?.name ? <span className="text-neutral-400"> • {profile?.department?.name}</span> : null}
            </div>
            {profile?.employeeId && <div className="text-[11px] text-neutral-500">Employee ID: {profile.employeeId}</div>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:flex-1">
          <Field label="Phone">
            {editing ? (
              <input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full px-3 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm" />
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
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
          <div className="text-sm font-semibold mb-3">Address</div>
          {editing ? (
            <textarea value={form.address} onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} rows={4} className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm" />
          ) : (
            <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-line min-h-[72px]">{profile?.address || '—'}</p>
          )}
        </div>
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
          <div className="text-sm font-semibold mb-3">Emergency Contact</div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name">
              {editing ? (
                <input value={form.emergencyContact.name} onChange={(e) => setForm(f => ({ ...f, emergencyContact: { ...f.emergencyContact, name: e.target.value } }))} className="w-full px-3 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm" />
              ) : (
                <div className="text-sm">{profile?.emergencyContact?.name || '—'}</div>
              )}
            </Field>
            <Field label="Phone">
              {editing ? (
                <input value={form.emergencyContact.phone} onChange={(e) => setForm(f => ({ ...f, emergencyContact: { ...f.emergencyContact, phone: e.target.value } }))} className="w-full px-3 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm" />
              ) : (
                <div className="text-sm">{profile?.emergencyContact?.phone || '—'}</div>
              )}
            </Field>
            <Field label="Email">
              {editing ? (
                <input value={form.emergencyContact.email} onChange={(e) => setForm(f => ({ ...f, emergencyContact: { ...f.emergencyContact, email: e.target.value } }))} className="w-full px-3 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm" />
              ) : (
                <div className="text-sm">{profile?.emergencyContact?.email || '—'}</div>
              )}
            </Field>
            <Field label="Relationship">
              {editing ? (
                <input value={form.emergencyContact.relationship} onChange={(e) => setForm(f => ({ ...f, emergencyContact: { ...f.emergencyContact, relationship: e.target.value } }))} className="w-full px-3 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm" />
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
          <input type="password" value={pw.currentPassword} onChange={(e) => setPw(p => ({ ...p, currentPassword: e.target.value }))} placeholder="Current password" className="w-full px-3 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm" />
          <input type="password" value={pw.newPassword} onChange={(e) => setPw(p => ({ ...p, newPassword: e.target.value }))} placeholder="New password" className="w-full px-3 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm" />
          <input type="password" value={pw.confirm} onChange={(e) => setPw(p => ({ ...p, confirm: e.target.value }))} placeholder="Confirm password" className="w-full px-3 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm" />
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
