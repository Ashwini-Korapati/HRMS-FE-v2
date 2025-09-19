import React, { useState, useMemo } from 'react'
import { CalendarDays, Layers, Hash, FileText, Shield, ChevronDown, CheckCircle2 } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { createProject, selectProjectCreating, selectProjectCreateError, resetProjectState } from '../../Redux/Public/projectsSlice'

// Simple field components borrowing styling from SmartEmployeeOnboardingForm
function Input({ label, error, required, className = '', ...props }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-neutral-500 dark:text-neutral-400">{label} {required && <span className="text-rose-400">*</span>}</span>
      <input
        {...props}
        className={`w-full bg-white dark:bg-neutral-800/80 border rounded-xl px-3 py-2 text-neutral-900 dark:text-neutral-200 placeholder-force-white outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 border-neutral-300 dark:border-neutral-700 ${error ? 'border-rose-600 focus:ring-rose-500/30' : ''} ${className}`}
      />
      {error && <span className="text-[11px] text-rose-400">{error}</span>}
    </label>
  )
}

function TextArea({ label, error, required, className = '', ...props }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-neutral-500 dark:text-neutral-400">{label} {required && <span className="text-rose-400">*</span>}</span>
      <textarea
        {...props}
        className={`w-full bg-white dark:bg-neutral-800/80 border rounded-xl px-3 py-2 text-neutral-900 dark:text-neutral-200 placeholder-force-white outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 border-neutral-300 dark:border-neutral-700 resize-none ${error ? 'border-rose-600 focus:ring-rose-500/30' : ''} ${className}`}
      />
      {error && <span className="text-[11px] text-rose-400">{error}</span>}
    </label>
  )
}

function Select({ label, error, required, className = '', children, ...props }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-neutral-500 dark:text-neutral-400">{label} {required && <span className="text-rose-400">*</span>}</span>
      <div className="relative">
        <select
          {...props}
          className={`w-full bg-white dark:bg-neutral-800/80 border rounded-xl px-3 pr-8 py-2 text-neutral-900 dark:text-neutral-200 appearance-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 border-neutral-300 dark:border-neutral-700 ${error ? 'border-rose-600 focus:ring-rose-500/30' : ''} ${className}`}
        >
          {children}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
      </div>
      {error && <span className="text-[11px] text-rose-400">{error}</span>}
    </label>
  )
}

const blank = {
  name: '',
  code: '',
  description: '',
  startDate: '',
  endDate: '',
  visibility: 'PRIVATE', // PRIVATE | INTERNAL | PUBLIC
  status: 'PLANNING' // PLANNING | ACTIVE | ON_HOLD | COMPLETED
}

function validate(f) {
  const e = {}
  if (!f.name) e.name = 'Required'
  if (!f.code) e.code = 'Required'
  if (f.code && !/^[A-Z0-9_-]{2,12}$/.test(f.code)) e.code = '2-12 chars A-Z 0-9 _ -'
  if (!f.startDate) e.startDate = 'Required'
  if (f.endDate && f.startDate && f.endDate < f.startDate) e.endDate = 'Must be after start'
  if (!f.description) e.description = 'Required'
  return e
}

export default function SmartCreateProjectForm({ onCreated, className = '' }) {
  const [form, setForm] = useState(blank)
  const [touched, setTouched] = useState({})
  const creating = useSelector(selectProjectCreating)
  const createError = useSelector(selectProjectCreateError)
  const dispatch = useDispatch()

  const errors = useMemo(() => validate(form), [form])
  const isValid = Object.keys(errors).length === 0

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const mark = k => setTouched(t => ({ ...t, [k]: true }))

  const handleSubmit = (e) => {
    e.preventDefault()
    Object.keys(form).forEach(mark)
    if (!isValid) return
    dispatch(createProject(form))
      .unwrap()
      .then(proj => {
        onCreated?.(proj)
        setForm(blank)
        setTouched({})
        setTimeout(() => dispatch(resetProjectState()), 1500)
      })
      .catch(() => {/* handled in slice */})
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input label="Project Name" value={form.name} onChange={e => update('name', e.target.value)} onBlur={() => mark('name')} error={touched.name && errors.name} required />
        <Input label="Code" value={form.code} onChange={e => update('code', e.target.value.toUpperCase())} onBlur={() => mark('code')} error={touched.code && errors.code} required placeholder="e.g. OPS2025" />
        <Input type="date" label="Start Date" value={form.startDate} onChange={e => update('startDate', e.target.value)} onBlur={() => mark('startDate')} error={touched.startDate && errors.startDate} required />
        <Input type="date" label="End Date" value={form.endDate} onChange={e => update('endDate', e.target.value)} onBlur={() => mark('endDate')} error={touched.endDate && errors.endDate} />
        <Select label="Visibility" value={form.visibility} onChange={e => update('visibility', e.target.value)}>
          <option value="PRIVATE">Private</option>
          <option value="INTERNAL">Internal</option>
          <option value="PUBLIC">Public</option>
        </Select>
        <Select label="Status" value={form.status} onChange={e => update('status', e.target.value)}>
          <option value="PLANNING">Planning</option>
          <option value="ACTIVE">Active</option>
          <option value="ON_HOLD">On Hold</option>
          <option value="COMPLETED">Completed</option>
        </Select>
        <TextArea className="md:col-span-2" rows={4} label="Description" value={form.description} onChange={e => update('description', e.target.value)} onBlur={() => mark('description')} error={touched.description && errors.description} required />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={creating === 'loading' || !isValid}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors shadow-sm ${isValid ? 'border-orange-600 bg-orange-500/90 hover:bg-orange-500 text-white' : 'border-neutral-700 bg-neutral-800 text-neutral-400 cursor-not-allowed'} ${creating === 'loading' ? 'opacity-70' : ''}`}
        >
          {creating === 'loading' ? 'Creating…' : 'Create Project'}
        </button>
        {creating === 'succeeded' && (
          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
            <CheckCircle2 size={14} /> Created
          </span>
        )}
        {creating === 'failed' && (
          <span className="text-rose-500 text-xs">{createError || 'Error'}</span>
        )}
      </div>
    </form>
  )
}
