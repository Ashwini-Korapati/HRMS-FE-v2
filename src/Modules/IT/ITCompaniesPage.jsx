import React from 'react'

export default function ITCompaniesPage() {
  const data = []
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Companies</h1>
        <button className="px-3 py-1.5 text-xs rounded-md border border-orange-500/40 text-orange-600 hover:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/60 transition-colors">Sync</button>
      </header>
      <div className="rounded-xl border border-orange-500/30 dark:border-orange-500/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-orange-500/10 text-orange-700 dark:text-orange-300">
            <tr>
              <th className="text-left px-3 py-2 font-medium">Name</th>
              <th className="text-left px-3 py-2 font-medium">ID</th>
              <th className="text-left px-3 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-orange-500/10 dark:divide-orange-500/20">
            {data.length === 0 && (
              <tr>
                <td colSpan={3} className="px-3 py-6 text-center text-neutral-500 text-xs">No companies yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
