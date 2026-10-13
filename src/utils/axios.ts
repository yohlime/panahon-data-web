import _axios from 'axios'

const axios = _axios.create({
  baseURL: import.meta.env.PUBLIC_PANAHON_API,
  withCredentials: true,
})

// Single-flight refresh: concurrent 401s share one /tokens/renew call.
let renewPromise: Promise<void> | null = null

const renewSession = () => {
  if (!renewPromise) {
    renewPromise = axios
      .post('/tokens/renew')
      .then(() => undefined)
      .finally(() => {
        renewPromise = null
      })
  }
  return renewPromise
}

const redirectToHome = () => {
  if (typeof window === 'undefined') return
  const base = import.meta.env.BASE_URL ?? '/'
  if (window.location.pathname !== base) {
    window.location.replace(base)
  }
}

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Never recurse on the refresh call itself.
    if (originalRequest?.url?.includes('/tokens/renew')) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        await renewSession()
        return axios(originalRequest)
      } catch {
        redirectToHome()
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  },
)

export default axios
