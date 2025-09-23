import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDesignations, selectDesignations, selectDesignationsListLoading, selectDesignationsListError } from '../../Redux/Public/designationSlice'

export default function DesignationsListPage() {
  const dispatch = useDispatch()
  const designations = useSelector(selectDesignations)
  const loading = useSelector(selectDesignationsListLoading)
  const error = useSelector(selectDesignationsListError)

  useEffect(() => {
    dispatch(fetchDesignations())
  }, [dispatch])

  if (loading === 'loading') {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <h1 className="text-lg font-semibold bg-gradient-to-r from-orange-400 via-rose-400 to-fuchsia-400 bg-clip-text text-transparent">Designations</h1>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-neutral-300">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <h1 className="text-lg font-semibold bg-gradient-to-r from-orange-400 via-rose-400 to-fuchsia-400 bg-clip-text text-transparent">Designations</h1>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-red-400">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-lg font-semibold bg-gradient-to-r from-orange-400 via-rose-400 to-fuchsia-400 bg-clip-text text-transparent">Designations</h1>
      <div className="rounded-xl border border-white/10 bg-gradient-to-b from-white/50 to-white/30 backdrop-blur-sm p-4">
        {designations.length === 0 ? (
          <p className="text-xs text-neutral-300">No designations found.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-black bg-white/20">
                <th className="p-2 font-semibold">Title</th>
                <th className="p-2 font-semibold">Description</th>
                <th className="p-2 font-semibold">Level</th>
                <th className="p-2 font-semibold">Status</th>
                <th className="p-2 font-semibold">Created At</th>
              </tr>
            </thead>
            <tbody>
              {designations.map(designation => (
                <tr 
                  key={designation.id} 
                  className="text-sm text-black border-t border-white/20 transition-colors duration-200 hover:bg-white/30"
                >
                  <td className="p-2">{designation.title}</td>
                  <td className="p-2">{designation.description || '-'}</td>
                  <td className="p-2">{designation.level || '-'}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded-full text-xs transition-all duration-200 hover:scale-105 
                      ${designation.isActive 
                        ? 'bg-green-500/20 text-green-700 hover:bg-green-500/30' 
                        : 'bg-red-500/20 text-red-700 hover:bg-red-500/30'
                      }`}
                    >
                      {designation.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-2">{new Date(designation.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
