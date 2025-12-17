<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useInvoicesStore, useToastStore } from '@/stores'
import { PageHeader, DataTable, StatusBadge } from '@/components'
import { formatCurrency, formatDate } from '@/utils'

const router = useRouter()
const invoicesStore = useInvoicesStore()
const toast = useToastStore()

const columns = [
  { key: 'invoice_number', label: 'Invoice No.' },
  { key: 'invoice_date', label: 'Date' },
  { key: 'customer_name', label: 'Customer' },
  { key: 'total_amount', label: 'Amount', align: 'right' },
  { key: 'status', label: 'Status', align: 'center' },
  { key: 'actions', label: 'Actions', align: 'center' }
]

onMounted(() => {
  invoicesStore.fetchInvoices()
})

function createInvoice() {
  router.push({ name: 'invoice-create' })
}

function viewInvoice(invoice) {
  router.push({ name: 'invoice-preview', params: { id: invoice.id } })
}

function editInvoice(invoice) {
  if (invoice.status === 'FINAL') {
    toast.warning('Final invoices cannot be edited')
    return
  }
  router.push({ name: 'invoice-edit', params: { id: invoice.id } })
}

async function downloadPdf(invoice) {
  if (invoice.status !== 'FINAL') {
    toast.warning('Only finalized invoices can be downloaded')
    return
  }
  
  try {
    await invoicesStore.downloadPdf(invoice.id)
    toast.success('PDF downloaded successfully')
  } catch (err) {
    // Error handled by API interceptor
  }
}
</script>

<template>
  <div>
    <PageHeader 
      title="Invoices" 
      subtitle="View and manage all your invoices"
    >
      <template #actions>
        <button class="btn-primary" @click="createInvoice">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Create Invoice
        </button>
      </template>
    </PageHeader>

    <div class="card">
      <DataTable
        :columns="columns"
        :data="invoicesStore.invoices"
        :loading="invoicesStore.loading"
        empty-message="No invoices found. Create your first invoice to get started."
        @row-click="viewInvoice"
      >
        <template #cell-invoice_number="{ value }">
          <span class="font-mono font-medium text-primary-700">{{ value }}</span>
        </template>

        <template #cell-invoice_date="{ value }">
          {{ formatDate(value) }}
        </template>

        <template #cell-total_amount="{ value }">
          <span class="currency font-medium">{{ formatCurrency(value) }}</span>
        </template>

        <template #cell-status="{ value }">
          <StatusBadge :status="value" type="invoice" />
        </template>

        <template #cell-actions="{ row }">
          <div class="flex items-center justify-center gap-1">
            <button 
              class="btn-ghost btn-sm"
              @click.stop="viewInvoice(row)"
              title="View"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
            </button>
            
            <button 
              v-if="row.status === 'DRAFT'"
              class="btn-ghost btn-sm"
              @click.stop="editInvoice(row)"
              title="Edit"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </button>
            
            <button 
              v-if="row.status === 'FINAL'"
              class="btn-ghost btn-sm text-primary-600"
              @click.stop="downloadPdf(row)"
              title="Download PDF"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </button>
          </div>
        </template>

        <template #empty-action>
          <button class="btn-primary btn-sm mt-4" @click="createInvoice">
            Create Invoice
          </button>
        </template>
      </DataTable>
    </div>
  </div>
</template>
