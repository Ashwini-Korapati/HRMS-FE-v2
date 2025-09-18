import React from 'react'
import { ShieldCheck, UserPlus, Wrench } from 'lucide-react'

const panel = "rounded-2xl border border-orange-500/30 bg-neutral-50/40 dark:bg-neutral-900/40 backdrop-blur p-4 flex flex-col gap-2"

export default function PlatformSystemAdminPage() {
  const admins = [
    { name: 'Root Admin', email: 'root@hroffice.com', role: 'SUPER_ADMIN' },
    { name: 'Tech Ops', email: 'itops@hroffice.com', role: 'IT' }
  ]
  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">System Admin</h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Manage platform administrators & policies.</p>
        </div>
        <button className="inline-flex items-center gap-2 text-xs px-3 py-2 rounded-xl border border-orange-500/50 text-orange-600 dark:text-orange-400 hover:bg-orange-500/10"><UserPlus size={14}/> Invite</button>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className={panel}>
          <h2 className="text-sm font-semibold flex items-center gap-2 text-orange-600 dark:text-orange-400"><ShieldCheck size={16}/> Administrators</h2>
          <ul className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
            {admins.map(a => <li key={a.email} className="flex items-center justify-between">
              <span>{a.name} <span className="text-neutral-400">({a.role})</span></span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400">{a.email}</span>
            </li>)}
          </ul>
        </div>
        <div className={panel}>
          <h2 className="text-sm font-semibold flex items-center gap-2 text-orange-600 dark:text-orange-400"><Wrench size={16}/> Maintenance</h2>
          <div className="flex-1 text-xs text-neutral-500 dark:text-neutral-400">No scheduled maintenance.</div>
          <button className="self-start text-[11px] px-3 py-1.5 rounded-lg border border-orange-500/50 text-orange-600 dark:text-orange-400 hover:bg-orange-500/10">Schedule</button>
        </div>
      </div>
    </div>
  )
}
