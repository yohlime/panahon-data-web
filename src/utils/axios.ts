import _axios from 'axios'

import { API_URL } from '@/stores/common'

const axios = _axios.create({
  withCredentials: true,
})

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const { status } = await _axios.post(`${API_URL}/tokens/renew`)
      if (status === 204) {
        return axios(originalRequest)
      }
    }
    return Promise.reject(error)
  }
)

export default axios
