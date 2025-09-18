import React from 'react'
import { CreditCard, Receipt, Package } from 'lucide-react'

const box = "rounded-2xl border border-orange-500/30 bg-neutral-50/40 dark:bg-neutral-900/40 backdrop-blur p-4 flex flex-col gap-2"

export default function PlatformSubscriptionsPage() {
  const subs = [
    { company: 'Acme Corp', plan: 'Growth', renews: '2025-12-01', amount: '$399' },
    { company: 'Orbit Labs', plan: 'Starter', renews: '2025-10-14', amount: '$99' },
    { company: 'NovaSoft', plan: 'Enterprise', renews: '2026-01-05', amount: '$899' }
  ]
  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">Subscriptions</h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Plans, renewals & billing status.</p>
        </div>
        <button className="inline-flex items-center gap-2 text-xs px-3 py-2 rounded-xl border border-orange-500/50 text-orange-600 dark:text-orange-400 hover:bg-orange-500/10"><Package size={14}/> New Plan</button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {subs.map(s => <div key={s.company} className={box + ' hover:border-orange-500/60 transition-colors'}>
          <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400"><CreditCard size={16}/><h2 className="text-sm font-semibold">{s.company}</h2></div>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400">Plan: {s.plan}</div>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400">Renews: {s.renews}</div>
          <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 mt-2">{s.amount}<span className="text-xs text-neutral-500 font-normal">/mo</span></div>
          <button className="mt-auto self-start text-[11px] px-3 py-1.5 rounded-lg border border-orange-500/50 text-orange-600 dark:text-orange-400 hover:bg-orange-500/10">Manage</button>
        </div>)}
      </div>
      <div className={box + ' min-h-[160px]'}>
        <h2 className="text-sm font-semibold flex items-center gap-2 text-orange-600 dark:text-orange-400"><Receipt size={16}/> Recent Invoices</h2>
        <div className="flex-1 text-xs text-neutral-500 dark:text-neutral-400">Billing integration placeholder.</div>
      </div>
    </div>
  )
}
