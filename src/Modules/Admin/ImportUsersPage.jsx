import React from 'react'

export default function ImportUsersPage() {
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-lg font-semibold mb-4 bg-gradient-to-r from-orange-400 via-rose-400 to-fuchsia-400 bg-clip-text text-transparent">Import Users</h1>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
        <p className="text-xs text-neutral-400">Upload a CSV or Excel file. This is a development placeholder.</p>
        <input type="file" className="text-xs" />
        <button className="px-4 py-2 rounded-lg text-xs font-medium bg-gradient-to-r from-orange-500 via-rose-500 to-fuchsia-600 text-white">Upload</button>
      </div>
    </div>
  )
}
