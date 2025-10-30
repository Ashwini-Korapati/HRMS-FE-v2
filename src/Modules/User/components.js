// Shared lightweight UI primitives for User pages (mirrors Admin variants)
import React from 'react'

export function PageHeading({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h1 className="text-xl font-semibold tracking-wide text-orange-700 dark:text-orange-400">{title}</h1>
      {subtitle && <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{subtitle}</p>}
    </div>
  )
}

export function StatGrid({ children }) {
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-8">{children}</div>
}

export function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-xl border border-orange-500/20 dark:border-orange-500/40 bg-white dark:bg-neutral-900 p-4 flex items-center gap-3 shadow-sm transition-colors">
      {Icon && <span className="w-9 h-9 rounded-lg bg-orange-500/15 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 grid place-items-center"><Icon size={18} /></span>}
      <div className="flex flex-col">
        <span className="text-[11px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">{label}</span>
        <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">{value}</span>
      </div>
    </div>
  )
}

export function PlaceholderPanel({ title, children }) {
  return (
    <div className="rounded-xl border border-orange-500/20 dark:border-orange-500/40 bg-white dark:bg-neutral-900 p-6 shadow-sm transition-colors">
      <h2 className="text-sm font-medium text-neutral-900 dark:text-neutral-50 mb-2">{title}</h2>
      <div className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed min-h-[60px]">{children}</div>
    </div>
  )
}

export function TableSkeleton({ columns = [] }) {
  return (
    <div className="rounded-xl border border-orange-500/20 dark:border-orange-500/40 bg-white dark:bg-neutral-900 overflow-hidden transition-colors">
      <div className="grid" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0,1fr))` }}>
        {columns.map(c => <div key={c} className="px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-neutral-700 dark:text-neutral-200 bg-neutral-50 dark:bg-neutral-800">{c}</div>)}
      </div>
      {Array.from({ length: 5 }).map((_, r) => (
        <div key={r} className="grid animate-pulse" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0,1fr))` }}>
          {columns.map(c => <div key={c} className="h-8 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50" />)}
        </div>
      ))}
    </div>
  )
}
