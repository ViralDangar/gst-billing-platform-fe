<script setup>
import Modal from './Modal.vue'

defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Confirm Action'
  },
  message: {
    type: String,
    default: 'Are you sure you want to proceed?'
  },
  confirmText: {
    type: String,
    default: 'Confirm'
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'danger', 'warning'].includes(v)
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['confirm', 'cancel', 'close'])

const variantClasses = {
  primary: 'btn-primary',
  danger: 'btn-danger',
  warning: 'bg-warning-500 text-white hover:bg-warning-600'
}
</script>

<template>
  <Modal :show="show" :title="title" size="sm" @close="emit('close')">
    <p class="text-gray-600">{{ message }}</p>
    
    <template #footer>
      <button
        class="btn-secondary"
        :disabled="loading"
        @click="emit('cancel')"
      >
        {{ cancelText }}
      </button>
      <button
        :class="['btn', variantClasses[variant]]"
        :disabled="loading"
        @click="emit('confirm')"
      >
        <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {{ confirmText }}
      </button>
    </template>
  </Modal>
</template>
