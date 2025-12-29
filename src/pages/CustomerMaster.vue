<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useCustomersStore, useToastStore } from '@/stores'
import { PageHeader, DataTable, Modal, FormInput, FormSelect, StatusBadge, ConfirmDialog, Pagination } from '@/components'
import { INDIAN_STATES, isValidGstin } from '@/utils'
import { required, gstin, validateForm } from '@/utils/validators'

const customersStore = useCustomersStore()
const toast = useToastStore()

const showModal = ref(false)
const showConfirm = ref(false)
const editingCustomer = ref(null)
const customerToToggle = ref(null)
const saving = ref(false)

const currentPage = ref(1)
const pageSize = ref(10)

const form = reactive({
  name: '',
  gstin: '',
  state: '',
  is_b2b: true,
  address: '',
  city: '',
  pincode: '',
  email: '',
  phone: ''
})

const errors = reactive({})

const columns = [
  { key: 'name', label: 'Customer Name' },
  { key: 'gstin', label: 'GSTIN' },
  { key: 'state', label: 'State' },
  { key: 'is_b2b', label: 'Type', align: 'center' },
  { key: 'is_active', label: 'Status', align: 'center' },
  { key: 'actions', label: 'Actions', align: 'center' }
]

const stateOptions = computed(() => {
  return Object.entries(INDIAN_STATES).map(([code, name]) => ({
    value: name,
    label: `${code} - ${name}`
  }))
})

const customerTypeOptions = [
  { value: true, label: 'B2B (Business)' },
  { value: false, label: 'B2C (Consumer)' }
]

const validationRules = computed(() => ({
  name: [(v) => required(v, 'Customer name')],
  state: [(v) => required(v, 'State')],
  gstin: form.is_b2b 
    ? [(v) => required(v, 'GSTIN'), (v) => gstin(v)] 
    : []
}))

onMounted(() => {
  loadCustomers()
})

function loadCustomers() {
  customersStore.fetchCustomers({
    page: currentPage.value,
    page_size: pageSize.value
  })
}

function handlePageChange(page) {
  currentPage.value = page
  loadCustomers()
}

function handlePageSizeChange(newPageSize) {
  pageSize.value = newPageSize
  currentPage.value = 1 // Reset to first page when page size changes
  loadCustomers()
}

function openAddModal() {
  editingCustomer.value = null
  resetForm()
  showModal.value = true
}

function openEditModal(customer) {
  editingCustomer.value = customer
  Object.assign(form, {
    name: customer.name,
    gstin: customer.gstin || '',
    state: customer.state,
    is_b2b: customer.is_b2b,
    address: customer.address || '',
    city: customer.city || '',
    pincode: customer.pincode || '',
    email: customer.email || '',
    phone: customer.phone || ''
  })
  showModal.value = true
}

function resetForm() {
  form.name = ''
  form.gstin = ''
  form.state = ''
  form.is_b2b = true
  form.address = ''
  form.city = ''
  form.pincode = ''
  form.email = ''
  form.phone = ''
  Object.keys(errors).forEach(key => delete errors[key])
}

function closeModal() {
  showModal.value = false
  editingCustomer.value = null
  resetForm()
}

function handleGstinChange() {
  if (form.gstin && isValidGstin(form.gstin)) {
    const stateCode = form.gstin.substring(0, 2)
    if (INDIAN_STATES[stateCode]) {
      form.state = INDIAN_STATES[stateCode]
    }
  }
}

function handleCustomerTypeChange() {
  if (!form.is_b2b) {
    form.gstin = ''
  }
}

async function saveCustomer() {
  Object.keys(errors).forEach(key => delete errors[key])
  
  const { isValid, errors: validationErrors } = validateForm(form, validationRules.value)
  if (!isValid) {
    Object.assign(errors, validationErrors)
    return
  }

  saving.value = true
  try {
    const data = {
      name: form.name,
      gstin: form.is_b2b ? form.gstin : null,
      state: form.state,
      is_b2b: form.is_b2b,
      address: form.address || null,
      city: form.city || null,
      pincode: form.pincode || null,
      email: form.email || null,
      phone: form.phone || null
    }

    if (editingCustomer.value) {
      await customersStore.updateCustomer(editingCustomer.value.id, data)
      toast.success('Customer updated successfully')
    } else {
      await customersStore.createCustomer(data)
      toast.success('Customer created successfully')
    }
    closeModal()
  } catch (err) {
    // Error handled by API interceptor
  } finally {
    saving.value = false
  }
}

function confirmToggleStatus(customer) {
  customerToToggle.value = customer
  showConfirm.value = true
}

async function toggleStatus() {
  if (!customerToToggle.value) return

  try {
    await customersStore.toggleStatus(
      customerToToggle.value.id, 
      !customerToToggle.value.is_active
    )
    toast.success(
      customerToToggle.value.is_active 
        ? 'Customer disabled successfully' 
        : 'Customer enabled successfully'
    )
  } catch (err) {
    // Error handled by API interceptor
  } finally {
    showConfirm.value = false
    customerToToggle.value = null
  }
}
</script>

<template>
  <div class="fade-in">
    <PageHeader
      title="Customer Master"
      subtitle="Manage your customers and their details"
    >
      <template #actions>
        <button class="btn-primary" @click="openAddModal">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Add Customer
        </button>
      </template>
    </PageHeader>

    <div class="card slide-up animation-delay-100">
      <!-- Fixed height table container -->
      <div class="h-[calc(100vh-320px)] overflow-hidden flex flex-col">
        <div class="flex-1 overflow-y-auto">
          <DataTable
            :columns="columns"
            :data="customersStore.customers"
            :loading="customersStore.loading"
            empty-message="No customers found. Add your first customer to get started."
          >
        <template #cell-gstin="{ value }">
          <span class="font-mono text-sm">{{ value || '-' }}</span>
        </template>

        <template #cell-state="{ value }">
          {{ value || '-' }}
        </template>

        <template #cell-is_b2b="{ value }">
          <StatusBadge :status="value ? 'B2B' : 'B2C'" type="customer" />
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
              Add Customer
            </button>
          </template>
        </DataTable>
        </div>
      </div>

      <!-- Pagination -->
      <Pagination
        :current-page="currentPage"
        :total-pages="customersStore.pagination.total_pages"
        :total-items="customersStore.pagination.total"
        :page-size="pageSize"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      />
    </div>

    <!-- Add/Edit Modal -->
    <Modal 
      :show="showModal" 
      :title="editingCustomer ? 'Edit Customer' : 'Add Customer'"
      size="lg"
      @close="closeModal"
    >
      <form @submit.prevent="saveCustomer" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <FormInput
              v-model="form.name"
              label="Customer Name"
              placeholder="Enter customer/company name"
              required
              :error="errors.name"
            />
          </div>

          <FormSelect
            v-model="form.is_b2b"
            label="Customer Type"
            :options="customerTypeOptions"
            required
            @change="handleCustomerTypeChange"
          />

          <FormInput
            v-model="form.gstin"
            label="GSTIN"
            placeholder="22AAAAA0000A1Z5"
            :required="form.is_b2b"
            :disabled="!form.is_b2b"
            :error="errors.gstin"
            @blur="handleGstinChange"
            class="uppercase"
          />

          <FormSelect
            v-model="form.state"
            label="State"
            :options="stateOptions"
            placeholder="Select state"
            required
            :error="errors.state"
          />

          <FormInput
            v-model="form.city"
            label="City"
            placeholder="Enter city"
          />

          <div class="col-span-2">
            <FormInput
              v-model="form.address"
              label="Address"
              placeholder="Enter full address"
            />
          </div>

          <FormInput
            v-model="form.pincode"
            label="Pincode"
            placeholder="400001"
            maxlength="6"
          />

          <FormInput
            v-model="form.phone"
            label="Phone"
            placeholder="9876543210"
            maxlength="10"
          />

          <FormInput
            v-model="form.email"
            label="Email"
            type="email"
            placeholder="customer@example.com"
          />
        </div>
      </form>

      <template #footer>
        <button class="btn-secondary" @click="closeModal" :disabled="saving">
          Cancel
        </button>
        <button class="btn-primary" @click="saveCustomer" :disabled="saving">
          <svg v-if="saving" class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ saving ? 'Saving...' : (editingCustomer ? 'Update Customer' : 'Add Customer') }}
        </button>
      </template>
    </Modal>

    <!-- Confirm Dialog -->
    <ConfirmDialog
      :show="showConfirm"
      :title="customerToToggle?.is_active ? 'Disable Customer' : 'Enable Customer'"
      :message="`Are you sure you want to ${customerToToggle?.is_active ? 'disable' : 'enable'} '${customerToToggle?.name}'?`"
      :variant="customerToToggle?.is_active ? 'warning' : 'primary'"
      :confirm-text="customerToToggle?.is_active ? 'Disable' : 'Enable'"
      @confirm="toggleStatus"
      @cancel="showConfirm = false"
      @close="showConfirm = false"
    />
  </div>
</template>

<style scoped>
.fade-in {
  animation: fadeIn 0.3s ease-in;
}

.slide-up {
  animation: slideUp 0.4s ease-out;
}

.animation-delay-100 {
  animation-delay: 0.1s;
  opacity: 0;
  animation-fill-mode: forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>