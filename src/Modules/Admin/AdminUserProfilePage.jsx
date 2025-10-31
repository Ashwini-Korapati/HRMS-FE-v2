import { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useParams } from "react-router-dom"
import {
  fetchAdminUserProfile,
  updateAdminUserProfile,
  selectAdminProfile,
  selectAdminProfileLoading,
  selectAdminProfileError,
} from "../../Redux/Public/adminUserProfileSlice"
import { toAssetUrl } from "../../config/config"

// icons
// icons (reserved if needed later) // import { Pencil } from 'lucide-react'

import SmartEmployeeLeftBar from "../../components/Prop/SmartEmployeeLeftBar"




export default function AdminUserProfilePage() {
  const dispatch = useDispatch()
  const { userId: selectedUserId } = useParams()
  const auth = useSelector((state) => state.auth)
  const companyId = auth?.company?.id
  const profile = useSelector(selectAdminProfile)
  const loading = useSelector(selectAdminProfileLoading)
  const error = useSelector(selectAdminProfileError)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    phone: '',
    bio: '',
    gender: '',
    dateOfBirth: '',
    addressCountry: '',
    addressCity: '',
    postalCode: '',
    taxId: ''
  })

  // Transition state for sliding content when switching selected user
  const prevIdRef = useRef(selectedUserId)
  const [exiting, setExiting] = useState(false)
  const [entering, setEntering] = useState(false)

  useEffect(() => {
    if (companyId && selectedUserId) {
      // trigger exit animation when id changes
      if (prevIdRef.current && prevIdRef.current !== selectedUserId) {
        setExiting(true)
        setEntering(false)
        setTimeout(() => setExiting(false), 180)
      }
      dispatch(fetchAdminUserProfile({ companyId, userId: selectedUserId }))
    }
  }, [dispatch, companyId, selectedUserId])

  // When the new profile finishes loading, run entering animation
  useEffect(() => {
    if (loading === 'succeeded' && prevIdRef.current !== selectedUserId) {
      setEntering(true)
      // short delay to allow browser to apply initial transform then transition to neutral
      const t = setTimeout(() => {
        setEntering(false)
        prevIdRef.current = selectedUserId
      }, 20)
      return () => clearTimeout(t)
    }
  }, [loading, selectedUserId])

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : "-")

  useEffect(() => {
    if (!profile) return
    setForm({
      phone: profile.phone || '',
      bio: profile.bio || '',
      gender: profile.gender || '',
      dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().slice(0,10) : '',
      addressCountry: profile.addressCountry || profile.country || '',
      addressCity: profile.addressCity || profile.city || profile.state || '',
      postalCode: profile.postalCode || profile.zip || '',
      taxId: profile.taxId || profile.taxID || ''
    })
  }, [profile])

  const onSave = async () => {
    if (!companyId || !selectedUserId) return
    const payload = {
      phone: form.phone,
      bio: form.bio,
      gender: form.gender,
      dateOfBirth: form.dateOfBirth || undefined,
      addressCountry: form.addressCountry,
      addressCity: form.addressCity,
      postalCode: form.postalCode,
      taxId: form.taxId
    }
    const res = await dispatch(updateAdminUserProfile({ companyId, userId: selectedUserId, payload }))
    if (res?.type?.endsWith('fulfilled')) setEditing(false)
  }

  if (loading === "loading" && !profile) {
    return <div className="rounded-xl border border-border bg-card p-12 text-center shadow-sm">Loading profile…</div>
  }
  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 shadow-sm text-destructive">
        {String(error)}
      </div>
    )
  }
  if (!profile) {
    return <div className="rounded-xl border border-border bg-card p-12 text-center shadow-sm">No profile data</div>
  }

  const initials = (profile.firstName?.[0] || profile.email?.[0] || "U").toUpperCase()
  const avatarUrl = toAssetUrl(profile?.avatarUrl || profile?.avatar || profile?.photoUrl || profile?.photo || '') || null
  const isLoading = loading === 'loading'

  const InputBox = ({ value, placeholder = '—' }) => (
    <div className="rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm text-neutral-900 dark:text-neutral-100 px-3 py-2 min-h-[38px]">
      {value ?? placeholder}
    </div>
  )

  return (
    <main className="mx-auto max-w-6xl p-4 md:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] xl:grid-cols-[320px_1fr] gap-4 items-start">
        <SmartEmployeeLeftBar />
        <div className="space-y-4 relative overflow-hidden">
          {/* Animated route transition: exit to right, enter from left */}
          <div
            key={selectedUserId}
            className={
              `transition-all duration-300 ease-out ` +
              (exiting ? 'translate-x-6 opacity-0' : entering ? '-translate-x-6 opacity-0' : 'translate-x-0 opacity-100')
            }
          >
      {/* Profile Information Card (matches screenshot aesthetics) */}
      <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm p-6">
        {/* Header row: avatar/name/designation + Edit button */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden grid place-items-center text-lg font-semibold text-neutral-800 dark:text-neutral-100 relative ${isLoading ? 'animate-pulse' : ''}`}>
              {isLoading ? (
                <div className="w-full h-full bg-neutral-200 dark:bg-neutral-700" />
              ) : avatarUrl ? (
                <img src={avatarUrl} alt={profile.firstName || profile.email} className="w-full h-full object-cover" />
              ) : (
                initials
              )}
              {!isLoading && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] bg-neutral-900 text-white border border-white/30 shadow">
                  {(profile.role || 'USER')}
                </div>
              )}
            </div>
            <div>
              <div className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {isLoading ? <span className="inline-block w-40 h-4 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" /> : `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.email}
              </div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                {isLoading ? <span className="inline-block w-28 h-3 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" /> : (profile.designation?.title || '—')}
              </div>
            </div>
          </div>
          {!editing ? (
            <button type="button" onClick={() => setEditing(true)} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-3 py-1.5 transition-colors">Edit</button>
          ) : (
            <div className="flex items-center gap-2">
              <button type="button" onClick={onSave} className="inline-flex items-center gap-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-3 py-1.5 transition-colors">Save</button>
              <button type="button" onClick={() => setEditing(false)} className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 text-sm font-medium px-3 py-1.5 transition-colors">Cancel</button>
            </div>
          )}
        </div>

        <hr className="my-4 border-neutral-200 dark:border-neutral-800" />

        {/* Personal Details */}
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Personal Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs text-neutral-600 dark:text-neutral-300 mb-1">First Name</div>
            <InputBox value={profile.firstName} />
          </div>
          <div>
            <div className="text-xs text-neutral-600 dark:text-neutral-300 mb-1">Last Name</div>
            <InputBox value={profile.lastName} />
          </div>
          <div>
            <div className="text-xs text-neutral-600 dark:text-neutral-300 mb-1">Email address</div>
            <InputBox value={profile.email} />
          </div>
          <div>
            <div className="text-xs text-neutral-600 dark:text-neutral-300 mb-1">Phone</div>
            {!editing ? <InputBox value={profile.phone} /> : (
              <input value={form.phone} onChange={(e)=>setForm(f=>({...f, phone: e.target.value}))} className="rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm text-neutral-900 dark:text-neutral-100 px-3 py-2 min-h-[38px] w-full" />
            )}
          </div>
          <div>
            <div className="text-xs text-neutral-600 dark:text-neutral-300 mb-1">Bio</div>
            {!editing ? <InputBox value={profile.bio} /> : (
              <textarea value={form.bio} onChange={(e)=>setForm(f=>({...f, bio: e.target.value}))} rows={2} className="rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm text-neutral-900 dark:text-neutral-100 px-3 py-2 w-full" />
            )}
          </div>
          <div>
            <div className="text-xs text-neutral-600 dark:text-neutral-300 mb-1">Gender</div>
            {!editing ? <InputBox value={profile.gender} /> : (
              <input value={form.gender} onChange={(e)=>setForm(f=>({...f, gender: e.target.value}))} className="rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm text-neutral-900 dark:text-neutral-100 px-3 py-2 min-h-[38px] w-full" />
            )}
          </div>
          <div>
            <div className="text-xs text-neutral-600 dark:text-neutral-300 mb-1">Date  Birth</div>
            {!editing ? <InputBox value={formatDate(profile.dateOfBirth)} /> : (
              <input type="date" value={form.dateOfBirth} onChange={(e)=>setForm(f=>({...f, dateOfBirth: e.target.value}))} className="rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm text-neutral-900 dark:text-neutral-100 px-3 py-2 min-h-[38px] w-full" />
            )}
          </div>
          <div>
            <div className="text-xs text-neutral-600 dark:text-neutral-300 mb-1">National ID</div>
            <InputBox value={profile.nationalId || profile.nationalID} />
          </div>
        </div>

        {/* Address */}
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mt-6 mb-3">Address</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs text-neutral-600 dark:text-neutral-300 mb-1">Country</div>
            {!editing ? <InputBox value={profile.addressCountry || profile.country} /> : (
              <input value={form.addressCountry} onChange={(e)=>setForm(f=>({...f, addressCountry: e.target.value}))} className="rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm text-neutral-900 dark:text-neutral-100 px-3 py-2 min-h-[38px] w-full" />
            )}
          </div>
          <div>
            <div className="text-xs text-neutral-600 dark:text-neutral-300 mb-1">City/State</div>
            {!editing ? <InputBox value={profile.addressCity || profile.city || profile.state} /> : (
              <input value={form.addressCity} onChange={(e)=>setForm(f=>({...f, addressCity: e.target.value}))} className="rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm text-neutral-900 dark:text-neutral-100 px-3 py-2 min-h-[38px] w-full" />
            )}
          </div>
          <div>
            <div className="text-xs text-neutral-600 dark:text-neutral-300 mb-1">Postal Code</div>
            {!editing ? <InputBox value={profile.postalCode || profile.zip} /> : (
              <input value={form.postalCode} onChange={(e)=>setForm(f=>({...f, postalCode: e.target.value}))} className="rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm text-neutral-900 dark:text-neutral-100 px-3 py-2 min-h-[38px] w-full" />
            )}
          </div>
          <div>
            <div className="text-xs text-neutral-600 dark:text-neutral-300 mb-1">TAX ID</div>
            {!editing ? <InputBox value={profile.taxId || profile.taxID} /> : (
              <input value={form.taxId} onChange={(e)=>setForm(f=>({...f, taxId: e.target.value}))} className="rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm text-neutral-900 dark:text-neutral-100 px-3 py-2 min-h-[38px] w-full" />
            )}
          </div>
        </div>
      </section>



    



          </div>
        </div>
      </div>
    </main>
  )
}
