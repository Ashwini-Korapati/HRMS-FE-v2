// Central small card components / utilities for Admin pages
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
    <div className="rounded-xl border border-orange-500/20 dark:border-orange-500/40 bg-white dark:bg-neutral-900 overflow-hidden">
      <table className="w-full text-xs">
        <thead className="bg-neutral-50 dark:bg-neutral-800 border-b border-orange-500/20 dark:border-orange-500/40">
          <tr>
            {columns.map(c => <th key={c} className="text-left px-4 py-2 font-medium text-neutral-700 dark:text-neutral-200">{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {[1,2,3].map(i => <tr key={i} className="border-b border-neutral-200 dark:border-neutral-700"><td colSpan={columns.length} className="px-4 py-3 text-neutral-400 dark:text-neutral-500">Loading...</td></tr>)}
        </tbody>
      </table>
    </div>
  )
}
