import React from 'react'

export default function ITSubscriptionsPage() {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Subscriptions</h1>
        <button className="px-3 py-1.5 text-xs rounded-md border border-orange-500/40 text-orange-600 hover:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/60 transition-colors">Export</button>
      </header>
      <div className="rounded-xl border border-orange-500/30 dark:border-orange-500/50 p-4 bg-white/70 dark:bg-neutral-900/40">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">Manage platform level subscriptions, licensing and renewals.</p>
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {['Basic','Growth','Enterprise'].map(t => (
            <div key={t} className="p-4 rounded-lg border border-orange-500/20 dark:border-orange-500/40 bg-gradient-to-br from-white/60 to-white/30 dark:from-neutral-900/60 dark:to-neutral-900/30">
              <div className="text-sm font-semibold text-orange-600 dark:text-orange-400">{t}</div>
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">-- active tenants</div>
              <button className="mt-3 text-[10px] px-2 py-1 rounded border border-orange-500/40 text-orange-600 dark:text-orange-400 hover:bg-orange-500/10">Inspect</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
