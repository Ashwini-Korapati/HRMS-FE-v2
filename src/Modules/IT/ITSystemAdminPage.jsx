import React from 'react'

export default function ITSystemAdminPage() {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">System Admin</h1>
        <button className="px-3 py-1.5 text-xs rounded-md border border-orange-500/40 text-orange-600 hover:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/60 transition-colors">Refresh</button>
      </header>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {['Auth Service','Queue Workers','Reporting Engine','Notification Hub','Scheduler'].map(s => (
          <div key={s} className="p-4 rounded-lg border border-orange-500/30 dark:border-orange-500/50 bg-white/70 dark:bg-neutral-900/40 flex flex-col gap-2">
            <div className="text-sm font-medium text-neutral-700 dark:text-neutral-200">{s}</div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">Status: <span className="text-emerald-600 dark:text-emerald-400">Online</span></div>
            <button className="self-start mt-1 text-[10px] px-2 py-1 rounded border border-orange-500/40 text-orange-600 dark:text-orange-400 hover:bg-orange-500/10">Details</button>
          </div>
        ))}
      </div>
    </div>
  )
}
