import { useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { connectDesignationSocket, disconnectDesignationSocket } from "../../Redux/Public/notificationsSocket"
import { toAssetUrl } from "../../config/config"
import {
  fetchDesignationSnapshot,
  setConnected,
  upsertItems,
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
    present: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
    absent: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
    late: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
    "on-leave": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    "checked-in": { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200" },
    "checked-out": { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200" },
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
  gatewayUrl = "http://localhost:7001",
}) {
  const dispatch = useDispatch()
  const token = useSelector((s) => s.auth?.accessToken)
  const rows = useSelector((state) => selectDesignationRows(state, designationId))
  const connected = useSelector((state) => selectDesignationConnected(state, designationId))
  const loading = useSelector((state) => selectDesignationLoading(state, designationId))
  const error = useSelector((state) => selectDesignationError(state, designationId))

  const tableBodyRef = useRef(null)
  const lastRowCountRef = useRef(rows?.length || 0)

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
      dispatch(fetchDesignationSnapshot({ companyId, designationId }))
    }
    const onDisconnect = () => dispatch(setConnected({ designationId, connected: false }))
    const onNotification = (evt) => {
      if (evt?.type === "attendance.monitoring.update" && Array.isArray(evt.items)) {
        dispatch(upsertItems({ designationId, items: evt.items }))
      }
      if (evt?.type === "attendance.monitoring.snapshot") {
        const payload = evt?.data || evt || {}
        const targetDesignationId = payload.designationId || payload.rootDesignationId || designationId
        const items = Array.isArray(payload.items) ? payload.items : null
        if (targetDesignationId && Array.isArray(items)) {
          dispatch(
            upsertItems({
              designationId: targetDesignationId,
              items,
              tree: payload.tree,
              suggestedLayout: payload.suggestedLayout,
              timestamp: payload.timestamp,
            }),
          )
        }
      }
    }
    const onError = () => {
      /* no-op */
    }

    socket.off("connect", onConnect).on("connect", onConnect)
    socket.off("disconnect", onDisconnect).on("disconnect", onDisconnect)
    socket.off("notification", onNotification).on("notification", onNotification)
    socket.off("connect_error", onError).on("connect_error", onError)
    socket.off("error", onError).on("error", onError)

    return () => {
      try {
        socket.off("notification", onNotification)
        socket.off("connect", onConnect)
        socket.off("disconnect", onDisconnect)
        socket.off("connect_error", onError)
        socket.off("error", onError)
      } catch {}
      disconnectDesignationSocket(designationId)
    }
  }, [dispatch, designationId, companyId, token, gatewayUrl])

  useEffect(() => {
    if (rows?.length > lastRowCountRef.current && tableBodyRef.current) {
      lastRowCountRef.current = rows.length
      setTimeout(() => {
        tableBodyRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
      }, 50)
    }
  }, [rows?.length])

  return (
    <div className="attendance-container rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="sticky top-0 z-20 backdrop-blur-md bg-white/80 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-all duration-300 ${
              connected
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-rose-50 text-rose-700 border border-rose-200"
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
            <span className="text-xs text-slate-500 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
              Loading…
            </span>
          )}
          {error && <span className="text-xs text-rose-600 font-medium">{error}</span>}
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-auto max-h-96 attendance-scroll">
        <table className="w-full text-xs text-slate-700">
          <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-3 py-2.5 text-left font-semibold text-slate-600 whitespace-nowrap">User</th>
              <th className="px-3 py-2.5 text-left font-semibold text-slate-600 whitespace-nowrap">Status</th>
              <th className="px-3 py-2.5 text-left font-semibold text-slate-600 whitespace-nowrap">Date</th>
              <th className="px-3 py-2.5 text-left font-semibold text-slate-600 whitespace-nowrap">Check-in</th>
              <th className="px-3 py-2.5 text-left font-semibold text-slate-600 whitespace-nowrap">Check-out</th>
              <th className="px-3 py-2.5 text-left font-semibold text-slate-600 whitespace-nowrap">Location</th>
              <th className="px-3 py-2.5 text-left font-semibold text-slate-600 whitespace-nowrap">Total</th>
              <th className="px-3 py-2.5 text-left font-semibold text-slate-600 whitespace-nowrap">OT</th>
            </tr>
          </thead>
          <tbody ref={tableBodyRef}>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-slate-400 text-xs">
                  No records yet.
                </td>
              </tr>
            ) : (
              rows.map((r, idx) => {
                const avatarUrl = toAssetUrl(r.avatar)
                return (
                  <tr
                    key={r.userId}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors duration-200 animate-row-enter"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl || "/placeholder.svg"}
                            alt={r.name || "avatar"}
                            className="w-7 h-7 rounded-full object-cover flex-shrink-0 ring-1.5 ring-slate-200"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 grid place-items-center text-slate-600 text-xs font-semibold flex-shrink-0 ring-1.5 ring-slate-200">
                            {r?.name?.[0]?.toUpperCase() || "U"}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-medium text-slate-900 truncate text-xs">{r.name || "—"}</div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {r.designationId ? `${r.designationId}` : "—"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-3 py-2 text-slate-700 whitespace-nowrap text-xs">
                      {fmtDate(r.date || r.checkInTime || r.checkOutTime)}
                    </td>
                    <td className="px-3 py-2 text-slate-700 whitespace-nowrap text-xs font-mono">
                      {fmt(r.checkInTime)}
                    </td>
                    <td className="px-3 py-2 text-slate-700 whitespace-nowrap text-xs font-mono">
                      {fmt(r.checkOutTime)}
                    </td>
                    <td className="px-3 py-2 text-slate-700 truncate text-xs">{r.location || "—"}</td>
                    <td className="px-3 py-2 text-slate-700 whitespace-nowrap text-xs font-mono font-semibold">
                      {fmtHours(r.totalHours)}
                    </td>
                    <td className="px-3 py-2 text-slate-700 whitespace-nowrap text-xs font-mono">
                      {fmtHours(r.overtimeHours)}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="sticky bottom-0 z-20 backdrop-blur-md bg-white/80 border-t border-slate-200 px-4 py-2.5 flex items-center justify-between">
        <span className="text-xs text-slate-600 font-medium">
          {rows.length} {rows.length === 1 ? "record" : "records"}
        </span>
        <span className="text-xs text-slate-500">
          Last updated: {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </span>
      </div>
    </div>
  )
}
