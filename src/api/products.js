import apiClient from './client'

export const productsApi = {
  /**
   * Get all products
   */
  async getProducts(params = {}) {
    const response = await apiClient.get('/masters/products', { params })
    return response.data
  },

  /**
   * Get single product by ID
   */
  async getProduct(id) {
    const response = await apiClient.get(`/masters/products/${id}`)
    return response.data
  },

  /**
   * Create new product
   */
  async createProduct(data) {
    const response = await apiClient.post('/masters/products', data)
    return response.data
  },

  /**
   * Update existing product
   */
  async updateProduct(id, data) {
    const response = await apiClient.put(`/masters/products/${id}`, data)
    return response.data
  },

  /**
   * Toggle product status (soft delete)
   */
  async toggleProductStatus(id, isActive) {
    const response = await apiClient.patch(`/masters/products/${id}/status`, {
      is_active: isActive
    })
    return response.data
  }
}

export default productsApi
