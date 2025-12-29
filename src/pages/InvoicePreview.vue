<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useInvoicesStore, useToastStore } from '@/stores'
import { PageHeader, LoadingSpinner, StatusBadge } from '@/components'
import { formatCurrency, formatDate, formatNumber, numberToWords, INDIAN_STATES } from '@/utils'

const route = useRoute()
const router = useRouter()
const invoicesStore = useInvoicesStore()
const toast = useToastStore()

const loading = ref(true)
const downloading = ref(false)

const invoiceId = computed(() => route.params.id)
const preview = computed(() => invoicesStore.invoicePreview)
const invoice = computed(() => preview.value?.invoice)
const seller = computed(() => preview.value?.seller)
const buyer = computed(() => preview.value?.buyer)
const items = computed(() => preview.value?.items || [])
const taxSummary = computed(() => preview.value?.tax_summary)

const isIntraState = computed(() => {
  // Determine if intra-state based on tax types in the response
  // If CGST/SGST exists, it's intra-state. If IGST exists, it's inter-state.
  const taxes = preview.value?.tax_summary
  if (!taxes) return true
  return (taxes.cgst_amount > 0 || taxes.sgst_amount > 0)
})

onMounted(async () => {
  try {
    await invoicesStore.fetchPreview(invoiceId.value)
  } catch (err) {
    toast.error('Failed to load invoice preview')
    router.push({ name: 'invoices' })
  } finally {
    loading.value = false
  }
})

async function downloadPdf() {
  if (invoice.value?.status !== 'FINAL') {
    toast.warning('Only finalized invoices can be downloaded')
    return
  }

  downloading.value = true
  try {
    await invoicesStore.downloadPdf(invoiceId.value)
    toast.success('PDF downloaded successfully')
  } catch (err) {
    // Error handled by API interceptor
  } finally {
    downloading.value = false
  }
}

function goBack() {
  router.push({ name: 'invoices' })
}

function editInvoice() {
  if (invoice.value?.status === 'FINAL') {
    toast.warning('Final invoices cannot be edited')
    return
  }
  router.push({ name: 'invoice-edit', params: { id: invoiceId.value } })
}

function getStateName(code) {
  return INDIAN_STATES[code] || code
}

function printInvoice() {
  window.print()
}
</script>

<template>
  <div>
    <PageHeader 
      title="Invoice Preview" 
      :subtitle="invoice ? `Invoice #${invoice.invoice_number}` : 'Loading...'"
      class="no-print"
    >
      <template #actions>
        <button class="btn-secondary" @click="goBack">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to List
        </button>
        
        <button 
          v-if="invoice?.status === 'DRAFT'"
          class="btn-secondary" 
          @click="editInvoice"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
          Edit
        </button>

        <button 
          class="btn-secondary" 
          @click="printInvoice"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
          </svg>
          Print
        </button>

        <button 
          v-if="invoice?.status === 'FINAL'"
          class="btn-primary" 
          @click="downloadPdf"
          :disabled="downloading"
        >
          <svg v-if="downloading" class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          Download PDF
        </button>
      </template>
    </PageHeader>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <LoadingSpinner size="lg" />
    </div>

    <div v-else-if="preview" class="invoice-preview p-8">
      <!-- Header -->
      <div class="invoice-header">
        <div class="text-center mb-4">
          <h1 class="text-2xl font-bold text-gray-900">TAX INVOICE</h1>
        </div>
        
        <div class="grid grid-cols-2 gap-8">
          <!-- Seller Details -->
          <div>
            <h2 class="text-lg font-bold text-gray-900 mb-2">{{ seller?.name }}</h2>
            <p class="text-sm text-gray-600">{{ seller?.address }}</p>
            <p v-if="seller?.city" class="text-sm text-gray-600">{{ seller?.city }}, {{ getStateName(seller?.state) }} - {{ seller?.pincode }}</p>
            <p class="text-sm mt-2">
              <span class="font-medium">GSTIN:</span> 
              <span class="font-mono">{{ seller?.gstin }}</span>
            </p>
            <p v-if="seller?.email" class="text-sm">
              <span class="font-medium">Email:</span> {{ seller?.email }}
            </p>
            <p v-if="seller?.phone" class="text-sm">
              <span class="font-medium">Phone:</span> {{ seller?.phone }}
            </p>
          </div>

          <!-- Invoice Details -->
          <div class="text-right">
            <div class="inline-block text-left">
              <table class="text-sm">
                <tbody>
                  <tr>
                    <td class="font-medium pr-4 py-1">Invoice No:</td>
                    <td class="font-mono font-bold text-primary-700">{{ invoice?.invoice_number }}</td>
                  </tr>
                  <tr>
                    <td class="font-medium pr-4 py-1">Date:</td>
                    <td>{{ formatDate(invoice?.invoice_date) }}</td>
                  </tr>
                  <tr>
                    <td class="font-medium pr-4 py-1">Status:</td>
                    <td><StatusBadge :status="invoice?.status" type="invoice" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Buyer Details -->
      <div class="invoice-section">
        <div class="bg-gray-50 border border-gray-200 p-4 rounded">
          <h3 class="text-sm font-semibold text-gray-700 mb-2">Bill To:</h3>
          <h4 class="font-bold text-gray-900">{{ buyer?.name }}</h4>
          <p v-if="buyer?.address" class="text-sm text-gray-600">{{ buyer?.address }}</p>
          <p v-if="buyer?.city" class="text-sm text-gray-600">
            {{ buyer?.city }}, {{ getStateName(buyer?.state) }} {{ buyer?.pincode ? `- ${buyer.pincode}` : '' }}
          </p>
          <p v-if="buyer?.gstin" class="text-sm mt-2">
            <span class="font-medium">GSTIN:</span> 
            <span class="font-mono">{{ buyer?.gstin }}</span>
          </p>
          <p class="text-sm">
            <span class="font-medium">Place of Supply:</span> 
            {{ getStateName(buyer?.state) }} ({{ buyer?.state }})
          </p>
        </div>
      </div>

      <!-- Items Table -->
      <div class="invoice-section">
        <table class="invoice-table">
          <thead>
            <tr>
              <th class="w-10 text-center">#</th>
              <th>Description</th>
              <th class="text-center">HSN/SAC</th>
              <th class="text-right">Qty</th>
              <th class="text-right">Rate</th>
              <th class="text-right">Taxable Value</th>
              <template v-if="isIntraState">
                <th class="text-right">CGST</th>
                <th class="text-right">SGST</th>
              </template>
              <template v-else>
                <th class="text-right">IGST</th>
              </template>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in items" :key="item.id">
              <td class="text-center">{{ index + 1 }}</td>
              <td>
                <div class="font-medium">{{ item.product_name }}</div>
              </td>
              <td class="text-center font-mono text-xs">{{ item.hsn_sac }}</td>
              <td class="text-right font-mono">{{ formatNumber(item.quantity) }} {{ item.unit }}</td>
              <td class="text-right currency">{{ formatCurrency(item.rate) }}</td>
              <td class="text-right currency">{{ formatCurrency(item.taxable_value) }}</td>
              <template v-if="isIntraState">
                <td class="text-right">
                  <div class="currency">{{ formatCurrency(item.cgst_amount) }}</div>
                  <div class="text-xs text-gray-500">@ {{ item.gst_rate / 2 }}%</div>
                </td>
                <td class="text-right">
                  <div class="currency">{{ formatCurrency(item.sgst_amount) }}</div>
                  <div class="text-xs text-gray-500">@ {{ item.gst_rate / 2 }}%</div>
                </td>
              </template>
              <template v-else>
                <td class="text-right">
                  <div class="currency">{{ formatCurrency(item.igst_amount) }}</div>
                  <div class="text-xs text-gray-500">@ {{ item.gst_rate }}%</div>
                </td>
              </template>
              <td class="text-right currency font-medium">{{ formatCurrency(item.total_amount) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="bg-gray-50 font-semibold">
              <td colspan="5" class="text-right">Total</td>
              <td class="text-right currency">{{ formatCurrency(taxSummary?.taxable_amount) }}</td>
              <template v-if="isIntraState">
                <td class="text-right currency">{{ formatCurrency(taxSummary?.cgst_amount) }}</td>
                <td class="text-right currency">{{ formatCurrency(taxSummary?.sgst_amount) }}</td>
              </template>
              <template v-else>
                <td class="text-right currency">{{ formatCurrency(taxSummary?.igst_amount) }}</td>
              </template>
              <td class="text-right currency">{{ formatCurrency(invoice?.total_amount) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Tax Summary -->
      <div class="invoice-section">
        <div class="grid grid-cols-2 gap-8">
          <!-- Amount in Words -->
          <div>
            <h4 class="text-sm font-semibold text-gray-700 mb-2">Amount in Words:</h4>
            <p class="text-sm text-gray-800 italic">{{ numberToWords(invoice?.total_amount || 0) }}</p>
          </div>

          <!-- Summary Box -->
          <div>
            <table class="w-full text-sm">
              <tbody>
                <tr>
                  <td class="py-1">Taxable Amount</td>
                  <td class="text-right currency py-1">{{ formatCurrency(taxSummary?.taxable_amount) }}</td>
                </tr>
                <template v-if="isIntraState">
                  <tr>
                    <td class="py-1">CGST</td>
                    <td class="text-right currency py-1">{{ formatCurrency(taxSummary?.cgst_amount) }}</td>
                  </tr>
                  <tr>
                    <td class="py-1">SGST</td>
                    <td class="text-right currency py-1">{{ formatCurrency(taxSummary?.sgst_amount) }}</td>
                  </tr>
                </template>
                <template v-else>
                  <tr>
                    <td class="py-1">IGST</td>
                    <td class="text-right currency py-1">{{ formatCurrency(taxSummary?.igst_amount) }}</td>
                  </tr>
                </template>
                <tr class="border-t-2 border-gray-800">
                  <td class="py-2 font-bold text-base">Grand Total</td>
                  <td class="text-right currency font-bold text-base text-primary-700 py-2">
                    {{ formatCurrency(invoice?.total_amount) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Bank Details -->
      <div v-if="seller?.bank_name" class="invoice-section">
        <div class="bg-gray-50 border border-gray-200 p-4 rounded">
          <h4 class="text-sm font-semibold text-gray-700 mb-2">Bank Details for Payment:</h4>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p><span class="text-gray-600">Bank Name:</span> {{ seller?.bank_name }}</p>
              <p><span class="text-gray-600">Branch:</span> {{ seller?.bank_branch }}</p>
            </div>
            <div>
              <p><span class="text-gray-600">Account Name:</span> {{ seller?.account_name }}</p>
              <p><span class="text-gray-600">Account No:</span> <span class="font-mono">{{ seller?.account_number }}</span></p>
              <p><span class="text-gray-600">IFSC:</span> <span class="font-mono">{{ seller?.ifsc_code }}</span></p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="invoice-section mt-8">
        <div class="grid grid-cols-2">
          <div>
            <p class="text-xs text-gray-500">Terms & Conditions:</p>
            <ol class="text-xs text-gray-500 list-decimal list-inside mt-1">
              <li>Payment due within 30 days</li>
              <li>Subject to jurisdiction of local courts</li>
            </ol>
          </div>
          <div class="text-right">
            <p class="text-sm font-medium text-gray-700 mb-12">For {{ seller?.name }}</p>
            <p class="text-sm text-gray-600 border-t border-gray-300 pt-2 inline-block">
              Authorized Signatory
            </p>
          </div>
        </div>
      </div>

      <!-- Computer Generated Notice -->
      <div class="text-center mt-6 pt-4 border-t border-gray-200">
        <p class="text-xs text-gray-400">This is a computer generated invoice</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media print {
  .no-print {
    display: none !important;
  }

  .invoice-preview {
    box-shadow: none !important;
    border: none !important;
    margin: 0 !important;
    padding: 20px !important;
  }
}
</style>
