import _axios from 'axios'

const axios = _axios.create({
  baseURL: import.meta.env.PUBLIC_PANAHON_API,
  withCredentials: true,
})

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const { status } = await axios.post('/tokens/renew')
      if (status === 204) {
        return axios(originalRequest)
      }
    }
    return Promise.reject(error)
  },
)

export default axios
