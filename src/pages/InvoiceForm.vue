<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useInvoicesStore, useCustomersStore, useProductsStore, useToastStore } from '@/stores'
import { PageHeader, FormInput, FormSelect, StatusBadge, LoadingSpinner, ConfirmDialog } from '@/components'
import { formatCurrency, formatNumber, getTodayDate, formatDateForInput } from '@/utils'

const route = useRoute()
const router = useRouter()
const invoicesStore = useInvoicesStore()
const customersStore = useCustomersStore()
const productsStore = useProductsStore()
const toast = useToastStore()

const invoiceId = computed(() => route.params.id)
const isEditMode = computed(() => !!invoiceId.value)

const loading = ref(false)
const saving = ref(false)
const calculating = ref(false)
const finalizing = ref(false)
const showFinalizeConfirm = ref(false)

const form = reactive({
  customer_id: '',
  invoice_date: getTodayDate(),
  po_number: '',
  notes: ''
})

const newItem = reactive({
  product_id: '',
  quantity: 1,
  rate: 0
})

const isEditable = computed(() => {
  if (!isEditMode.value) return true
  return invoicesStore.currentInvoice?.status === 'DRAFT'
})

const customerOptions = computed(() => {
  return customersStore.activeCustomers.map(c => ({
    value: c.id,
    label: `${c.name}${c.gstin ? ` (${c.gstin})` : ''}`
  }))
})

const productOptions = computed(() => {
  return productsStore.activeProducts.map(p => ({
    value: p.id,
    label: `${p.name} - ${p.hsn_sac} (${p.gst_rate}%)`
  }))
})

const selectedProduct = computed(() => {
  if (!newItem.product_id) return null
  return productsStore.getProductById(newItem.product_id)
})

const currentInvoice = computed(() => invoicesStore.currentInvoice)
const invoiceItems = computed(() => currentInvoice.value?.items || [])

// Store tax calculation result temporarily
const calculatedTax = ref(null)

const isTaxCalculated = computed(() => {
  // Check if tax has been calculated (either stored in calculatedTax or in invoice)
  return calculatedTax.value !== null ||
         (currentInvoice.value?.tax_total !== null && currentInvoice.value?.tax_total !== undefined)
})

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      customersStore.fetchCustomers(),
      productsStore.fetchProducts()
    ])

    if (isEditMode.value) {
      await invoicesStore.fetchInvoice(invoiceId.value)
      if (currentInvoice.value) {
        form.customer_id = currentInvoice.value.customer_id
        form.invoice_date = formatDateForInput(currentInvoice.value.invoice_date)
        form.po_number = currentInvoice.value.po_number || ''
        form.notes = currentInvoice.value.notes || ''
      }
    }
  } finally {
    loading.value = false
  }
})

watch(selectedProduct, (product) => {
  if (product) {
    newItem.rate = product.base_price
  }
})

async function createInvoice() {
  if (!form.customer_id) {
    toast.error('Please select a customer')
    return
  }

  saving.value = true
  try {
    const invoice = await invoicesStore.createInvoice({
      customer_id: form.customer_id,
      invoice_date: form.invoice_date,
      po_number: form.po_number || null,
      notes: form.notes
    })
    router.replace({ name: 'invoice-edit', params: { id: invoice.id } })
    toast.success('Invoice created successfully')
  } catch (err) {
    // Error handled by API interceptor
  } finally {
    saving.value = false
  }
}

async function addItem() {
  if (!newItem.product_id) {
    toast.error('Please select a product')
    return
  }
  if (!newItem.quantity || newItem.quantity <= 0) {
    toast.error('Please enter a valid quantity')
    return
  }
  if (!newItem.rate || newItem.rate <= 0) {
    toast.error('Please enter a valid rate')
    return
  }

  saving.value = true
  try {
    await invoicesStore.addItem(currentInvoice.value.id, {
      product_id: newItem.product_id,
      quantity: parseInt(newItem.quantity),
      rate: parseFloat(newItem.rate)
    })
    // Clear calculated tax when items change
    calculatedTax.value = null
    // Reset form
    newItem.product_id = ''
    newItem.quantity = 1
    newItem.rate = 0
    toast.success('Item added successfully')
  } catch (err) {
    // Error handled by API interceptor
  } finally {
    saving.value = false
  }
}

async function removeItem(itemId) {
  try {
    await invoicesStore.removeItem(currentInvoice.value.id, itemId)
    // Clear calculated tax when items change
    calculatedTax.value = null
    toast.success('Item removed')
  } catch (err) {
    // Error handled by API interceptor
  }
}

async function calculateGst() {
  if (!invoiceItems.value || invoiceItems.value.length === 0) {
    toast.error('Please add at least one item')
    return
  }

  calculating.value = true
  try {
    const result = await invoicesStore.calculateTax(currentInvoice.value.id)
    // Store the tax calculation result temporarily
    calculatedTax.value = result
    console.log('Tax calculation result:', result)
    toast.success('GST calculated successfully')
  } catch (err) {
    // Error handled by API interceptor
  } finally {
    calculating.value = false
  }
}

function confirmFinalize() {
  if (!invoiceItems.value.length) {
    toast.error('Please add at least one item')
    return
  }
  if (!isTaxCalculated.value) {
    toast.error('Please calculate GST first')
    return
  }
  showFinalizeConfirm.value = true
}

async function finalizeInvoice() {
  finalizing.value = true
  try {
    await invoicesStore.finalizeInvoice(currentInvoice.value.id)
    toast.success('Invoice finalized successfully')
    showFinalizeConfirm.value = false
    router.push({ name: 'invoice-preview', params: { id: currentInvoice.value.id } })
  } catch (err) {
    // Error handled by API interceptor
  } finally {
    finalizing.value = false
  }
}

function previewInvoice() {
  router.push({ name: 'invoice-preview', params: { id: currentInvoice.value.id } })
}

function goBack() {
  router.push({ name: 'invoices' })
}

function getProductName(productId) {
  const product = productsStore.getProductById(productId)
  return product?.name || 'Unknown Product'
}

function getProductHsn(productId) {
  const product = productsStore.getProductById(productId)
  return product?.hsn_sac || '-'
}

function getProductGstRate(productId) {
  const product = productsStore.getProductById(productId)
  return product?.gst_rate || 0
}
</script>

<template>
  <div>
    <PageHeader 
      :title="isEditMode ? `Edit Invoice${currentInvoice ? ` #${currentInvoice.invoice_number}` : ''}` : 'Create Invoice'"
      :subtitle="isEditMode && currentInvoice ? `Status: ${currentInvoice.status}` : 'Create a new GST invoice'"
    >
      <template #actions>
        <button class="btn-secondary" @click="goBack">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to List
        </button>
      </template>
    </PageHeader>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <LoadingSpinner size="lg" />
    </div>

    <div v-else class="space-y-6">
      <!-- Read-only notice for finalized invoices -->
      <div v-if="!isEditable && isEditMode" class="bg-warning-50 border border-warning-200 rounded-lg p-4">
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <div>
            <p class="font-medium text-warning-800">This invoice is finalized</p>
            <p class="text-sm text-warning-700">Finalized invoices cannot be edited. You can only view or download the PDF.</p>
          </div>
        </div>
      </div>

      <!-- Step 1: Invoice Header -->
      <div class="card">
        <div class="card-header flex items-center justify-between">
          <h3 class="text-base font-semibold text-gray-900">Invoice Details</h3>
          <StatusBadge v-if="currentInvoice" :status="currentInvoice.status" type="invoice" />
        </div>
        <div class="card-body">
          <div class="grid grid-cols-3 gap-5">
            <FormSelect
              v-model="form.customer_id"
              label="Customer"
              :options="customerOptions"
              placeholder="Select customer"
              required
              :disabled="isEditMode || !isEditable"
            />

            <FormInput
              v-model="form.invoice_date"
              label="Invoice Date"
              type="date"
              required
              :disabled="!isEditable"
            />

            <div v-if="currentInvoice" class="flex flex-col justify-end">
              <label class="form-label">Invoice Number</label>
              <div class="form-input bg-gray-50 font-mono">
                {{ currentInvoice.invoice_number || 'Will be generated' }}
              </div>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-5 mt-5">
            <FormInput
              v-model="form.po_number"
              label="PO Number"
              placeholder="Enter purchase order number (optional)"
              :disabled="!isEditable"
            />
          </div>

          <!-- Create button for new invoices -->
          <div v-if="!isEditMode" class="mt-5 pt-5 border-t border-gray-100">
            <button 
              class="btn-primary"
              @click="createInvoice"
              :disabled="saving || !form.customer_id"
            >
              <svg v-if="saving" class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Create Invoice & Add Items
            </button>
          </div>
        </div>
      </div>

      <!-- Step 2: Invoice Items (only shown after invoice is created) -->
      <div v-if="isEditMode && currentInvoice" class="card">
        <div class="card-header">
          <h3 class="text-base font-semibold text-gray-900">Invoice Items</h3>
        </div>
        <div class="card-body p-0">
          <!-- Items Table -->
          <div class="overflow-x-auto">
            <table class="data-table">
              <thead>
                <tr>
                  <th class="w-8">#</th>
                  <th>Product</th>
                  <th>HSN/SAC</th>
                  <th class="text-center">GST %</th>
                  <th class="text-right">Qty</th>
                  <th class="text-right">Rate</th>
                  <th class="text-right">Taxable Value</th>
                  <th v-if="isEditable" class="w-16"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!invoiceItems.length">
                  <td :colspan="isEditable ? 8 : 7" class="text-center text-gray-500 py-8">
                    No items added yet. Add your first item below.
                  </td>
                </tr>
                <tr v-for="(item, index) in invoiceItems" :key="item.id">
                  <td class="text-gray-500">{{ index + 1 }}</td>
                  <td class="font-medium">{{ getProductName(item.product_id) }}</td>
                  <td class="font-mono text-sm">{{ getProductHsn(item.product_id) }}</td>
                  <td class="text-center">{{ getProductGstRate(item.product_id) }}%</td>
                  <td class="text-right font-mono">{{ formatNumber(item.quantity, 2) }}</td>
                  <td class="text-right currency">{{ formatCurrency(item.rate) }}</td>
                  <td class="text-right currency font-medium">{{ formatCurrency(item.taxable_value) }}</td>
                  <td v-if="isEditable">
                    <button 
                      class="btn-ghost btn-sm text-danger-600"
                      @click="removeItem(item.id)"
                      title="Remove item"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Add Item Form -->
          <div v-if="isEditable" class="p-5 bg-gray-50 border-t border-gray-200">
            <h4 class="text-sm font-medium text-gray-700 mb-3">Add New Item</h4>
            <div class="flex items-end gap-4">
              <div class="flex-1">
                <FormSelect
                  v-model="newItem.product_id"
                  label="Product"
                  :options="productOptions"
                  placeholder="Select product"
                />
              </div>
              <div class="w-32">
                <FormInput
                  v-model="newItem.quantity"
                  label="Quantity"
                  type="number"
                  step="1"
                  min="1"
                />
              </div>
              <div class="w-40">
                <FormInput
                  v-model="newItem.rate"
                  label="Rate (₹)"
                  type="number"
                  step="0.01"
                  min="0"
                />
              </div>
              <div class="w-40">
                <label class="form-label">GST Rate</label>
                <div class="form-input bg-white">
                  {{ selectedProduct ? `${selectedProduct.gst_rate}%` : '-' }}
                </div>
              </div>
              <button
                class="btn-primary"
                @click="addItem"
                :disabled="saving || !newItem.product_id || !newItem.quantity || newItem.quantity <= 0 || !newItem.rate || newItem.rate <= 0"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 3: Tax Summary & Actions -->
      <div v-if="isEditMode && currentInvoice && invoiceItems.length" class="card">
        <div class="card-header">
          <h3 class="text-base font-semibold text-gray-900">Tax Summary</h3>
        </div>
        <div class="card-body">
          <div class="grid grid-cols-2 gap-8">
            <!-- Tax Breakdown -->
            <div class="space-y-3">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Taxable Amount</span>
                <span class="currency">{{ formatCurrency(calculatedTax?.taxable_total || currentInvoice.taxable_total || 0) }}</span>
              </div>
              <div v-if="calculatedTax?.tax_total || currentInvoice.tax_total" class="flex justify-between text-sm">
                <span class="text-gray-600">Tax Total</span>
                <span class="currency">{{ formatCurrency(calculatedTax?.tax_total || currentInvoice.tax_total) }}</span>
              </div>
              <div v-if="calculatedTax?.round_off || currentInvoice.round_off" class="flex justify-between text-sm">
                <span class="text-gray-600">Round Off</span>
                <span class="currency">{{ formatCurrency(calculatedTax?.round_off || currentInvoice.round_off) }}</span>
              </div>
              <div class="flex justify-between pt-3 border-t border-gray-200">
                <span class="font-semibold text-gray-900">Grand Total</span>
                <span class="currency font-bold text-lg text-primary-700">
                  {{ formatCurrency(calculatedTax?.grand_total || currentInvoice.grand_total || 0) }}
                </span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-col items-end justify-end gap-3">
              <div class="flex gap-3">
                <button 
                  v-if="isEditable"
                  class="btn-secondary"
                  @click="calculateGst"
                  :disabled="calculating"
                >
                  <svg v-if="calculating" class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                  </svg>
                  Calculate GST
                </button>

                <button 
                  class="btn-secondary"
                  @click="previewInvoice"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                  Preview
                </button>

                <button
                  v-if="isEditable"
                  class="btn-success"
                  @click="confirmFinalize"
                  :disabled="!isTaxCalculated"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Finalize Invoice
                </button>
              </div>

              <p v-if="isEditable && !isTaxCalculated" class="text-xs text-gray-500">
                Calculate GST before finalizing the invoice
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Finalize Confirmation -->
    <ConfirmDialog
      :show="showFinalizeConfirm"
      title="Finalize Invoice"
      message="Once finalized, this invoice cannot be edited. The invoice number will be generated and it will be ready for download. Are you sure you want to proceed?"
      confirm-text="Finalize"
      variant="primary"
      :loading="finalizing"
      @confirm="finalizeInvoice"
      @cancel="showFinalizeConfirm = false"
      @close="showFinalizeConfirm = false"
    />
  </div>
</template>
