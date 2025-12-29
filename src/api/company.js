import apiClient from './client'

export const companyApi = {
  /**
   * Get company details
   */
  async getCompany() {
    const response = await apiClient.get('/identity/company/with-gstin')
    return response.data
  },

  /**
   * Create or update company details
   */
  async saveCompany(data) {
    const response = await apiClient.post('/identity/company', data)
    return response.data
  },

  /**
   * Update company details
   */
  async updateCompany(data) {
    const response = await apiClient.put('/identity/company', data)
    return response.data
  }
}

export default companyApi
