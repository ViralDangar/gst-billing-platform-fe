import axios from 'axios'
import { useToastStore } from '@/stores/toast'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add authentication token if available
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const toast = useToastStore()
    
    let message = 'An unexpected error occurred'
    
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      
      if (data?.detail) {
        message = typeof data.detail === 'string' 
          ? data.detail 
          : data.detail.message || message
      } else if (status === 404) {
        message = 'Resource not found'
      } else if (status === 422) {
        message = 'Validation error. Please check your input.'
      } else if (status === 500) {
        message = 'Server error. Please try again later.'
      }
    } else if (error.request) {
      // Request made but no response received
      message = 'Unable to connect to server. Please check your connection.'
    }
    
    toast.error(message)
    return Promise.reject(error)
  }
)

export default apiClient
