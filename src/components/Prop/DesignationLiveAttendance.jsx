import { useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
// Removed direct socket connection; live updates now come via global notifications socket
import { toAssetUrl } from "../../config/config"
import {
  fetchDesignationSnapshot,
  selectDesignationRows,
  selectDesignationConnected,
  selectDesignationLoading,
  selectDesignationError,
} from "../../Redux/Public/designationMonitoringSlice"


function fmt(ts) {
  if (!ts) return "—"
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function fmtDate(ts) {
  if (!ts) return "—"
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString()
}

function fmtHours(h) {
  if (h == null) return "—"
  const n = Number(h)
  if (Number.isNaN(n)) return "—"
  return n.toFixed(2)
}

function StatusBadge({ status }) {
  const statusConfig = {
    present: {
      bg: "bg-emerald-50 dark:bg-emerald-500/20",
      text: "text-emerald-700 dark:text-emerald-200",
      border: "border-emerald-200 dark:border-emerald-400/40"
    },
    absent: {
      bg: "bg-rose-50 dark:bg-rose-500/20",
      text: "text-rose-700 dark:text-rose-200",
      border: "border-rose-200 dark:border-rose-400/40"
    },
    late: {
      bg: "bg-amber-50 dark:bg-amber-500/25",
      text: "text-amber-700 dark:text-amber-200",
      border: "border-amber-200 dark:border-amber-400/40"
    },
    "on-leave": {
      bg: "bg-blue-50 dark:bg-blue-500/20",
      text: "text-blue-700 dark:text-blue-200",
      border: "border-blue-200 dark:border-blue-400/40"
    },
    "checked-in": {
      bg: "bg-cyan-50 dark:bg-cyan-500/20",
      text: "text-cyan-700 dark:text-cyan-200",
      border: "border-cyan-200 dark:border-cyan-400/40"
    },
    "checked-out": {
      bg: "bg-slate-50 dark:bg-slate-500/20",
      text: "text-slate-700 dark:text-slate-200",
      border: "border-slate-200 dark:border-slate-400/40"
    },
  }

  const config = statusConfig[status?.toLowerCase()] || statusConfig["absent"]

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}
    >
      {status || "—"}
    </span>
  )
}

export default function DesignationLiveAttendance({
  designationId,
  companyId,
  title = "Live Attendance",
}) {
  const dispatch = useDispatch()
  // Global notifications socket handles live events; token not used here anymore
  const rows = useSelector((state) => selectDesignationRows(state, designationId))
  const connected = useSelector((state) => selectDesignationConnected(state, designationId))
  const loading = useSelector((state) => selectDesignationLoading(state, designationId))
  const error = useSelector((state) => selectDesignationError(state, designationId))

  const tableBodyRef = useRef(null)
  const lastRowCountRef = useRef(rows?.length || 0)

  // Load initial snapshot
  useEffect(() => {
    if (!designationId || !companyId) return
    console.log('[DesignationLiveAttendance] Fetching initial snapshot', { designationId, companyId })
    dispatch(fetchDesignationSnapshot({ companyId, designationId }))
  }, [dispatch, companyId, designationId])
  
  // Log rows changes for debugging
  useEffect(() => {
    console.log('[DesignationLiveAttendance] Rows updated:', {
      designationId,
      rowsCount: rows?.length || 0,
      connected,
      loading,
      rows: rows?.slice(0, 3) // Log first 3 for debugging
    })
  }, [rows, designationId, connected, loading])

  // Live updates flow via global notifications socket; this component only renders store data.

  useEffect(() => {
    if (rows?.length > lastRowCountRef.current && tableBodyRef.current) {
      lastRowCountRef.current = rows.length
      setTimeout(() => {
        tableBodyRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
      }, 50)
    }
  }, [rows?.length])

  return (
    <div className="attendance-container rounded-lg border border-slate-200 dark:border-orange-500/30 bg-white dark:bg-black shadow-sm dark:shadow-[0_30px_60px_rgba(0,0,0,0.75)] overflow-hidden transition-colors">
      <div className="sticky top-0 z-20 backdrop-blur-md bg-white/80 dark:bg-black/80 border-b border-slate-200 dark:border-orange-500/30 px-4 py-3 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-all duration-300 ${
              connected
                ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-400/40"
                : "bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-200 border border-rose-200 dark:border-rose-400/40"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}
            ></span>
            {connected ? "LIVE" : "OFFLINE"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {loading === "loading" && (
            <span className="text-xs text-slate-500 dark:text-slate-300 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
              Loading…
            </span>
          )}
          {error && <span className="text-xs text-rose-600 dark:text-rose-300 font-medium">{error}</span>}
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-auto max-h-96 attendance-scroll">
        <table className="w-full text-xs text-slate-700 dark:text-slate-200">
          <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-black border-b border-slate-200 dark:border-orange-500/30">
            <tr>
              <th className="px-3 py-2.5 text-left font-semibold text-slate-600 dark:text-slate-200 whitespace-nowrap">User</th>
              <th className="px-3 py-2.5 text-left font-semibold text-slate-600 dark:text-slate-200 whitespace-nowrap">Status</th>
              <th className="px-3 py-2.5 text-left font-semibold text-slate-600 dark:text-slate-200 whitespace-nowrap">Date</th>
              <th className="px-3 py-2.5 text-left font-semibold text-slate-600 dark:text-slate-200 whitespace-nowrap">Check-in</th>
              <th className="px-3 py-2.5 text-left font-semibold text-slate-600 dark:text-slate-200 whitespace-nowrap">Check-out</th>
              <th className="px-3 py-2.5 text-left font-semibold text-slate-600 dark:text-slate-200 whitespace-nowrap">Location</th>
              <th className="px-3 py-2.5 text-left font-semibold text-slate-600 dark:text-slate-200 whitespace-nowrap">Total</th>
              <th className="px-3 py-2.5 text-left font-semibold text-slate-600 dark:text-slate-200 whitespace-nowrap">OT</th>
            </tr>
          </thead>
          <tbody ref={tableBodyRef}>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                  No records yet.
                </td>
              </tr>
            ) : (
              rows.map((r, idx) => {
                const avatarUrl = toAssetUrl(r.avatar)
                return (
                  <tr
                    key={r.userId}
                    className="border-b border-slate-100 dark:border-orange-500/20 hover:bg-slate-50 dark:hover:bg-black/60 transition-colors duration-200 animate-row-enter"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl || "/placeholder.svg"}
                            alt={r.name || "avatar"}
                            className="w-7 h-7 rounded-full object-cover flex-shrink-0 ring-1.5 ring-slate-200 dark:ring-orange-500/30"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-500/30 dark:to-cyan-500/30 grid place-items-center text-slate-600 dark:text-white text-xs font-semibold flex-shrink-0 ring-1.5 ring-slate-200 dark:ring-orange-500/30">
                            {r?.name?.[0]?.toUpperCase() || "U"}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-medium text-slate-900 dark:text-slate-100 truncate text-xs">{r.name || "—"}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {r.designationId ? `${r.designationId}` : "—"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap text-xs">
                      {fmtDate(r.date || r.checkInTime || r.checkOutTime)}
                    </td>
                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap text-xs font-mono">
                      {fmt(r.checkInTime)}
                    </td>
                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap text-xs font-mono">
                      {fmt(r.checkOutTime)}
                    </td>
                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200 truncate text-xs">{r.location || "—"}</td>
                    <td className="px-3 py-2 text-slate-700 dark:text-slate-100 whitespace-nowrap text-xs font-mono font-semibold">
                      {fmtHours(r.totalHours)}
                    </td>
                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap text-xs font-mono">
                      {fmtHours(r.overtimeHours)}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="sticky bottom-0 z-20 backdrop-blur-md bg-white/80 dark:bg-black/85 border-t border-slate-200 dark:border-orange-500/30 px-4 py-2.5 flex items-center justify-between transition-colors">
        <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
          {rows.length} {rows.length === 1 ? "record" : "records"}
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Last updated: {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </span>
      </div>
    </div>
  )
}
