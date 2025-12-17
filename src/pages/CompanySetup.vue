<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useCompanyStore, useToastStore } from '@/stores'
import { PageHeader, FormInput, FormSelect, FormTextarea, LoadingSpinner } from '@/components'
import { INDIAN_STATES, isValidGstin } from '@/utils'
import { required, gstin, ifsc, accountNumber, validateForm } from '@/utils/validators'

const companyStore = useCompanyStore()
const toast = useToastStore()

const loading = ref(false)
const saving = ref(false)
const errors = reactive({})

const form = reactive({
  name: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  gstin: '',
  pan: '',
  email: '',
  phone: '',
  bank_name: '',
  bank_branch: '',
  account_name: '',
  account_number: '',
  ifsc_code: ''
})

const stateOptions = computed(() => {
  return Object.entries(INDIAN_STATES).map(([code, name]) => ({
    value: code,
    label: `${code} - ${name}`
  }))
})

const validationRules = {
  name: [(v) => required(v, 'Company name')],
  address: [(v) => required(v, 'Address')],
  state: [(v) => required(v, 'State')],
  gstin: [(v) => required(v, 'GSTIN'), (v) => gstin(v)],
  account_number: [(v) => v ? accountNumber(v) : null],
  ifsc_code: [(v) => v ? ifsc(v) : null]
}

onMounted(async () => {
  loading.value = true
  try {
    await companyStore.fetchCompany()
    if (companyStore.company) {
      Object.assign(form, companyStore.company)
    }
  } finally {
    loading.value = false
  }
})

function handleGstinChange() {
  if (form.gstin && isValidGstin(form.gstin)) {
    const stateCode = form.gstin.substring(0, 2)
    if (INDIAN_STATES[stateCode]) {
      form.state = stateCode
    }
    // Extract PAN from GSTIN
    form.pan = form.gstin.substring(2, 12)
  }
}

async function saveCompany() {
  // Clear previous errors
  Object.keys(errors).forEach(key => delete errors[key])
  
  // Validate
  const { isValid, errors: validationErrors } = validateForm(form, validationRules)
  if (!isValid) {
    Object.assign(errors, validationErrors)
    toast.error('Please fix the validation errors')
    return
  }

  saving.value = true
  try {
    await companyStore.saveCompany({ ...form })
    toast.success('Company details saved successfully')
  } catch (err) {
    // Error is handled by API interceptor
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <PageHeader 
      title="Company & GSTIN Setup" 
      subtitle="Configure your business details for GST invoicing"
    />

    <div v-if="loading" class="flex items-center justify-center py-20">
      <LoadingSpinner size="lg" />
    </div>

    <div v-else class="max-w-4xl">
      <form @submit.prevent="saveCompany" class="space-y-8">
        <!-- Company Information -->
        <div class="card">
          <div class="card-header">
            <h3 class="text-base font-semibold text-gray-900">Company Information</h3>
          </div>
          <div class="card-body space-y-5">
            <div class="grid grid-cols-2 gap-5">
              <div class="col-span-2">
                <FormInput
                  v-model="form.name"
                  label="Company Name"
                  placeholder="Enter company name"
                  required
                  :error="errors.name"
                />
              </div>
              
              <FormInput
                v-model="form.gstin"
                label="GSTIN"
                placeholder="22AAAAA0000A1Z5"
                required
                :error="errors.gstin"
                @blur="handleGstinChange"
                class="uppercase"
              />
              
              <FormInput
                v-model="form.pan"
                label="PAN"
                placeholder="AAAAA0000A"
                readonly
                hint="Auto-filled from GSTIN"
              />
              
              <div class="col-span-2">
                <FormTextarea
                  v-model="form.address"
                  label="Address"
                  placeholder="Enter full address"
                  required
                  :rows="2"
                  :error="errors.address"
                />
              </div>
              
              <FormInput
                v-model="form.city"
                label="City"
                placeholder="Enter city"
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
                v-model="form.pincode"
                label="Pincode"
                placeholder="400001"
                maxlength="6"
              />
              
              <FormInput
                v-model="form.email"
                label="Email"
                type="email"
                placeholder="company@example.com"
              />
              
              <FormInput
                v-model="form.phone"
                label="Phone"
                placeholder="9876543210"
                maxlength="10"
              />
            </div>
          </div>
        </div>

        <!-- Bank Details -->
        <div class="card">
          <div class="card-header">
            <h3 class="text-base font-semibold text-gray-900">Bank Details</h3>
            <p class="text-sm text-gray-500 mt-0.5">For invoice payment instructions</p>
          </div>
          <div class="card-body space-y-5">
            <div class="grid grid-cols-2 gap-5">
              <FormInput
                v-model="form.bank_name"
                label="Bank Name"
                placeholder="HDFC Bank"
              />
              
              <FormInput
                v-model="form.bank_branch"
                label="Branch"
                placeholder="Mumbai Main Branch"
              />
              
              <FormInput
                v-model="form.account_name"
                label="Account Holder Name"
                placeholder="Company Name Pvt Ltd"
              />
              
              <FormInput
                v-model="form.account_number"
                label="Account Number"
                placeholder="50100123456789"
                :error="errors.account_number"
              />
              
              <FormInput
                v-model="form.ifsc_code"
                label="IFSC Code"
                placeholder="HDFC0001234"
                :error="errors.ifsc_code"
                class="uppercase"
              />
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3 pt-4">
          <button type="submit" class="btn-primary" :disabled="saving">
            <svg v-if="saving" class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ saving ? 'Saving...' : 'Save Company Details' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
