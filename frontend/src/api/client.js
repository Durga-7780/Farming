import axios from 'axios'
import axiosRetry from 'axios-retry'
import toast from 'react-hot-toast'

export const API_BASE = import.meta.env.VITE_API_BASE || (typeof window !== 'undefined' && window.location.hostname ? `${window.location.protocol}//${window.location.hostname}:2028` : 'http://localhost:2028')

const api = axios.create({ baseURL: API_BASE })

axiosRetry(api, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.code === 'ECONNABORTED';
  }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('agroledger_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
     localStorage.removeItem('agroledger_token')
     localStorage.removeItem('agroledger_user')
     if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    } else if (err.code === 'ERR_NETWORK') {
      toast.error('Network error. Please check your connection.')
    } else if (err?.response?.status >= 500) {
      toast.error('Server is currently unavailable.')
    }
    return Promise.reject(err)
  }
)

export default api
