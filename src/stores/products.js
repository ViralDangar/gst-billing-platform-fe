import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { productsApi } from '@/api'

export const useProductsStore = defineStore('products', () => {
  const products = ref([])
  const loading = ref(false)
  const error = ref(null)

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
    } catch (err) {
      error.value = err.message
      products.value = []
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
    fetchProducts,
    createProduct,
    updateProduct,
    toggleStatus,
    getProductById
  }
})
