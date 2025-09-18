import React from 'react'

export default function ITOverviewPage() {
  return (
    <div className="grid gap-6">
      <section className="p-5 rounded-xl border border-orange-500/30 dark:border-orange-500/60 bg-white/60 dark:bg-neutral-900/40 backdrop-blur">
        <h1 className="text-lg font-semibold mb-2">IT Platform Overview</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">High level status and key operational metrics.</p>
      </section>
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {['Active Companies','Pending Requests','Open Incidents','Subscriptions'].map(k => (
          <div key={k} className="p-4 rounded-lg border border-orange-500/20 dark:border-orange-500/40 bg-white/70 dark:bg-neutral-900/40">
            <h2 className="text-xs font-medium tracking-wide text-neutral-500 mb-1">{k}</h2>
            <div className="text-2xl font-semibold text-orange-600 dark:text-orange-400">--</div>
          </div>
        ))}
      </div>
    </div>
  )
}
