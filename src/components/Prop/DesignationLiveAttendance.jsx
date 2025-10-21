import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { connectDesignationSocket, disconnectDesignationSocket } from '../../Redux/Public/notificationsSocket'
import { toAssetUrl } from '../../config/config'
import {
  fetchDesignationSnapshot,
  setConnected,
  upsertItems,
  selectDesignationRows,
  selectDesignationConnected,
  selectDesignationLoading,
  selectDesignationError,
} from '../../Redux/Public/designationMonitoringSlice'

function fmt(ts) {
  if (!ts) return '—'
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function fmtDate(ts) {
  if (!ts) return '—'
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString()
}

function fmtHours(h) {
  if (h == null) return '—'
  const n = Number(h)
  if (Number.isNaN(n)) return '—'
  return n.toFixed(2)
}

export default function DesignationLiveAttendance({
  designationId,
  companyId,
  title = 'Live Attendance',
  gatewayUrl = 'http://localhost:7001'
}) {
  const dispatch = useDispatch()
  const token = useSelector(s => s.auth?.accessToken)
  const rows = useSelector(state => selectDesignationRows(state, designationId))
  const connected = useSelector(state => selectDesignationConnected(state, designationId))
  const loading = useSelector(state => selectDesignationLoading(state, designationId))
  const error = useSelector(state => selectDesignationError(state, designationId))

  // Load initial snapshot
  useEffect(() => {
    if (!designationId || !companyId) return
    dispatch(fetchDesignationSnapshot({ companyId, designationId }))
  }, [dispatch, companyId, designationId])

  // Live socket wiring
  useEffect(() => {
    if (!designationId) return
    const socket = connectDesignationSocket({ url: gatewayUrl, token, designationId })

    const onConnect = () => {
      dispatch(setConnected({ designationId, connected: true }))
      // Re-sync on reconnect to heal missed messages
      dispatch(fetchDesignationSnapshot({ companyId, designationId }))
    }
    const onDisconnect = () => dispatch(setConnected({ designationId, connected: false }))
    const onNotification = (evt) => {
      // items: [{ userId, name, avatar, designationId, status, checkInTime, checkOutTime, location, totalHours, overtimeHours }]
      if (evt?.type === 'attendance.monitoring.update' && Array.isArray(evt.items)) {
        dispatch(upsertItems({ designationId, items: evt.items }))
      }
      if (evt?.type === 'attendance.monitoring.snapshot') {
        // Snapshot may include designationId and full items array; prefer socket payload when present
        const payload = evt?.data || evt || {}
        const targetDesignationId = payload.designationId || payload.rootDesignationId || designationId
        const items = Array.isArray(payload.items) ? payload.items : null
        if (targetDesignationId && Array.isArray(items)) {
          dispatch(upsertItems({ designationId: targetDesignationId, items, tree: payload.tree, suggestedLayout: payload.suggestedLayout, timestamp: payload.timestamp }))
        }
      }
    }
    const onError = () => {/* no-op */ }

    socket.off('connect', onConnect).on('connect', onConnect)
    socket.off('disconnect', onDisconnect).on('disconnect', onDisconnect)
    socket.off('notification', onNotification).on('notification', onNotification)
    socket.off('connect_error', onError).on('connect_error', onError)
    socket.off('error', onError).on('error', onError)

    return () => {
      try {
        socket.off('notification', onNotification)
        socket.off('connect', onConnect)
        socket.off('disconnect', onDisconnect)
        socket.off('connect_error', onError)
        socket.off('error', onError)
      } catch {}
      disconnectDesignationSocket(designationId)
    }
  }, [dispatch, designationId, companyId, token, gatewayUrl])

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-auto">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <span className={`text-xs px-2 py-0.5 rounded-full ${connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {connected ? 'LIVE' : 'OFFLINE'}
        </span>
        {loading === 'loading' && <span className="text-xs text-gray-500">Loading…</span>}
        {error && <span className="text-xs text-rose-600">{error}</span>}
      </div>
      <table className="min-w-full text-sm text-black">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-3 py-2 text-left">User</th>
            <th className="px-3 py-2 text-left">Status</th>
            <th className="px-3 py-2 text-left">Date</th>
            <th className="px-3 py-2 text-left">Check-in</th>
            <th className="px-3 py-2 text-left">Check-out</th>
            <th className="px-3 py-2 text-left">Location</th>
            <th className="px-3 py-2 text-left">Total</th>
            <th className="px-3 py-2 text-left">Overtime</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-3 py-6 text-center text-gray-500">No records yet.</td>
            </tr>
          ) : rows.map(r => {
            const avatarUrl = toAssetUrl(r.avatar)
            return (
              <tr key={r.userId} className="border-t border-gray-100">
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={r.name || 'avatar'} className="w-8 h-8 rounded-full object-cover ring-2 ring-orange-300"/>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 grid place-items-center text-gray-700 text-xs ring-2 ring-gray-300">
                        {r?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-gray-900">{r.name || '—'}</div>
                      <div className="text-[11px] text-gray-600">{r.designationId ? `Desig: ${r.designationId}` : '—'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2 text-gray-900">{r.status || '—'}</td>
                <td className="px-3 py-2 text-gray-900">{fmtDate(r.date || r.checkInTime || r.checkOutTime)}</td>
                <td className="px-3 py-2 text-gray-900">{fmt(r.checkInTime)}</td>
                <td className="px-3 py-2 text-gray-900">{fmt(r.checkOutTime)}</td>
                <td className="px-3 py-2 text-gray-900">{r.location || '—'}</td>
                <td className="px-3 py-2 text-gray-900">{fmtHours(r.totalHours)}</td>
                <td className="px-3 py-2 text-gray-900">{fmtHours(r.overtimeHours)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}


// import React, { useEffect } from 'react'
// import { useDispatch, useSelector } from 'react-redux'
// import { connectDesignationSocket, disconnectDesignationSocket } from '../../Redux/Public/notificationsSocket'
// import { toAssetUrl } from '../../config/config'
// import {
//   fetchDesignationSnapshot,
//   setConnected,
//   upsertItems,
//   selectDesignationRows,
//   selectDesignationConnected,
//   selectDesignationLoading,
//   selectDesignationError,
// } from '../../Redux/Public/designationMonitoringSlice'

// function fmt(ts) {
//   if (!ts) return '—'
//   const d = new Date(ts)
//   if (Number.isNaN(d.getTime())) return '—'
//   return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
// }

// function fmtDate(ts) {
//   if (!ts) return '—'
//   const d = new Date(ts)
//   if (Number.isNaN(d.getTime())) return '—'
//   return d.toLocaleDateString()
// }

// function fmtHours(h) {
//   if (h == null) return '—'
//   const n = Number(h)
//   if (Number.isNaN(n)) return '—'
//   return n.toFixed(2)
// }

// export default function DesignationLiveAttendance({ designationId, companyId, title = 'Live Attendance', gatewayUrl = 'http://localhost:7001' }) {
//   const dispatch = useDispatch()
//   const token = useSelector(s => s.auth?.accessToken)
//   const rows = useSelector(state => selectDesignationRows(state, designationId))
//   const connected = useSelector(state => selectDesignationConnected(state, designationId))
//   const loading = useSelector(state => selectDesignationLoading(state, designationId))
//   const error = useSelector(state => selectDesignationError(state, designationId))

//   // serverOrigin is used via toAssetUrl; no need to keep a local memo here.

//   useEffect(() => {
//     if (!designationId || !companyId) return
//     dispatch(fetchDesignationSnapshot({ companyId, designationId }))
//   }, [dispatch, companyId, designationId])

//   useEffect(() => {
//     if (!designationId) return
//     const socket = connectDesignationSocket({ url: gatewayUrl, token, designationId })
//     socket.on('connect', () => dispatch(setConnected({ designationId, connected: true })))
//     socket.on('disconnect', () => dispatch(setConnected({ designationId, connected: false })))
//     socket.on('notification', (evt) => {
//       if (evt?.type === 'attendance.monitoring.update' && Array.isArray(evt.items)) {
//         dispatch(upsertItems({ designationId, items: evt.items }))
//       }
//     })
//     return () => {
//       try { socket.off('notification') } catch {}
//       disconnectDesignationSocket(designationId)
//     }
//   }, [dispatch, designationId, token, gatewayUrl])

//   return (
//   <div className="rounded-xl border border-gray-200 bg-white overflow-auto">
//       <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200">
//         <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
//         <span className={`text-xs px-2 py-0.5 rounded-full ${connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{connected ? 'LIVE' : 'OFFLINE'}</span>
//         {loading === 'loading' && <span className="text-xs text-gray-500">Loading…</span>}
//         {error && <span className="text-xs text-rose-600">{error}</span>}
//       </div>
//       <table className="min-w-full text-sm text-black">
//         <thead className="bg-gray-50 text-gray-600">
//           <tr>
//             <th className="px-3 py-2 text-left">User</th>
//             <th className="px-3 py-2 text-left">Status</th>
//             <th className="px-3 py-2 text-left">Date</th>
//             <th className="px-3 py-2 text-left">Check-in</th>
//             <th className="px-3 py-2 text-left">Check-out</th>
//             <th className="px-3 py-2 text-left">Location</th>
//             <th className="px-3 py-2 text-left">Total</th>
//             <th className="px-3 py-2 text-left">Overtime</th>
//           </tr>
//         </thead>
//         <tbody>
//           {rows.length === 0 ? (
//             <tr>
//               <td colSpan={8} className="px-3 py-6 text-center text-gray-500">No records yet.</td>
//             </tr>
//           ) : rows.map(r => {
//             const avatarUrl = toAssetUrl(r.avatar)
//             return (
//               <tr key={r.userId} className="border-t border-gray-100">
//                 <td className="px-3 py-2">
//                   <div className="flex items-center gap-2">
//                     {avatarUrl ? (
//                       <img src={avatarUrl} alt={r.name || 'avatar'} className="w-8 h-8 rounded-full object-cover ring-2 ring-orange-300"/>
//                     ) : (
//                       <div className="w-8 h-8 rounded-full bg-gray-200 grid place-items-center text-gray-700 text-xs ring-2 ring-gray-300">
//                         {r?.name?.[0]?.toUpperCase() || 'U'}
//                       </div>
//                     )}
//                     <div>
//                       <div className="font-medium text-gray-900">{r.name || '—'}</div>
//                       <div className="text-[11px] text-gray-600">{r.designationId ? `Desig: ${r.designationId}` : '—'}</div>
//                     </div>
//                   </div>
//                 </td>
//                 <td className="px-3 py-2 text-gray-900">{r.status || '—'}</td>
//                 <td className="px-3 py-2 text-gray-900">{fmtDate(r.date || r.checkInTime || r.checkOutTime)}</td>
//                 <td className="px-3 py-2 text-gray-900">{fmt(r.checkInTime)}</td>
//                 <td className="px-3 py-2 text-gray-900">{fmt(r.checkOutTime)}</td>
//                 <td className="px-3 py-2 text-gray-900">{r.location || '—'}</td>
//                 <td className="px-3 py-2 text-gray-900">{fmtHours(r.totalHours)}</td>
//                 <td className="px-3 py-2 text-gray-900">{fmtHours(r.overtimeHours)}</td>
//               </tr>
//             )
//           })}
//         </tbody>
//       </table>
//     </div>
//   )
// }
