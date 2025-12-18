import apiClient from './client'

export const invoicesApi = {
  /**
   * Get all invoices
   */
  async getInvoices(params = {}) {
    const response = await apiClient.get('/billing/invoices/', { params })
    return response.data
  },

  /**
   * Get single invoice by ID
   */
  async getInvoice(id) {
    const response = await apiClient.get(`/billing/invoices/${id}`)
    return response.data
  },

  /**
   * Create new invoice
   */
  async createInvoice(data) {
    const response = await apiClient.post('/billing/invoices/', data)
    return response.data
  },

  /**
   * Update existing invoice
   */
  async updateInvoice(id, data) {
    const response = await apiClient.put(`/billing/invoices/${id}`, data)
    return response.data
  },

  /**
   * Add item to invoice
   */
  async addInvoiceItem(invoiceId, item) {
    const response = await apiClient.post(`/billing/invoices/${invoiceId}/items`, item)
    return response.data
  },

  /**
   * Update invoice item
   */
  async updateInvoiceItem(invoiceId, itemId, item) {
    const response = await apiClient.put(`/billing/invoices/${invoiceId}/items/${itemId}`, item)
    return response.data
  },

  /**
   * Remove item from invoice
   */
  async removeInvoiceItem(invoiceId, itemId) {
    const response = await apiClient.delete(`/billing/invoices/${invoiceId}/items/${itemId}`)
    return response.data
  },

  /**
   * Calculate GST for invoice
   */
  async calculateTax(invoiceId) {
    const response = await apiClient.post(`/tax/calculate`, { invoice_id: invoiceId })
    return response.data
  },

  /**
   * Finalize invoice
   */
  async finalizeInvoice(id) {
    const response = await apiClient.post(`/billing/invoices/${id}/finalize`)
    return response.data
  },

  /**
   * Get invoice preview data
   */
  async getPreview(id) {
    const response = await apiClient.get(`/documents/invoices/${id}/preview`)
    return response.data
  },

  /**
   * Download invoice PDF
   */
  async downloadPdf(id) {
    const response = await apiClient.get(`/documents/invoices/${id}/pdf`, {
      responseType: 'blob'
    })
    return response.data
  }
}

export default invoicesApi
