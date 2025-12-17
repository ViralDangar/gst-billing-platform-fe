import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { companyApi } from '@/api'

export const useCompanyStore = defineStore('company', () => {
  const company = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const isSetup = computed(() => !!company.value?.id)

  async function fetchCompany() {
    loading.value = true
    error.value = null
    try {
      company.value = await companyApi.getCompany()
    } catch (err) {
      // 404 means company not setup yet, which is okay
      if (err.response?.status !== 404) {
        error.value = err.message
      }
      company.value = null
    } finally {
      loading.value = false
    }
  }

  async function saveCompany(data) {
    loading.value = true
    error.value = null
    try {
      if (company.value?.id) {
        company.value = await companyApi.updateCompany(data)
      } else {
        company.value = await companyApi.saveCompany(data)
      }
      return company.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    company,
    loading,
    error,
    isSetup,
    fetchCompany,
    saveCompany
  }
})
