import apiClient from './client'

export const authApi = {
  /**
   * Register a new user
   */
  async register(data) {
    const response = await apiClient.post('/auth/register', data)
    return response.data
  },

  /**
   * Login user
   */
  async login(credentials) {
    const response = await apiClient.post('/auth/login', credentials)
    return response.data
  },

  /**
   * Refresh access token
   */
  async refresh(refreshToken) {
    const response = await apiClient.post('/auth/refresh', { refresh_token: refreshToken })
    return response.data
  },

  /**
   * Get current user
   */
  async getCurrentUser() {
    const response = await apiClient.get('/auth/me')
    return response.data
  },

  /**
   * Logout (client-side only, clear tokens)
   */
  logout() {
    // Token clearing is handled in the store
    return Promise.resolve()
  }
}

export default authApi
