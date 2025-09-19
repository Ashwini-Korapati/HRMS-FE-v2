import React, { useState, useMemo } from 'react'
import { X, Building2, Mail, Phone, MapPin, Link as LinkIcon, CreditCard, User, Lock, ChevronDown, CheckCircle2 } from 'lucide-react'
import { httpPostService } from '../../config/httphandler'
import { useNavigate } from 'react-router-dom'

// Default payload (mirrors provided example) – values are editable and no validation enforced
const makeDefaultData = (planId) => ({
  company: {
    name: 'Innovex Inc',
    email: 'krishnacancan143@gmail.com',
    phone: '9966714320',
    address: '100 Main St, City, Country',
    website: 'https://innovexinc.example',
    taxId: 'TAX-123789',
    timezone: 'UTC',
    workingDays: [1,2,3,4,5],
    workingHours: { start: '09:00', end: '18:00' }
  },
  admin: {
    firstName: 'harish',
    lastName: 'M',
    email: 'krishnacancan143@gmail.com',
    phone: '9966714320',
    password: 'Str0ngP@ssw0rd!',
    dateOfBirth: '1990-01-01',
    gender: 'MALE'
  },
  planId: planId || '5e98cfa0-bac0-48f0-93e7-01080a0cd06f', // override by incoming selected plan
  trialDays: 0,
  metadata: {
    paymentTransactionId: 'txn_123456789',
    paymentStatus: 'PAID',
    gateway: 'MANUAL'
  }
})

const WEEKDAYS = [
  { val: 0, label: 'Sun' },
  { val: 1, label: 'Mon' },
  { val: 2, label: 'Tue' },
  { val: 3, label: 'Wed' },
  { val: 4, label: 'Thu' },
  { val: 5, label: 'Fri' },
  { val: 6, label: 'Sat' }
]

const TIMEZONES = ['UTC','America/New_York','Europe/Berlin','Asia/Kolkata','Asia/Singapore']

function timeOptions() {
  const arr = []
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hh = String(h).padStart(2,'0')
      const mm = String(m).padStart(2,'0')
      arr.push(`${hh}:${mm}`)
    }
  }
  return arr
}

const years = (() => { const now = new Date().getFullYear(); const a=[]; for(let y=now-16; y>=1950; y--) a.push(y); return a })()
const months = [
  { val: 1, label: 'Jan' },{ val: 2, label: 'Feb' },{ val: 3, label: 'Mar' },{ val: 4, label: 'Apr' },{ val: 5, label: 'May' },{ val: 6, label: 'Jun' },{ val: 7, label: 'Jul' },{ val: 8, label: 'Aug' },{ val: 9, label: 'Sep' },{ val: 10, label: 'Oct' },{ val: 11, label: 'Nov' },{ val: 12, label: 'Dec' }
]
function daysInMonth(y,m){ return new Date(y,m,0).getDate() }

const glass = 'bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl'

function Label({children}) { return <span className="text-[11px] uppercase tracking-wide text-neutral-400">{children}</span> }

function Input({ label, icon:Icon, className='', ...props }) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <Label>{label}</Label>
      <div className="relative">
        {Icon && <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />}
        <input {...props} className={`w-full rounded-xl bg-white/5 border border-white/20 px-3 py-2 outline-none text-neutral-100 placeholder-neutral-500 focus:ring-2 focus:ring-fuchsia-500/40 ${Icon ? 'pl-9' : ''} ${className}`} />
      </div>
    </label>
  )
}

function Select({ label, children, className='', multiple, ...props }) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <Label>{label}</Label>
      <div className="relative">
        <select {...props} multiple={multiple} className={`w-full rounded-xl bg-white/5 border border-white/20 px-3 py-2 outline-none text-neutral-100 focus:ring-2 focus:ring-fuchsia-500/40 appearance-none ${multiple ? '' : 'pr-9'} ${className}`}>
          {children}
        </select>
        {!multiple && <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />}
      </div>
    </label>
  )
}

export default function MultiStepSubscriptionForm({ plan, onClose }) {
  const navigate = useNavigate()
  const [payload, setPayload] = useState(makeDefaultData(plan?.id))
  const [step, setStep] = useState('company') // company | admin | review
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const update = (path, value) => {
    setPayload(prev => {
      const next = { ...prev }
      const segs = Array.isArray(path) ? path : [path]
      let cur = next
      for (let i=0;i<segs.length-1;i++) { const k=segs[i]; cur[k] = { ...(cur[k]||{}) }; cur = cur[k] }
      cur[segs[segs.length-1]] = value
      return next
    })
  }

  // ensure planId reflects selection if user changed plan prop during open
  React.useEffect(()=>{ if (plan?.id) setPayload(p => ({...p, planId: plan.id})) }, [plan])

  const dob = useMemo(()=>{ const v = payload.admin.dateOfBirth; const [y,m,d]=v.split('-').map(n=>parseInt(n,10)); return { y,m,d } }, [payload.admin.dateOfBirth])
  const dayCount = useMemo(()=> (dob.y && dob.m) ? daysInMonth(dob.y, dob.m) : 31, [dob])
  const times = useMemo(()=> timeOptions(), [])

  const submit = () => {
    setSubmitting(true)
    setError(null)
    httpPostService('subscriptions', payload).then(res => {
      if (res.status === 201 || res.status === 200) {
        setSuccess(true)
        setTimeout(()=> navigate('/login'), 1200)
      } else {
        setError(res.data?.message || 'Failed')
      }
    }).catch(e => setError(e.message)).finally(()=> setSubmitting(false))
  }

  const SectionTabs = () => (
    <div className="flex items-center gap-2 mb-6">
      {[
        {k:'company', l:'Company', icon:Building2},
        {k:'admin', l:'Admin', icon:User},
        {k:'review', l:'Review', icon:CheckCircle2},
      ].map(s => {
        const ActiveIcon = s.icon
        const active = s.k === step
        return (
          <button key={s.k} onClick={()=> setStep(s.k)} className={`flex-1 min-w-0 flex items-center gap-2 px-3 py-2 rounded-xl border text-[11px] transition-colors ${active ? 'border-orange-500/70 bg-orange-500/10 text-orange-300' : 'border-white/15 hover:border-orange-400/60 text-neutral-400'}`}>
            <span className={`w-7 h-7 grid place-items-center rounded-lg border ${active ? 'border-orange-500/70 bg-orange-500/10 text-orange-300' : 'border-white/15 bg-white/5'}`}><ActiveIcon size={14} /></span>
            <span className="truncate">{s.l}</span>
          </button>
        )
      })}
    </div>
  )

  const Company = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
      <Input label="Company Name" icon={Building2} value={payload.company.name} onChange={e=> update(['company','name'], e.target.value)} />
      <Input label="Company Email" icon={Mail} value={payload.company.email} onChange={e=> update(['company','email'], e.target.value)} />
      <Input label="Phone" icon={Phone} value={payload.company.phone} onChange={e=> update(['company','phone'], e.target.value)} />
      <Input label="Address" icon={MapPin} value={payload.company.address} onChange={e=> update(['company','address'], e.target.value)} />
      <Input label="Website" icon={LinkIcon} value={payload.company.website} onChange={e=> update(['company','website'], e.target.value)} />
      <Input label="Tax ID" icon={CreditCard} value={payload.company.taxId} onChange={e=> update(['company','taxId'], e.target.value)} />
      <Select label="Timezone" onChange={e=> update(['company','timezone'], e.target.value)}>
        {TIMEZONES.map(tz => <option key={tz} value={tz} selected={payload.company.timezone === tz}>{tz}</option>)}
      </Select>
      <Select label="Working Days" multiple onChange={e=> update(['company','workingDays'], Array.from(e.target.selectedOptions).map(o=> parseInt(o.value,10)))}>
        {WEEKDAYS.map(d => <option key={d.val} value={d.val} selected={payload.company.workingDays.includes(d.val)}>{d.label}</option>)}
      </Select>
      <Select label="Start Time" onChange={e=> update(['company','workingHours','start'], e.target.value)}>
        {times.map(t => <option key={t} value={t} selected={payload.company.workingHours.start === t}>{t}</option>)}
      </Select>
      <Select label="End Time" onChange={e=> update(['company','workingHours','end'], e.target.value)}>
        {times.map(t => <option key={t} value={t} selected={payload.company.workingHours.end === t}>{t}</option>)}
      </Select>
    </div>
  )

  const Admin = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
      <Input label="First Name" icon={User} value={payload.admin.firstName} onChange={e=> update(['admin','firstName'], e.target.value)} />
      <Input label="Last Name" icon={User} value={payload.admin.lastName} onChange={e=> update(['admin','lastName'], e.target.value)} />
      <Input label="Email" icon={Mail} value={payload.admin.email} onChange={e=> update(['admin','email'], e.target.value)} />
      <Input label="Phone" icon={Phone} value={payload.admin.phone} onChange={e=> update(['admin','phone'], e.target.value)} />
      <Input label="Password" type="password" icon={Lock} value={payload.admin.password} onChange={e=> update(['admin','password'], e.target.value)} />
      <div className="grid grid-cols-3 gap-3 md:col-span-2">
        <Select label="Year" onChange={e=> update(['admin','dateOfBirth'], `${e.target.value}-${String(dob.m).padStart(2,'0')}-${String(Math.min(dob.d || 1, daysInMonth(parseInt(e.target.value,10), dob.m))).padStart(2,'0')}`)}>
          {years.map(y => <option key={y} value={y} selected={dob.y===y}>{y}</option>)}
        </Select>
        <Select label="Month" onChange={e=> update(['admin','dateOfBirth'], `${dob.y}-${String(e.target.value).padStart(2,'0')}-${String(Math.min(dob.d || 1, daysInMonth(dob.y, parseInt(e.target.value,10)))).padStart(2,'0')}`)}>
          {months.map(m => <option key={m.val} value={m.val} selected={dob.m===m.val}>{m.label}</option>)}
        </Select>
        <Select label="Day" onChange={e=> update(['admin','dateOfBirth'], `${dob.y}-${String(dob.m).padStart(2,'0')}-${String(e.target.value).padStart(2,'0')}`)}>
          {Array.from({ length: dayCount }, (_,i)=> i+1).map(d => <option key={d} value={d} selected={dob.d===d}>{d}</option>)}
        </Select>
      </div>
      <Select label="Gender" onChange={e=> update(['admin','gender'], e.target.value)}>
        <option value="FEMALE" selected={payload.admin.gender==='FEMALE'}>Female</option>
        <option value="MALE" selected={payload.admin.gender==='MALE'}>Male</option>
        <option value="OTHER" selected={payload.admin.gender==='OTHER'}>Other</option>
      </Select>
    </div>
  )

  const Review = () => (
    <div className="space-y-3 animate-fade-in text-xs">
      <div className="text-neutral-300">Final JSON payload (read-only preview):</div>
      <pre className="bg-neutral-900/70 border border-white/10 rounded-xl p-3 max-h-64 overflow-auto text-[11px] text-neutral-300">{JSON.stringify(payload,null,2)}</pre>
      <div className="text-[11px] text-neutral-400">Selected Plan: <span className="text-orange-300 font-medium">{plan?.name || plan?.id}</span> (ID: {payload.planId})</div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-[999] flex items-start md:items-center justify-center px-4 py-10 md:py-20 overflow-y-auto">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-4xl ${glass} p-6 md:p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.8)] animate-scale-in`}> 
        <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center text-neutral-300"><X size={16} /></button>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight bg-gradient-to-r from-orange-400 via-rose-400 to-fuchsia-400 bg-clip-text text-transparent">Create Subscription</h2>
          <p className="text-[12px] text-neutral-400 mt-1">Multi-step developer form (no validation) – will POST then redirect to login on success.</p>
        </div>
        <SectionTabs />
        {step === 'company' && <Company />}
        {step === 'admin' && <Admin />}
        {step === 'review' && <Review />}
        {error && <div className="mt-4 text-[11px] text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">{error}</div>}
        {success && <div className="mt-4 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2">Subscription created. Redirecting...</div>}
        <div className="mt-6 flex items-center justify-between gap-3">
          <div className="flex gap-2">
            {step !== 'company' && (
              <button onClick={()=> setStep(step === 'admin' ? 'company' : 'admin')} className="px-4 py-2 rounded-xl text-[12px] font-medium bg-white/5 border border-white/20 hover:bg-white/10 text-neutral-200">Back</button>
            )}
          </div>
          <div className="flex gap-2">
            {step !== 'review' && (
              <button onClick={()=> setStep(step === 'company' ? 'admin' : 'review')} className="px-5 py-2 rounded-xl text-[12px] font-medium bg-gradient-to-r from-orange-500 via-rose-500 to-fuchsia-600 hover:from-orange-400 hover:via-rose-400 hover:to-fuchsia-500 text-white shadow active:scale-[0.97]">
                Next
              </button>
            )}
            {step === 'review' && (
              <button disabled={submitting || success} onClick={submit} className="px-5 py-2 rounded-xl text-[12px] font-medium bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow active:scale-[0.97] disabled:opacity-60">
                {submitting ? 'Submitting...' : 'Create Subscription'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
