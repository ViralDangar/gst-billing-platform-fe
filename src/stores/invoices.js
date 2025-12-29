import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { invoicesApi } from '@/api'

export const useInvoicesStore = defineStore('invoices', () => {
  const invoices = ref([])
  const currentInvoice = ref(null)
  const invoicePreview = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const pagination = ref({
    total: 0,
    page: 1,
    page_size: 10,
    total_pages: 0
  })

  const draftInvoices = computed(() => 
    invoices.value.filter(i => i.status === 'DRAFT')
  )

  const finalInvoices = computed(() => 
    invoices.value.filter(i => i.status === 'FINAL')
  )

  const isCurrentEditable = computed(() => 
    currentInvoice.value?.status === 'DRAFT'
  )

  async function fetchInvoices(params = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await invoicesApi.getInvoices(params)
      // API returns paginated response with { items, total, page, page_size, total_pages }
      invoices.value = response.items || []
      pagination.value = {
        total: response.total || 0,
        page: response.page || 1,
        page_size: response.page_size || 10,
        total_pages: response.total_pages || 0
      }
    } catch (err) {
      error.value = err.message
      invoices.value = []
      pagination.value = { total: 0, page: 1, page_size: 10, total_pages: 0 }
    } finally {
      loading.value = false
    }
  }

  async function fetchInvoice(id) {
    loading.value = true
    error.value = null
    try {
      currentInvoice.value = await invoicesApi.getInvoice(id)
      return currentInvoice.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createInvoice(data) {
    loading.value = true
    error.value = null
    try {
      const invoice = await invoicesApi.createInvoice(data)
      invoices.value.unshift(invoice)
      currentInvoice.value = invoice
      return invoice
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateInvoice(id, data) {
    loading.value = true
    error.value = null
    try {
      const invoice = await invoicesApi.updateInvoice(id, data)
      const index = invoices.value.findIndex(i => i.id === id)
      if (index > -1) {
        invoices.value[index] = invoice
      }
      currentInvoice.value = invoice
      return invoice
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function addItem(invoiceId, item) {
    loading.value = true
    error.value = null
    try {
      await invoicesApi.addInvoiceItem(invoiceId, item)
      // Fetch the updated invoice to get all items
      const invoice = await invoicesApi.getInvoice(invoiceId)
      currentInvoice.value = invoice
      const index = invoices.value.findIndex(i => i.id === invoiceId)
      if (index > -1) {
        invoices.value[index] = invoice
      }
      return invoice
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateItem(invoiceId, itemId, item) {
    loading.value = true
    error.value = null
    try {
      await invoicesApi.updateInvoiceItem(invoiceId, itemId, item)
      // Fetch the updated invoice to get all items
      const invoice = await invoicesApi.getInvoice(invoiceId)
      currentInvoice.value = invoice
      return invoice
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function removeItem(invoiceId, itemId) {
    loading.value = true
    error.value = null
    try {
      await invoicesApi.removeInvoiceItem(invoiceId, itemId)
      // Fetch the updated invoice to get all items
      const invoice = await invoicesApi.getInvoice(invoiceId)
      currentInvoice.value = invoice
      return invoice
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function calculateTax(invoiceId) {
    loading.value = true
    error.value = null
    try {
      const result = await invoicesApi.calculateTax(invoiceId)
      // Refresh the invoice to get updated tax calculations
      await fetchInvoice(invoiceId)
      return result
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function finalizeInvoice(id) {
    loading.value = true
    error.value = null
    try {
      const invoice = await invoicesApi.finalizeInvoice(id)
      const index = invoices.value.findIndex(i => i.id === id)
      if (index > -1) {
        invoices.value[index] = invoice
      }
      currentInvoice.value = invoice
      return invoice
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchPreview(id) {
    loading.value = true
    error.value = null
    try {
      const previewData = await invoicesApi.getPreview(id)

      // Extract tax information
      const cgstTax = previewData.taxes?.find(t => t.tax_type === 'CGST')
      const sgstTax = previewData.taxes?.find(t => t.tax_type === 'SGST')
      const igstTax = previewData.taxes?.find(t => t.tax_type === 'IGST')

      // Get the GST rate (same for all taxes, just use the first one)
      const gstRate = parseFloat(cgstTax?.tax_rate || sgstTax?.tax_rate || igstTax?.tax_rate || 0)

      // Transform items to include tax calculations
      const transformedItems = (previewData.items || []).map(item => {
        const taxableValue = parseFloat(item.taxable_value)
        const gstAmount = (taxableValue * gstRate) / 100

        return {
          ...item,
          gst_rate: gstRate,
          cgst_amount: cgstTax ? gstAmount / 2 : 0,
          sgst_amount: sgstTax ? gstAmount / 2 : 0,
          igst_amount: igstTax ? gstAmount : 0,
          total_amount: taxableValue + gstAmount
        }
      })

      // Transform flat API response to expected nested structure
      invoicePreview.value = {
        invoice: {
          invoice_number: previewData.invoice_number,
          invoice_date: previewData.invoice_date,
          status: 'FINALIZED', // Preview is only for finalized invoices
          total_amount: previewData.grand_total
        },
        seller: {
          name: previewData.seller_name,
          gstin: previewData.seller_gstin
        },
        buyer: {
          name: previewData.customer_name,
          gstin: previewData.customer_gstin,
          address: previewData.customer_address
        },
        items: transformedItems,
        tax_summary: {
          taxable_amount: previewData.taxable_total,
          cgst_amount: parseFloat(cgstTax?.tax_amount || 0),
          sgst_amount: parseFloat(sgstTax?.tax_amount || 0),
          igst_amount: parseFloat(igstTax?.tax_amount || 0),
          tax_total: previewData.tax_total,
          round_off: previewData.round_off,
          grand_total: previewData.grand_total
        }
      }

      return invoicePreview.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function downloadPdf(id) {
    try {
      const { blob, headers } = await invoicesApi.downloadPdf(id)

      // Extract filename from Content-Disposition header
      let filename = `invoice-${id}.pdf` // fallback
      const contentDisposition = headers['content-disposition']
      console.log({contentDisposition})
      if (contentDisposition) {
        // Parse filename from header: "inline; filename=GST/2025-26/000008_2025-12-29_FCB ULKA ADVERTISING Private Limited.pdf"
        const filenameMatch = contentDisposition.match(/filename=([^;]+)/)
        if (filenameMatch && filenameMatch[1]) {
          // Remove quotes if present and trim whitespace
          filename = filenameMatch[1].replace(/['"]/g, '').trim()

          // Replace forward slashes with underscores for file system compatibility
          // This converts "GST/2025-26/000008_..." to "GST_2025-26_000008_..."
          filename = filename.replace(/\//g, '_')
        }
      }

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  function clearCurrentInvoice() {
    currentInvoice.value = null
    invoicePreview.value = null
  }

  return {
    invoices,
    currentInvoice,
    invoicePreview,
    draftInvoices,
    finalInvoices,
    isCurrentEditable,
    loading,
    error,
    pagination,
    fetchInvoices,
    fetchInvoice,
    createInvoice,
    updateInvoice,
    addItem,
    updateItem,
    removeItem,
    calculateTax,
    finalizeInvoice,
    fetchPreview,
    downloadPdf,
    clearCurrentInvoice
  }
})
