import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { invoicesApi } from '@/api'

export const useInvoicesStore = defineStore('invoices', () => {
  const invoices = ref([])
  const currentInvoice = ref(null)
  const invoicePreview = ref(null)
  const loading = ref(false)
  const error = ref(null)

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
      invoices.value = await invoicesApi.getInvoices(params)
    } catch (err) {
      error.value = err.message
      invoices.value = []
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
      const invoice = await invoicesApi.addInvoiceItem(invoiceId, item)
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
      const invoice = await invoicesApi.updateInvoiceItem(invoiceId, itemId, item)
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
      const invoice = await invoicesApi.removeInvoiceItem(invoiceId, itemId)
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
      invoicePreview.value = await invoicesApi.getPreview(id)
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
      const blob = await invoicesApi.downloadPdf(id)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `invoice-${id}.pdf`
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
