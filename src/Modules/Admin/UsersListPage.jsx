import React from 'react'

export default function UsersListPage() {
  return (
    <div className="p-4 md:p-6 space-y-4">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-lg font-semibold bg-gradient-to-r from-orange-400 via-rose-400 to-fuchsia-400 bg-clip-text text-transparent">Users List</h1>
        <div className="flex gap-2 flex-wrap">
          <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 border border-white/20 text-neutral-200 hover:bg-white/15">Refresh</button>
        </div>
      </header>
      <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="px-4 py-2 text-[11px] uppercase tracking-wide text-neutral-400 border-b border-white/10">Sample Data</div>
        <div className="divide-y divide-white/5 text-xs">
          {Array.from({ length: 5 }).map((_,i)=>(
            <div key={i} className="px-4 py-2 flex items-center justify-between hover:bg-white/5">
              <span>User {i+1}</span>
              <span className="text-neutral-500">user{i+1}@company.com</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
