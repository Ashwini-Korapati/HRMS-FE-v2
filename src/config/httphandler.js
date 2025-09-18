import { serverURL } from "./config"
import axios from "axios"
import { storage, persistKeys } from '../store/storage'
// We will lazily attach the redux store to enable refresh dispatch without circular import
let reduxStore = null
export function attachStore(store) { reduxStore = store }
 
// Create a custom axios instance that we can use throughout the app
const axiosInstance = axios.create({
  baseURL: serverURL,
})
 
// Add request interceptor to show loading spinner
axiosInstance.interceptors.request.use(
  (config) => {
    if (window.loadingContext) {
      window.loadingContext.showLoading()
    }
    // Inject bearer token if available (session first then local)
    const token = storage.session.get(persistKeys.accessToken) || storage.local.get(persistKeys.accessToken)
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    if (window.loadingContext) {
      window.loadingContext.hideLoading()
    }
    return Promise.reject(error)
  },
)
 
// Add response interceptor to hide loading spinner
let isRefreshing = false
let refreshQueue = []
function flushQueue(error, token = null) {
  refreshQueue.forEach(p => {
    if (error) p.reject(error)
    else p.resolve(token)
  })
  refreshQueue = []
}

axiosInstance.interceptors.response.use(
  (response) => {
    if (window.loadingContext) {
      window.loadingContext.hideLoading()
    }
    return response
  },
  async (error) => {
    if (window.loadingContext) {
      window.loadingContext.hideLoading()
    }
    const original = error.config
    if (error.response && error.response.status === 401 && !original._retry) {
      original._retry = true
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject })
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`
          return axiosInstance(original)
        })
      }
      isRefreshing = true
      try {
        if (reduxStore) {
          const { refreshAccessToken, selectAccessToken } = require('../Redux/Public/authSlice')
          await reduxStore.dispatch(refreshAccessToken())
          const state = reduxStore.getState()
          const newToken = selectAccessToken(state)
          flushQueue(null, newToken)
          original.headers.Authorization = `Bearer ${newToken}`
          return axiosInstance(original)
        }
      } catch (e) {
        flushQueue(e, null)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  },
)
 
function injectAuthHeader(headers = {}) {
  const token = storage.session.get(persistKeys.accessToken) || storage.local.get(persistKeys.accessToken)
  if (token) return { ...headers, Authorization: `Bearer ${token}` }
  return headers
}

export function httpPostService(url, data, options = {}) {
  const apiURL = `${serverURL}/${url}`
  const headers = injectAuthHeader({ "Content-Type": "application/json", ...options.headers })
 
  // Show loading spinner
  if (window.loadingContext) {
    window.loadingContext.showLoading()
  }
 
  return fetch(apiURL, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(data),
  })
    .then((response) => {
      return response.json().then((data) => {
        // Hide loading spinner
        if (window.loadingContext) {
          window.loadingContext.hideLoading()
        }
        return { status: response.status, data: data }
      })
    })
    .catch((err) => {
      console.error(err)
      // Hide loading spinner on error
      if (window.loadingContext) {
        window.loadingContext.hideLoading()
      }
      return { status: 500, data: { message: "Something went wrong" } }
    })
}

export function httpGetService(url, options = {}) {
  const apiURL = `${serverURL}/${url}`
  const headers = injectAuthHeader({ Accept: "application/json", ...options.headers })

  if (window.loadingContext) window.loadingContext.showLoading()

  return fetch(apiURL, { method: "GET", headers })
    .then(async (response) => {
      const data = await response.json().catch(() => ({}))
      if (window.loadingContext) window.loadingContext.hideLoading()
      return { status: response.status, data }
    })
    .catch((err) => {
      console.error(err)
      if (window.loadingContext) window.loadingContext.hideLoading()
      return { status: 500, data: { message: "Something went wrong" } }
    })
}

export function httpPatchService(url, data, options = {}) {
  const apiURL = `${serverURL}/${url}`
  const headers = injectAuthHeader({ "Content-Type": "application/json", ...options.headers })

  if (window.loadingContext) window.loadingContext.showLoading()

  return fetch(apiURL, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
  })
    .then(async (response) => {
      const json = await response.json().catch(() => ({}))
      if (window.loadingContext) window.loadingContext.hideLoading()
      return { status: response.status, data: json }
    })
    .catch((err) => {
      console.error(err)
      if (window.loadingContext) window.loadingContext.hideLoading()
      return { status: 500, data: { message: "Something went wrong" } }
    })
}

export function httpDeleteService(url, options = {}) {
  const apiURL = `${serverURL}/${url}`
  const headers = injectAuthHeader({ Accept: "application/json", ...options.headers })

  if (window.loadingContext) window.loadingContext.showLoading()

  return fetch(apiURL, { method: "DELETE", headers })
    .then(async (response) => {
      let data = {}
      try { data = await response.json() } catch (_) {}
      if (window.loadingContext) window.loadingContext.hideLoading()
      return { status: response.status, data }
    })
    .catch((err) => {
      console.error(err)
      if (window.loadingContext) window.loadingContext.hideLoading()
      return { status: 500, data: { message: "Something went wrong" } }
    })
}

export { axiosInstance }
 