import React from 'react'
import { BarChart3, Server, Users, Building2 } from 'lucide-react'

const cardClass = "rounded-2xl border border-orange-500/30 bg-neutral-50/40 dark:bg-neutral-900/40 backdrop-blur p-4 flex flex-col gap-2 hover:border-orange-500/60 transition-colors shadow-sm"

export default function PlatformOverviewPage() {
  const stats = [
    { icon: Users, label: 'Total Users', value: 1423 },
    { icon: Building2, label: 'Companies', value: 64 },
    { icon: Server, label: 'Active Tenants', value: 61 },
    { icon: BarChart3, label: 'Avg Uptime (30d)', value: '99.96%' }
  ]
  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">Platform Overview</h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">Operational snapshot and system wide metrics.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => <div key={s.label} className={cardClass}>
          <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400"><s.icon size={16} /><span className="text-xs font-medium uppercase tracking-wide">{s.label}</span></div>
          <div className="text-2xl font-semibold text-neutral-900 dark:text-white">{s.value}</div>
        </div>)}
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className={cardClass + ' min-h-[240px]'}>
          <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 mb-2">Recent Activity</h2>
          <ul className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
            <li>Tenant <span className="text-neutral-900 dark:text-neutral-100">Acme Corp</span> upgraded to Growth.</li>
            <li>System Admin added new compliance policy.</li>
            <li>Subscription renewal processed for Orbit Labs.</li>
          </ul>
        </div>
        <div className={cardClass + ' min-h-[240px]'}>
          <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 mb-2">Performance</h2>
          <div className="flex-1 flex items-center justify-center text-neutral-400 text-xs">Graph placeholder</div>
        </div>
      </div>
    </div>
  )
}
