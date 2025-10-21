import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchEmployees, selectEmployees, selectEmployeesStatus, selectEmployeesError } from '../../Redux/Public/onboardinguserSlice'
import { toAssetUrl } from '../../config/config'

function RoleBadge({ role }) {
  const r = (role || '').toUpperCase()
  const style = r === 'ADMIN'
    ? 'bg-purple-100 text-purple-800 border border-purple-200'
    : 'bg-blue-100 text-blue-800 border border-blue-200'
  const text = r === 'ADMIN' ? 'Admin' : (r || 'User')
  return (
    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap ${style}`}>{text}</span>
  )
}

function Avatar({ employee, size = 32 }) {
  const path = employee?.avatarUrl || employee?.avatar || employee?.photoUrl || employee?.photo || ''
  const url = toAssetUrl(path) || null
  const initials = (employee?.firstName?.[0] || employee?.name?.[0] || employee?.email?.[0] || 'U').toUpperCase()
  const cls = `rounded-full border border-neutral-300 bg-neutral-100 text-neutral-700 grid place-items-center`;
  if (url) return <img src={url} alt={employee?.name || employee?.email || 'avatar'} className={cls} style={{ width: size, height: size, objectFit: 'cover' }} />
  return <div className={cls} style={{ width: size, height: size, fontSize: size * 0.45 }}>{initials}</div>
}

export default function SmartEmployeeRightSidebar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { userId: selectedUserId } = useParams()
  const auth = useSelector(s => s.auth)
  const companyId = auth?.company?.id

  const employees = useSelector(selectEmployees)
  const status = useSelector(selectEmployeesStatus)
  const error = useSelector(selectEmployeesError)

  useEffect(() => {
    if (status === 'idle' || status === 'failed') {
      dispatch(fetchEmployees())
    }
  }, [dispatch, status])

  const handleSelect = (emp) => {
    const uid = emp.user_id || emp.id
    if (!uid || !companyId) return
    navigate(`/${companyId}/users/list/${uid}/profile`)
  }

  return (
    <aside className="w-full lg:w-80 xl:w-96 lg:sticky lg:top-4">
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">Employees</h3>
          {status === 'loading' && (
            <div className="text-[10px] text-neutral-500">Loading…</div>
          )}
        </div>

        {status === 'failed' && (
          <div className="px-4 py-3 text-xs text-red-600">{String(error || 'Failed to load')}</div>
        )}

        <ul className="max-h-[70vh] overflow-auto divide-y divide-neutral-100 dark:divide-neutral-800">
          {(employees || []).map((emp) => {
            const uid = emp.user_id || emp.id
            const isActive = String(selectedUserId || '') === String(uid || '')
            const name = emp.firstName && emp.lastName ? `${emp.firstName} ${emp.lastName}` : (emp.name || emp.email || 'Unnamed')
            const designation = emp?.designation?.title || '—'
            return (
              <li key={uid || emp.email}
                  onClick={() => handleSelect(emp)}
                  className={`px-3 py-2 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/60 ${isActive ? 'bg-neutral-50 dark:bg-neutral-800/60' : ''}`}>
                <div className="flex items-center gap-3">
                  <Avatar employee={emp} size={32} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">{name}</div>
                      <RoleBadge role={emp.role} />
                    </div>
                    <div className="text-[11px] text-neutral-600 dark:text-neutral-300 truncate">{designation}</div>
                  </div>
                </div>
              </li>
            )
          })}
          {(!employees || employees.length === 0) && status === 'succeeded' && (
            <li className="px-4 py-6 text-center text-xs text-neutral-500">No employees found</li>
          )}
        </ul>
      </div>
    </aside>
  )
}
