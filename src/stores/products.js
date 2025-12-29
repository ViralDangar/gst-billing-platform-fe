import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { productsApi } from '@/api'

export const useProductsStore = defineStore('products', () => {
  const products = ref([])
  const loading = ref(false)
  const error = ref(null)
  const pagination = ref({
    total: 0,
    page: 1,
    page_size: 10,
    total_pages: 0
  })

  const activeProducts = computed(() =>
    products.value.filter(p => p.is_active)
  )

  async function fetchProducts(params = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await productsApi.getProducts(params)
      // API returns paginated response with { items, total, page, page_size, total_pages }
      products.value = response.items || []
      pagination.value = {
        total: response.total || 0,
        page: response.page || 1,
        page_size: response.page_size || 10,
        total_pages: response.total_pages || 0
      }
    } catch (err) {
      error.value = err.message
      products.value = []
      pagination.value = { total: 0, page: 1, page_size: 10, total_pages: 0 }
    } finally {
      loading.value = false
    }
  }

  async function createProduct(data) {
    loading.value = true
    error.value = null
    try {
      const product = await productsApi.createProduct(data)
      products.value.push(product)
      return product
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateProduct(id, data) {
    loading.value = true
    error.value = null
    try {
      const product = await productsApi.updateProduct(id, data)
      const index = products.value.findIndex(p => p.id === id)
      if (index > -1) {
        products.value[index] = product
      }
      return product
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
      const product = await productsApi.toggleProductStatus(id, isActive)
      const index = products.value.findIndex(p => p.id === id)
      if (index > -1) {
        products.value[index] = product
      }
      return product
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  function getProductById(id) {
    return products.value.find(p => p.id === id)
  }

  return {
    products,
    activeProducts,
    loading,
    error,
    pagination,
    fetchProducts,
    createProduct,
    updateProduct,
    toggleStatus,
    getProductById
  }
})
