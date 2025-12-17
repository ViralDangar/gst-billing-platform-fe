import apiClient from './client'

export const customersApi = {
  /**
   * Get all customers
   */
  async getCustomers(params = {}) {
    const response = await apiClient.get('/masters/customer', { params })
    return response.data
  },

  /**
   * Get single customer by ID
   */
  async getCustomer(id) {
    const response = await apiClient.get(`/masters/customer/${id}`)
    return response.data
  },

  /**
   * Create new customer
   */
  async createCustomer(data) {
    const response = await apiClient.post('/masters/customer', data)
    return response.data
  },

  /**
   * Update existing customer
   */
  async updateCustomer(id, data) {
    const response = await apiClient.put(`/masters/customer/${id}`, data)
    return response.data
  },

  /**
   * Toggle customer status (soft delete)
   */
  async toggleCustomerStatus(id, isActive) {
    const response = await apiClient.patch(`/masters/customer/${id}/status`, {
      is_active: isActive
    })
    return response.data
  }
}

export default customersApi
