<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'default'
    // Types: default, invoice, customer, product
  }
})

const badgeClass = computed(() => {
  const statusLower = props.status.toLowerCase()
  
  // Invoice status
  if (props.type === 'invoice') {
    if (statusLower === 'draft') return 'badge-draft'
    if (statusLower === 'final') return 'badge-final'
  }
  
  // Customer type
  if (props.type === 'customer') {
    if (statusLower === 'b2b') return 'badge-b2b'
    if (statusLower === 'b2c') return 'badge-b2c'
  }
  
  // Active/Inactive status
  if (statusLower === 'active' || statusLower === 'true') return 'badge-active'
  if (statusLower === 'inactive' || statusLower === 'false') return 'badge-inactive'
  
  // Default
  return 'badge bg-gray-100 text-gray-700 border border-gray-200'
})

const displayText = computed(() => {
  const statusLower = props.status.toLowerCase()
  
  if (statusLower === 'true') return 'Active'
  if (statusLower === 'false') return 'Inactive'
  
  return props.status.charAt(0).toUpperCase() + props.status.slice(1).toLowerCase()
})
</script>

<template>
  <span :class="['badge', badgeClass]">
    {{ displayText }}
  </span>
</template>
