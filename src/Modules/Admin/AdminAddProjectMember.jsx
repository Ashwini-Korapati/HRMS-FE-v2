import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchProjects, selectProjects, selectProjectsListLoading } from '../../Redux/Public/projectsSlice'
import { RefreshCw, Search, Check, UserPlus, X, ToggleLeft, ToggleRight, Clock, Building2 } from 'lucide-react'
import { fetchCompanyEmployees, selectEmployees, selectEmployeesLoading, selectEmployeesError, assignEmployeesToProject, selectEmployeesAssigning, selectEmployeesAssignError, selectEmployeesLastAssigned } from '../../Redux/Public/employeesSlice'
import { fetchWorkShifts, selectWorkShifts } from '../../Redux/Public/WorkShiftsSlice'

function ProjectList({ projects, currentId, onSelect, loading }) {
  return (
    <div className="space-y-1">
      {loading === 'loading' && <div className="text-[11px] text-neutral-500">Loading projects…</div>}
      {loading === 'succeeded' && projects.map(p => (
        <button
          key={p.id}
          onClick={() => onSelect(p.id)}
          className={`w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-left text-[11px] border transition-colors ${
            p.id === currentId
              ? 'bg-orange-500/15 border-orange-500/40 text-orange-700 dark:text-orange-300'
              : 'border-orange-500/20 hover:bg-orange-500/10 text-neutral-600 dark:text-neutral-300'
          }`}
        >
          <span className="truncate font-medium">{p.name}</span>
          <span className="text-[9px] opacity-70">{p.status || '—'}</span>
        </button>
      ))}
      {loading === 'succeeded' && !projects.length && <div className="text-[11px] text-neutral-500">No projects.</div>}
    </div>
  )
}

const ATTENDANCE_TYPES = [
  { value: 'OFFICE', label: 'Office' },
  { value: 'WORK_FROM_HOME', label: 'Work from Home' },
  { value: 'FIELD', label: 'Field' },
  { value: 'HYBRID', label: 'Hybrid' }
]

function EmployeeRow({ emp, onToggle, selected, disabled, featureState, onFeatureToggle, attendanceType, workShiftId, shifts, onAttendanceChange, onShiftChange }) {
  const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.email
  // Base from employee or defaults
  const baseEnabled = emp.enabledRoutesStatus || {}
  const availableFeatures = ['projects', 'task']
  const merged = {}
  availableFeatures.forEach(f => {
    const overrideObj = featureState || {}
    if (Object.prototype.hasOwnProperty.call(overrideObj, f)) merged[f] = overrideObj[f]
    else if (Object.prototype.hasOwnProperty.call(baseEnabled, f)) merged[f] = baseEnabled[f]
    else {
      // sensible defaults: projects -> true, task -> false
      merged[f] = f === 'projects'
    }
  })
  const features = Object.entries(merged)
  return (
    <div className={`flex flex-col rounded-lg border p-2 text-[11px] gap-1 bg-white/70 dark:bg-neutral-900/40 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            disabled={disabled}
            onClick={() => onToggle(emp)}
            className={`w-5 h-5 rounded-md grid place-items-center text-xs font-semibold border ${selected ? 'bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-neutral-300 dark:border-neutral-700 text-neutral-400'}`}
            title={disabled ? 'Already active in a project' : selected ? 'Remove' : 'Select'}
          >
            {selected ? <Check size={14} /> : '+'}
          </button>
          <div className="flex flex-col">
            <span className="font-medium text-neutral-700 dark:text-neutral-200 truncate max-w-[140px]">{fullName}</span>
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate max-w-[160px]">{emp.email}</span>
          </div>
        </div>
        {emp.isActiveInProject && (
          <span className="text-[9px] px-1 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">IN PROJECT</span>
        )}
      </div>
      {features.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {features.map(([feat,val]) => {
            const clickable = selected && !disabled
            const cls = val ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400' : 'bg-neutral-300/20 dark:bg-neutral-700/30 border-neutral-400/40 dark:border-neutral-600/40 text-neutral-500 dark:text-neutral-400'
            const content = <>
              {val ? <ToggleRight size={12} className="text-emerald-500" /> : <ToggleLeft size={12} className="text-neutral-400" />}{feat}
            </>
            return clickable ? (
              <button
                key={feat}
                type="button"
                onClick={() => onFeatureToggle(emp, feat, !val)}
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium border transition-colors ${cls} hover:brightness-110`}
                title={`Click to toggle ${feat}`}
              >
                {content}
              </button>
            ) : (
              <span key={feat} className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium border ${cls}`}>{content}</span>
            )
          })}
        </div>
      )}
      {/* Attendance & Shift controls (visible only when selected) */}
      {selected && !disabled && (
        <div className="flex flex-wrap items-center gap-2 pt-1.5">
          <div className="flex items-center gap-1">
            <Building2 size={12} className="text-neutral-400" />
            <select
              value={attendanceType || 'OFFICE'}
              onChange={(e) => onAttendanceChange(emp, e.target.value)}
              className="text-[11px] px-1.5 py-0.5 border rounded-md bg-white/80 dark:bg-neutral-900/60"
              title="Attendance Type"
            >
              {ATTENDANCE_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={12} className="text-neutral-400" />
            <select
              value={workShiftId || ''}
              onChange={(e) => onShiftChange(emp, e.target.value || null)}
              className={`text-[11px] px-1.5 py-0.5 border rounded-md bg-white/80 dark:bg-neutral-900/60 ${!workShiftId && (Array.isArray(shifts) && shifts.length > 0) ? 'border-amber-400' : ''}`}
              title="Work Shift"
            >
              <option value="">No shift</option>
              {(shifts || []).map(s => (
                <option key={s.id} value={s.id}>{s.name || s.title || s.code || s.id}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminAddProjectMember(){
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { projectId, companyUuid } = useParams()
  const projects = useSelector(selectProjects)
  const projectsLoading = useSelector(selectProjectsListLoading)
  const employees = useSelector(selectEmployees)
  const empLoading = useSelector(selectEmployeesLoading)
  const empError = useSelector(selectEmployeesError)
  const shifts = useSelector(selectWorkShifts)
  const assigning = useSelector(selectEmployeesAssigning)
  const assignError = useSelector(selectEmployeesAssignError)
  const lastAssigned = useSelector(selectEmployeesLastAssigned)
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState([]) // array of employee objects
  const [featureOverrides, setFeatureOverrides] = useState({}) // userId -> { feature: bool }
  const [assignmentOptions, setAssignmentOptions] = useState({}) // userId -> { attendanceType, workShiftId }
  const [auditLog, setAuditLog] = useState([])

  // Ensure projects loaded
  useEffect(() => { if(!projects.length) dispatch(fetchProjects()) }, [dispatch, projects.length])

  // Load employees once projects (and thus company context) is known
  useEffect(() => {
    if(!projects.length) return
    // Only fetch if not already loaded (loading === idle and no items) or previously failed
    if ((empLoading === 'idle' && !employees.length) || empLoading === 'failed') {
      dispatch(fetchCompanyEmployees())
    }
    // Always ensure we have shifts available for dropdowns
    dispatch(fetchWorkShifts(currentProject?.id))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects.length])

  const currentProject = useMemo(()=> projects.find(p => p.id === projectId) || null, [projects, projectId])

  const filteredEmployees = useMemo(()=> {
    if(!q) return employees
    const l = q.toLowerCase()
    return employees.filter(e => (e.firstName && e.firstName.toLowerCase().includes(l)) || (e.lastName && e.lastName.toLowerCase().includes(l)) || (e.email && e.email.toLowerCase().includes(l)))
  }, [employees, q])

  const toggleSelect = (emp) => {
    if(emp.isActiveInProject) return
    setSelected(sel => {
      const exists = sel.find(e => e.user_id === emp.user_id)
      if (exists) {
        // remove overrides when deselecting
        setFeatureOverrides(prev => {
          const next = { ...prev }
          delete next[emp.user_id]
          return next
        })
        setAssignmentOptions(prev => {
          const next = { ...prev }
          delete next[emp.user_id]
          return next
        })
        setAuditLog(log => [...log, { ts: Date.now(), action: 'deselect', userId: emp.user_id }])
        return sel.filter(e => e.user_id !== emp.user_id)
      }
      // initialize overrides from current state of employee (ensuring default keys)
      const base = emp.enabledRoutesStatus || {}
      const init = {
        projects: typeof base.projects === 'boolean' ? base.projects : true,
        task: typeof base.task === 'boolean' ? base.task : false
      }
      setFeatureOverrides(prev => ({ ...prev, [emp.user_id]: init }))
      // initialize assignment options defaults
      const defaultShift = Array.isArray(shifts) && shifts.length > 0 ? (shifts[0].id) : null
      setAssignmentOptions(prev => ({ ...prev, [emp.user_id]: { attendanceType: 'OFFICE', workShiftId: defaultShift } }))
      setAuditLog(log => [...log, { ts: Date.now(), action: 'select', userId: emp.user_id }])
      return [...sel, emp]
    })
  }

  const removeSelected = (id) => setSelected(sel => sel.filter(e => e.user_id !== id))

  const companyId = useMemo(() => {
    if (projects.length) return projects[0].companyId || projects[0].company?.id || projects[0].company?.tenent_id
    return null
  }, [projects])

  const handleAssign = async () => {
    if (!currentProject || !companyId || !selected.length || assigning === 'loading') return
    const members = selected.map(s => ({
      userId: s.user_id || s.id,
      enabledRoutesStatus: featureOverrides[s.user_id] || s.enabledRoutesStatus || { projects: true, task: false },
      attendanceType: assignmentOptions[s.user_id]?.attendanceType || 'OFFICE',
      workShiftId: assignmentOptions[s.user_id]?.workShiftId || null
    }))
    try {
      await dispatch(assignEmployeesToProject({ companyId, projectId: currentProject.id, members })).unwrap()
      // Clear selection on success
      setSelected([])
      setFeatureOverrides({})
      setAssignmentOptions({})
      setAuditLog(log => [...log, { ts: Date.now(), action: 'assign', count: members.length, projectId: currentProject.id }])
    } catch (_) {
      // swallow; error shown below
    }
  }

  const handleFeatureToggle = (emp, feat, nextVal) => {
    setFeatureOverrides(prev => {
      const current = prev[emp.user_id] || {
        projects: typeof emp.enabledRoutesStatus?.projects === 'boolean' ? emp.enabledRoutesStatus.projects : true,
        task: typeof emp.enabledRoutesStatus?.task === 'boolean' ? emp.enabledRoutesStatus.task : false
      }
      return { ...prev, [emp.user_id]: { ...current, [feat]: nextVal } }
    })
    setAuditLog(log => [...log, { ts: Date.now(), action: 'toggle-feature', userId: emp.user_id, feature: feat, value: nextVal }])
  }

  const handleAttendanceChange = (emp, type) => {
    setAssignmentOptions(prev => ({
      ...prev,
      [emp.user_id]: { attendanceType: type, workShiftId: prev[emp.user_id]?.workShiftId || null }
    }))
    setAuditLog(log => [...log, { ts: Date.now(), action: 'attendance', userId: emp.user_id, value: type }])
  }

  const handleShiftChange = (emp, shiftId) => {
    setAssignmentOptions(prev => ({
      ...prev,
      [emp.user_id]: { attendanceType: prev[emp.user_id]?.attendanceType || 'OFFICE', workShiftId: shiftId }
    }))
    setAuditLog(log => [...log, { ts: Date.now(), action: 'work-shift', userId: emp.user_id, value: shiftId }])
  }

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold bg-gradient-to-r from-orange-400 via-rose-400 to-fuchsia-400 bg-clip-text text-transparent flex items-center gap-2">
          <UserPlus size={18} /> Add Project Member
        </h1>
        <div className="flex items-center gap-2">
          <button onClick={() => dispatch(fetchProjects())} className="px-2 py-1.5 text-[11px] rounded-md border border-orange-500/30 bg-white/60 dark:bg-neutral-900/40 hover:bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center gap-1">
            <RefreshCw size={14} /> Projects
          </button>
          <button onClick={() => navigate(-1)} className="px-2 py-1.5 text-[11px] rounded-md border border-neutral-300 dark:border-neutral-700 bg-white/60 dark:bg-neutral-900/40 hover:bg-neutral-200/40 dark:hover:bg-neutral-800/60 text-neutral-600 dark:text-neutral-300">Back</button>
        </div>
      </div>
      <div className="grid xl:grid-cols-[260px_1fr_260px] gap-5 items-start">
        {/* Left: Projects */}
        <div className="rounded-xl border border-orange-500/30 bg-white/60 dark:bg-neutral-900/40 backdrop-blur p-3 max-h-[70vh] overflow-auto">
          <div className="text-[10px] uppercase tracking-wide font-semibold text-neutral-600 dark:text-neutral-400 mb-2">Projects</div>
          <ProjectList
            projects={projects}
            currentId={currentProject?.id}
            loading={projectsLoading}
            onSelect={(id)=> {
              if (!companyUuid) return
              navigate(`/${companyUuid}/projects/add-member/${id}`)
            }}
          />
        </div>
        {/* Center: Employee search */}
        <div className="flex flex-col gap-3">
          <div className="rounded-xl border border-neutral-300/60 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/50 backdrop-blur p-4 relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  value={q}
                  onChange={e=> setQ(e.target.value)}
                  placeholder="Search employees (name/email)…"
                  className="w-full pl-7 pr-3 py-2 rounded-md bg-white/70 dark:bg-neutral-900/60 border border-neutral-300 dark:border-neutral-700 text-[12px] focus:outline-none focus:ring-2 focus:ring-orange-400/40"
                />
              </div>
              {currentProject && (
                <div className="text-[10px] px-2 py-1 rounded-md bg-orange-500/10 border border-orange-500/30 text-orange-600 dark:text-orange-400 font-medium">
                  {currentProject.name}
                </div>
              )}
            </div>
            <div className="space-y-2 max-h-[48vh] overflow-auto pr-1">
              {empLoading === 'loading' && <div className="text-[11px] text-neutral-500">Loading employees…</div>}
              {empLoading === 'failed' && empError && <div className="text-[11px] text-rose-500">{empError}</div>}
              {empLoading === 'succeeded' && !empError && filteredEmployees.map(emp => {
                const isSel = !!selected.find(e => e.user_id === emp.user_id)
                return (
                  <EmployeeRow
                    key={emp.user_id}
                    emp={emp}
                    onToggle={toggleSelect}
                    selected={isSel}
                    disabled={emp.isActiveInProject}
                    featureState={featureOverrides[emp.user_id]}
                    onFeatureToggle={handleFeatureToggle}
                    attendanceType={assignmentOptions[emp.user_id]?.attendanceType}
                    workShiftId={assignmentOptions[emp.user_id]?.workShiftId}
                    shifts={shifts}
                    onAttendanceChange={handleAttendanceChange}
                    onShiftChange={handleShiftChange}
                  />
                )
              })}
              {empLoading === 'succeeded' && !empError && filteredEmployees.length === 0 && (
                <div className="text-[11px] text-neutral-500">No matching employees.</div>
              )}
            </div>
            {selected.length > 0 && (
              <div className="sticky bottom-0 left-0 right-0 mt-3 -mx-4 px-4 pt-3 pb-2 bg-gradient-to-t from-white/95 dark:from-neutral-900/95 to-white/0 dark:to-neutral-900/0 backdrop-blur flex flex-wrap gap-2 border-t border-neutral-200/60 dark:border-neutral-800">
                {selected.map(s => {
                  const nm = `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.email
                  return (
                    <span key={s.user_id} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-orange-500/10 border border-orange-500/30 text-[10px] text-orange-700 dark:text-orange-300">
                      {nm}
                      <button onClick={()=> removeSelected(s.user_id)} className="text-orange-500 hover:text-orange-400"><X size={12} /></button>
                    </span>
                  )
                })}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {assignError && <div className="text-[11px] text-rose-500">{assignError}</div>}
            {assigning === 'succeeded' && lastAssigned && lastAssigned.projectId === currentProject?.id && (
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400">Members added successfully.</div>
            )}
            {/* Soft validation hint */}
            {selected.length > 0 && Array.isArray(shifts) && shifts.length > 0 && selected.some(s => !assignmentOptions[s.user_id]?.workShiftId) && (
              <div className="text-[11px] text-amber-600">Tip: Select a work shift for all selected members for better scheduling.</div>
            )}
            <div className="flex justify-end">
              <button
                onClick={handleAssign}
                disabled={!selected.length || !currentProject || assigning === 'loading'}
                className="px-4 py-2 text-[12px] rounded-md font-medium bg-emerald-500/90 hover:bg-emerald-500 text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {assigning === 'loading' ? <span className="animate-pulse">…</span> : <UserPlus size={14} />} Add to Project
              </button>
            </div>
          </div>
        </div>
        {/* Right: Placeholder for future (summary / preview) */}
        <div className="rounded-xl border border-neutral-300/60 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/50 backdrop-blur p-4 space-y-3">
          <div className="text-[10px] uppercase tracking-wide font-semibold text-neutral-600 dark:text-neutral-400">Context</div>
          {currentProject ? (
            <div className="text-[11px] space-y-2">
              <div><span className="font-medium text-neutral-700 dark:text-neutral-200">Code:</span> {currentProject.projectCode || '—'}</div>
              <div><span className="font-medium text-neutral-700 dark:text-neutral-200">Status:</span> {currentProject.status || '—'}</div>
              <div><span className="font-medium text-neutral-700 dark:text-neutral-200">Folders:</span> {currentProject.folderCounts?.total ?? (Array.isArray(currentProject.folderTree) ? currentProject.folderTree.length : '—')}</div>
              <div className="pt-2 text-[10px] text-neutral-500 dark:text-neutral-400">Select employees on the left then click "Add to Project". (Action wiring TBD)</div>
            </div>
          ) : (
            <div className="text-[11px] text-neutral-500">Select a project to view details.</div>
          )}
          <div className="pt-3">
            <div className="text-[10px] uppercase tracking-wide font-semibold text-neutral-600 dark:text-neutral-400">Audit</div>
            {auditLog.length === 0 ? (
              <div className="text-[11px] text-neutral-500">No actions yet.</div>
            ) : (
              <ul className="text-[11px] space-y-1 max-h-[30vh] overflow-auto pr-1">
                {auditLog.slice(-20).reverse().map((e, idx) => (
                  <li key={idx} className="flex items-center justify-between gap-2 border-b border-neutral-200/50 dark:border-neutral-800/50 pb-0.5">
                    <span className="truncate">{e.action} {e.userId ? `• ${e.userId}` : ''} {e.feature ? `• ${e.feature}:${String(e.value)}` : ''} {e.count ? `• count:${e.count}` : ''}</span>
                    <span className="text-[10px] text-neutral-400">{new Date(e.ts).toLocaleTimeString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
