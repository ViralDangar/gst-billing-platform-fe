<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number, null],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  options: {
    type: Array,
    default: () => []
    // Each option: { value: any, label: string } or string
  },
  placeholder: {
    type: String,
    default: 'Select an option'
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
  valueKey: {
    type: String,
    default: 'value'
  },
  labelKey: {
    type: String,
    default: 'label'
  }
})

const emit = defineEmits(['update:modelValue'])

const selectValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const selectClasses = computed(() => [
  'form-select',
  props.error ? 'form-input-error' : ''
])

function getOptionValue(option) {
  return typeof option === 'object' ? option[props.valueKey] : option
}

function getOptionLabel(option) {
  return typeof option === 'object' ? option[props.labelKey] : option
}
</script>

<template>
  <div class="space-y-1">
    <label v-if="label" class="form-label">
      {{ label }}
      <span v-if="required" class="text-danger-500 ml-0.5">*</span>
    </label>
    <select
      v-model="selectValue"
      :disabled="disabled"
      :class="selectClasses"
      v-bind="$attrs"
    >
      <option value="" disabled>{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="getOptionValue(option)"
        :value="getOptionValue(option)"
      >
        {{ getOptionLabel(option) }}
      </option>
    </select>
    <p v-if="error" class="form-error">{{ error }}</p>
    <p v-else-if="hint" class="form-hint">{{ hint }}</p>
  </div>
</template>

<script>
export default {
  inheritAttrs: false
}
</script>
