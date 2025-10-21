// ...existing code...
import { io } from 'socket.io-client'

// Default/global notifications socket (single)
let socket = null

// Heartbeat helpers
function startHeartbeat(s, { intervalMs = 25000, staleMs = 60000 } = {}) {
  if (!s) return
  // store timers on the socket instance
  if (s.__hbTimer) clearInterval(s.__hbTimer)
  s.__lastAck = Date.now()

  const onAck = () => { s.__lastAck = Date.now() }
  s.off('heartbeat-ack', onAck).on('heartbeat-ack', onAck)

  s.__hbTimer = setInterval(() => {
    try {
      s.emit('heartbeat', { ts: Date.now() })
      // If no ack for > staleMs, force a fast reconnect
      if (Date.now() - (s.__lastAck || 0) > staleMs) {
        s.disconnect()
        s.connect()
      }
    } catch {}
  }, intervalMs)
}

function stopHeartbeat(s) {
  if (!s) return
  if (s.__hbTimer) {
    clearInterval(s.__hbTimer)
    s.__hbTimer = null
  }
}

export function connectSocket({ url, token, companyId, userId }) {
  // Reuse singleton socket to avoid duplicate managers and StrictMode noise
  if (socket) {
    try { if (!socket.connected) socket.connect() } catch {}
    return socket
  }
  let finalUrl = url
  try {
    const u = new URL(url)
    if (token) u.searchParams.set('token', token)
    if (companyId) u.searchParams.set('companyId', companyId)
    if (userId) u.searchParams.set('userId', userId)
    finalUrl = u.toString()
  } catch {
    // if url is not absolute, append query manually
    const qp = new URLSearchParams()
    if (token) qp.set('token', token)
    if (companyId) qp.set('companyId', companyId)
    if (userId) qp.set('userId', userId)
    finalUrl = url + (url.includes('?') ? '&' : '?') + qp.toString()
  }

  socket = io(finalUrl, {
    transports: ['websocket'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
    reconnectionDelayMax: 5000,
    timeout: 10000,
    auth: { token, companyId, userId },
  })

  socket.on('connect', () => {
    // optional namespace join if your gateway requires it
    // socket.emit('joinCompany', { companyId })
    startHeartbeat(socket)
  })
  socket.on('disconnect', () => stopHeartbeat(socket))
  socket.on('connect_error', () => {/* no-op, auto retries */})

  return socket
}

export function getSocket() {
  return socket
}

export function disconnectSocket() {
  if (socket) {
    try {
      socket.removeAllListeners()
      stopHeartbeat(socket)
      // Avoid forcing disconnect when the client is not yet connected;
      // this prevents "closed before established" noise in dev.
      if (socket.connected) {
        socket.disconnect()
      }
    } catch {}
    socket = null
  }
}

// Ask the server to publish a fresh snapshot for a designation.
// Backend should listen on this event and reply by emitting
// `attendance.monitoring.snapshot` to the appropriate topic/room.
export function requestDesignationSnapshot({ designationId, companyId }) {
  try {
    if (!socket || !socket.connected) return false
    socket.emit('attendance.monitoring.snapshot.request', { designationId, companyId })
    return true
  } catch {
    return false
  }
}

// Designation monitoring sockets (multiple)
const designationSockets = new Map() // key: designationId, value: socket

export function connectDesignationSocket({ url, token, designationId }) {
  if (!designationId) throw new Error('designationId is required')
  const existing = designationSockets.get(designationId)
  if (existing && existing.connected) return existing

  const s = io(url, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
    reconnectionDelayMax: 5000,
    timeout: 10000,
    auth: { token: token || undefined, designationId },
    query: { designationId },
  })

  // Ensure room join (gateway also auto-joins via auth/query)
  s.on('connect', () => {
    try { s.emit('joinDesignation', { designationId }) } catch {}
    startHeartbeat(s)
  })
  s.on('disconnect', () => stopHeartbeat(s))
  s.on('connect_error', () => {/* auto retries */})

  designationSockets.set(designationId, s)
  return s
}

export function getDesignationSocket(designationId) {
  return designationSockets.get(designationId) || null
}

export function disconnectDesignationSocket(designationId) {
  const s = designationSockets.get(designationId)
  if (s) {
    try {
      s.removeAllListeners()
      stopHeartbeat(s)
      s.disconnect()
    } catch {}
    designationSockets.delete(designationId)
  }
}
