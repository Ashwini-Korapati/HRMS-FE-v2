import { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useParams } from "react-router-dom"
import {
  fetchAdminUserProfile,
  selectAdminProfile,
  selectAdminProfileLoading,
  selectAdminProfileError,
} from "../../Redux/Public/adminUserProfileSlice"

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
  const avatarUrl = profile?.avatarUrl || profile?.avatar || profile?.photoUrl || profile?.photo || null
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
            <div className={`w-14 h-14 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden grid place-items-center text-lg font-semibold text-neutral-800 dark:text-neutral-100 ${isLoading ? 'animate-pulse' : ''}`}>
              {isLoading ? (
                <div className="w-full h-full bg-neutral-200 dark:bg-neutral-700" />
              ) : avatarUrl ? (
                <img src={avatarUrl} alt={profile.firstName || profile.email} className="w-full h-full object-cover" />
              ) : (
                initials
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
          <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-3 py-1.5 transition-colors">
            {/* <Pencil size={14}/> */}
            Edit
          </button>
        </div>

        <hr className="my-4 border-neutral-200 dark:border-neutral-800" />

        {/* Personal Details */}
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Personal Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs text-neutral-500 mb-1">First Name</div>
            <InputBox value={profile.firstName} />
          </div>
          <div>
            <div className="text-xs text-neutral-500 mb-1">Last Name</div>
            <InputBox value={profile.lastName} />
          </div>
          <div>
            <div className="text-xs text-neutral-500 mb-1">Email address</div>
            <InputBox value={profile.email} />
          </div>
          <div>
            <div className="text-xs text-neutral-500 mb-1">Phone</div>
            <InputBox value={profile.phone} />
          </div>
          <div>
            <div className="text-xs text-neutral-500 mb-1">Bio</div>
            <InputBox value={profile.bio} />
          </div>
          <div>
            <div className="text-xs text-neutral-500 mb-1">Gender</div>
            <InputBox value={profile.gender} />
          </div>
          <div>
            <div className="text-xs text-neutral-500 mb-1">Date of Birth</div>
            <InputBox value={formatDate(profile.dateOfBirth)} />
          </div>
          <div>
            <div className="text-xs text-neutral-500 mb-1">National ID</div>
            <InputBox value={profile.nationalId || profile.nationalID} />
          </div>
        </div>

        {/* Address */}
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mt-6 mb-3">Address</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs text-neutral-500 mb-1">Country</div>
            <InputBox value={profile.addressCountry || profile.country} />
          </div>
          <div>
            <div className="text-xs text-neutral-500 mb-1">City/State</div>
            <InputBox value={profile.addressCity || profile.city || profile.state} />
          </div>
          <div>
            <div className="text-xs text-neutral-500 mb-1">Postal Code</div>
            <InputBox value={profile.postalCode || profile.zip} />
          </div>
          <div>
            <div className="text-xs text-neutral-500 mb-1">TAX ID</div>
            <InputBox value={profile.taxId || profile.taxID} />
          </div>
        </div>
      </section>



    



          </div>
        </div>
      </div>
    </main>
  )
}
