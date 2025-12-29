<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useProductsStore, useToastStore } from '@/stores'
import { PageHeader, DataTable, Modal, FormInput, FormSelect, StatusBadge, ConfirmDialog, Pagination } from '@/components'
import { GST_RATES, UNIT_OPTIONS, formatCurrency } from '@/utils'
import { required, hsnSac, positiveNumber, validateForm } from '@/utils/validators'

const productsStore = useProductsStore()
const toast = useToastStore()

const showModal = ref(false)
const showConfirm = ref(false)
const editingProduct = ref(null)
const productToToggle = ref(null)
const saving = ref(false)

const currentPage = ref(1)
const pageSize = ref(10)

const form = reactive({
  name: '',
  hsn_sac: '',
  gst_rate: '',
  unit: '',
  base_price: ''
})

const errors = reactive({})

const columns = [
  { key: 'name', label: 'Product Name' },
  { key: 'hsn_sac', label: 'HSN/SAC' },
  { key: 'gst_rate', label: 'GST Rate', align: 'center' },
  { key: 'unit', label: 'Unit', align: 'center' },
  { key: 'base_price', label: 'Base Price', align: 'right' },
  { key: 'is_active', label: 'Status', align: 'center' },
  { key: 'actions', label: 'Actions', align: 'center' }
]

const validationRules = {
  name: [(v) => required(v, 'Product name')],
  hsn_sac: [(v) => required(v, 'HSN/SAC'), (v) => hsnSac(v)],
  gst_rate: [(v) => required(v, 'GST rate')],
  unit: [(v) => required(v, 'Unit')],
  base_price: [(v) => required(v, 'Base price'), (v) => positiveNumber(v, 'Base price')]
}

onMounted(() => {
  loadProducts()
})

function loadProducts() {
  productsStore.fetchProducts({
    page: currentPage.value,
    page_size: pageSize.value
  })
}

function handlePageChange(page) {
  currentPage.value = page
  loadProducts()
}

function handlePageSizeChange(newPageSize) {
  pageSize.value = newPageSize
  currentPage.value = 1 // Reset to first page when page size changes
  loadProducts()
}

function openAddModal() {
  editingProduct.value = null
  resetForm()
  showModal.value = true
}

function openEditModal(product) {
  editingProduct.value = product
  Object.assign(form, {
    name: product.name,
    hsn_sac: product.hsn_sac,
    gst_rate: product.gst_rate,
    unit: product.unit,
    base_price: product.base_price
  })
  showModal.value = true
}

function resetForm() {
  form.name = ''
  form.hsn_sac = ''
  form.gst_rate = ''
  form.unit = ''
  form.base_price = ''
  Object.keys(errors).forEach(key => delete errors[key])
}

function closeModal() {
  showModal.value = false
  editingProduct.value = null
  resetForm()
}

async function saveProduct() {
  Object.keys(errors).forEach(key => delete errors[key])
  
  const { isValid, errors: validationErrors } = validateForm(form, validationRules)
  if (!isValid) {
    Object.assign(errors, validationErrors)
    return
  }

  saving.value = true
  try {
    const data = {
      ...form,
      gst_rate: parseFloat(form.gst_rate),
      base_price: parseFloat(form.base_price)
    }

    if (editingProduct.value) {
      await productsStore.updateProduct(editingProduct.value.id, data)
      toast.success('Product updated successfully')
    } else {
      await productsStore.createProduct(data)
      toast.success('Product created successfully')
    }
    closeModal()
  } catch (err) {
    // Error handled by API interceptor
  } finally {
    saving.value = false
  }
}

function confirmToggleStatus(product) {
  productToToggle.value = product
  showConfirm.value = true
}

async function toggleStatus() {
  if (!productToToggle.value) return

  try {
    await productsStore.toggleStatus(
      productToToggle.value.id, 
      !productToToggle.value.is_active
    )
    toast.success(
      productToToggle.value.is_active 
        ? 'Product disabled successfully' 
        : 'Product enabled successfully'
    )
  } catch (err) {
    // Error handled by API interceptor
  } finally {
    showConfirm.value = false
    productToToggle.value = null
  }
}
</script>

<template>
  <div>
    <PageHeader 
      title="Product Master" 
      subtitle="Manage your products and services"
    >
      <template #actions>
        <button class="btn-primary" @click="openAddModal">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Add Product
        </button>
      </template>
    </PageHeader>

    <div class="card">
      <!-- Fixed height table container for desktop -->
      <div class="overflow-hidden">
        <div class="max-h-[calc(100vh-280px)] overflow-y-auto">
          <DataTable
            :columns="columns"
            :data="productsStore.products"
            :loading="productsStore.loading"
            empty-message="No products found. Add your first product to get started."
          >
        <template #cell-gst_rate="{ value }">
          <span class="font-mono text-sm">{{ value }}%</span>
        </template>

        <template #cell-base_price="{ value }">
          <span class="currency">{{ formatCurrency(value) }}</span>
        </template>

        <template #cell-is_active="{ value }">
          <StatusBadge :status="value ? 'Active' : 'Inactive'" />
        </template>

        <template #cell-actions="{ row }">
          <div class="flex items-center justify-center gap-2">
            <button 
              class="btn-ghost btn-sm"
              @click.stop="openEditModal(row)"
              title="Edit"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </button>
            <button 
              class="btn-ghost btn-sm"
              :class="row.is_active ? 'text-danger-600 hover:text-danger-700' : 'text-success-600 hover:text-success-700'"
              @click.stop="confirmToggleStatus(row)"
              :title="row.is_active ? 'Disable' : 'Enable'"
            >
              <svg v-if="row.is_active" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </button>
          </div>
        </template>

          <template #empty-action>
            <button class="btn-primary btn-sm mt-4" @click="openAddModal">
              Add Product
            </button>
          </template>
        </DataTable>
        </div>
      </div>

      <!-- Pagination -->
      <Pagination
        :current-page="currentPage"
        :total-pages="productsStore.pagination.total_pages"
        :total-items="productsStore.pagination.total"
        :page-size="pageSize"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      />
    </div>

    <!-- Add/Edit Modal -->
    <Modal 
      :show="showModal" 
      :title="editingProduct ? 'Edit Product' : 'Add Product'"
      size="md"
      @close="closeModal"
    >
      <form @submit.prevent="saveProduct" class="space-y-4">
        <FormInput
          v-model="form.name"
          label="Product Name"
          placeholder="Enter product name"
          required
          :error="errors.name"
        />

        <div class="grid grid-cols-2 gap-4">
          <FormInput
            v-model="form.hsn_sac"
            label="HSN/SAC Code"
            placeholder="84713010"
            required
            :error="errors.hsn_sac"
            maxlength="8"
          />

          <FormSelect
            v-model="form.gst_rate"
            label="GST Rate"
            :options="GST_RATES"
            placeholder="Select GST rate"
            required
            :error="errors.gst_rate"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <FormSelect
            v-model="form.unit"
            label="Unit"
            :options="UNIT_OPTIONS"
            placeholder="Select unit"
            required
            :error="errors.unit"
          />

          <FormInput
            v-model="form.base_price"
            label="Base Price (₹)"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            required
            :error="errors.base_price"
          />
        </div>
      </form>

      <template #footer>
        <button class="btn-secondary" @click="closeModal" :disabled="saving">
          Cancel
        </button>
        <button class="btn-primary" @click="saveProduct" :disabled="saving">
          <svg v-if="saving" class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ saving ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product') }}
        </button>
      </template>
    </Modal>

    <!-- Confirm Dialog -->
    <ConfirmDialog
      :show="showConfirm"
      :title="productToToggle?.is_active ? 'Disable Product' : 'Enable Product'"
      :message="`Are you sure you want to ${productToToggle?.is_active ? 'disable' : 'enable'} '${productToToggle?.name}'?`"
      :variant="productToToggle?.is_active ? 'warning' : 'primary'"
      :confirm-text="productToToggle?.is_active ? 'Disable' : 'Enable'"
      @confirm="toggleStatus"
      @cancel="showConfirm = false"
      @close="showConfirm = false"
    />
  </div>
</template>
