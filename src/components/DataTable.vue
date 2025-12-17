<script setup>
import LoadingSpinner from './LoadingSpinner.vue'

defineProps({
  columns: {
    type: Array,
    required: true
    // Each column: { key: string, label: string, class?: string, align?: 'left'|'center'|'right' }
  },
  data: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  emptyMessage: {
    type: String,
    default: 'No records found'
  },
  rowKey: {
    type: String,
    default: 'id'
  }
})

defineEmits(['row-click'])

function getAlignment(align) {
  const alignments = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }
  return alignments[align] || 'text-left'
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="data-table">
      <thead>
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            :class="[getAlignment(col.align), col.headerClass]"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <!-- Loading state -->
        <tr v-if="loading">
          <td :colspan="columns.length" class="py-12">
            <div class="flex items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          </td>
        </tr>

        <!-- Empty state -->
        <tr v-else-if="!data.length">
          <td :colspan="columns.length">
            <div class="empty-state">
              <svg class="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <p class="empty-state-title">{{ emptyMessage }}</p>
              <slot name="empty-action"></slot>
            </div>
          </td>
        </tr>

        <!-- Data rows -->
        <template v-else>
          <tr
            v-for="row in data"
            :key="row[rowKey]"
            @click="$emit('row-click', row)"
            class="cursor-pointer"
          >
            <td
              v-for="col in columns"
              :key="col.key"
              :class="[getAlignment(col.align), col.cellClass]"
            >
              <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                {{ row[col.key] }}
              </slot>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>
