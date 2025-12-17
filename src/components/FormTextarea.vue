<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  rows: {
    type: Number,
    default: 3
  },
  error: {
    type: String,
    default: ''
  },
  hint: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const textareaValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const textareaClasses = computed(() => [
  'form-input resize-none',
  props.error ? 'form-input-error' : ''
])
</script>

<template>
  <div class="space-y-1">
    <label v-if="label" class="form-label">
      {{ label }}
      <span v-if="required" class="text-danger-500 ml-0.5">*</span>
    </label>
    <textarea
      v-model="textareaValue"
      :placeholder="placeholder"
      :rows="rows"
      :disabled="disabled"
      :readonly="readonly"
      :class="textareaClasses"
      v-bind="$attrs"
    ></textarea>
    <p v-if="error" class="form-error">{{ error }}</p>
    <p v-else-if="hint" class="form-hint">{{ hint }}</p>
  </div>
</template>

<script>
export default {
  inheritAttrs: false
}
</script>
