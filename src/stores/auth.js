import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api'

const TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_KEY = 'user'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const accessToken = ref(null)
  const refreshToken = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!accessToken.value)
  const isAdmin = computed(() => user.value?.is_superuser || false)

  // Initialize from localStorage
  function init() {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
    const storedUser = localStorage.getItem(USER_KEY)

    if (storedToken) {
      accessToken.value = storedToken
    }
    if (storedRefreshToken) {
      refreshToken.value = storedRefreshToken
    }
    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser)
      } catch (e) {
        console.error('Failed to parse stored user', e)
      }
    }
  }

  // Save tokens to localStorage
  function saveTokens(access, refresh) {
    accessToken.value = access
    refreshToken.value = refresh
    localStorage.setItem(TOKEN_KEY, access)
    if (refresh) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
    }
  }

  // Save user to localStorage
  function saveUser(userData) {
    user.value = userData
    localStorage.setItem(USER_KEY, JSON.stringify(userData))
  }

  // Clear all auth data
  function clearAuth() {
    accessToken.value = null
    refreshToken.value = null
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  // Login
  async function login(credentials) {
    loading.value = true
    error.value = null
    try {
      const response = await authApi.login(credentials)
      saveTokens(response.access_token, response.refresh_token)

      // Fetch user data
      await fetchCurrentUser()

      return response
    } catch (err) {
      error.value = err.response?.data?.detail || 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Register
  async function register(userData) {
    loading.value = true
    error.value = null
    try {
      const response = await authApi.register(userData)
      return response
    } catch (err) {
      error.value = err.response?.data?.detail || 'Registration failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Fetch current user
  async function fetchCurrentUser() {
    try {
      const userData = await authApi.getCurrentUser()
      saveUser(userData)
      return userData
    } catch (err) {
      console.error('Failed to fetch current user', err)
      throw err
    }
  }

  // Refresh token
  async function refreshAccessToken() {
    if (!refreshToken.value) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await authApi.refresh(refreshToken.value)
      saveTokens(response.access_token, response.refresh_token || refreshToken.value)
      return response.access_token
    } catch (err) {
      // Refresh failed, logout user
      await logout()
      throw err
    }
  }

  // Logout
  async function logout() {
    loading.value = true
    try {
      await authApi.logout()
    } catch (err) {
      console.error('Logout error', err)
    } finally {
      clearAuth()
      loading.value = false
      // Router navigation will be handled by the component calling logout
    }
  }

  // Check if token is valid (basic check)
  function checkTokenValidity() {
    if (!accessToken.value) return false

    try {
      // Decode JWT token to check expiration
      const payload = JSON.parse(atob(accessToken.value.split('.')[1]))
      const exp = payload.exp * 1000 // Convert to milliseconds
      return Date.now() < exp
    } catch (e) {
      return false
    }
  }

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    isAdmin,
    loading,
    error,
    init,
    login,
    register,
    fetchCurrentUser,
    refreshAccessToken,
    logout,
    checkTokenValidity
  }
})
