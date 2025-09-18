import React from 'react'
import { Building2, Search, Plus } from 'lucide-react'

const shell = "rounded-2xl border border-orange-500/30 bg-neutral-50/40 dark:bg-neutral-900/40 backdrop-blur"

export default function PlatformCompaniesPage() {
  const companies = [
    { name: 'Acme Corp', employees: 240, status: 'ACTIVE' },
    { name: 'Orbit Labs', employees: 52, status: 'TRIAL' },
    { name: 'NovaSoft', employees: 310, status: 'ACTIVE' },
  ]
  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">Companies</h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Manage tenant workspaces.</p>
        </div>
        <button className="inline-flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-xl border border-orange-500/50 text-orange-600 dark:text-orange-400 hover:bg-orange-500/10"> <Plus size={14}/> New Company</button>
      </div>
      <div className={shell + ' p-3 flex items-center gap-2'}>
        <Search size={14} className="text-orange-500/70"/>
        <input className="bg-transparent flex-1 outline-none text-sm" placeholder="Search companies"/>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {companies.map(c => <div key={c.name} className={shell + ' p-4 flex flex-col gap-1 hover:border-orange-500/60 transition-colors'}>
          <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400"><Building2 size={16}/><h2 className="text-sm font-semibold">{c.name}</h2></div>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400">Employees: {c.employees}</div>
          <div className="mt-auto text-[10px] px-2 py-1 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 w-fit tracking-wide">{c.status}</div>
        </div>)}
      </div>
    </div>
  )
}
