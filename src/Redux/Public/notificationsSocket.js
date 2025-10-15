import { io } from 'socket.io-client'

let socket = null

export function connectSocket({ url, token, companyId, userId }) {
  if (socket && socket.connected) return socket
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
    auth: { token, companyId, userId },
  })
  return socket
}

export function getSocket() {
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners()
    socket.disconnect()
    socket = null
  }
}
