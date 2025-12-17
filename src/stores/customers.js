import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { customersApi } from '@/api'

export const useCustomersStore = defineStore('customers', () => {
  const customers = ref([])
  const loading = ref(false)
  const error = ref(null)

  const activeCustomers = computed(() => 
    customers.value.filter(c => c.is_active)
  )

  const b2bCustomers = computed(() => 
    activeCustomers.value.filter(c => c.customer_type === 'B2B')
  )

  const b2cCustomers = computed(() => 
    activeCustomers.value.filter(c => c.customer_type === 'B2C')
  )

  async function fetchCustomers(params = {}) {
    loading.value = true
    error.value = null
    try {
      customers.value = await customersApi.getCustomers(params)
    } catch (err) {
      error.value = err.message
      customers.value = []
    } finally {
      loading.value = false
    }
  }

  async function createCustomer(data) {
    loading.value = true
    error.value = null
    try {
      const customer = await customersApi.createCustomer(data)
      customers.value.push(customer)
      return customer
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateCustomer(id, data) {
    loading.value = true
    error.value = null
    try {
      const customer = await customersApi.updateCustomer(id, data)
      const index = customers.value.findIndex(c => c.id === id)
      if (index > -1) {
        customers.value[index] = customer
      }
      return customer
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function toggleStatus(id, isActive) {
    loading.value = true
    error.value = null
    try {
      const customer = await customersApi.toggleCustomerStatus(id, isActive)
      const index = customers.value.findIndex(c => c.id === id)
      if (index > -1) {
        customers.value[index] = customer
      }
      return customer
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  function getCustomerById(id) {
    return customers.value.find(c => c.id === id)
  }

  return {
    customers,
    activeCustomers,
    b2bCustomers,
    b2cCustomers,
    loading,
    error,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    toggleStatus,
    getCustomerById
  }
})
