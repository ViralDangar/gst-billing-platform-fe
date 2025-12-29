<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
    default: 1
  },
  totalPages: {
    type: Number,
    required: true,
    default: 1
  },
  totalItems: {
    type: Number,
    default: 0
  },
  pageSize: {
    type: Number,
    default: 10
  }
})

const emit = defineEmits(['page-change', 'page-size-change'])

const pageSizeOptions = [10, 25, 50, 100]

function changePageSize(event) {
  const newPageSize = parseInt(event.target.value)
  emit('page-size-change', newPageSize)
}

const pages = computed(() => {
  const pageList = []
  const totalPages = props.totalPages
  const current = props.currentPage

  if (totalPages <= 7) {
    // Show all pages if 7 or less
    for (let i = 1; i <= totalPages; i++) {
      pageList.push(i)
    }
  } else {
    // Always show first page
    pageList.push(1)

    if (current > 3) {
      pageList.push('...')
    }

    // Show pages around current
    const start = Math.max(2, current - 1)
    const end = Math.min(totalPages - 1, current + 1)

    for (let i = start; i <= end; i++) {
      pageList.push(i)
    }

    if (current < totalPages - 2) {
      pageList.push('...')
    }

    // Always show last page
    if (totalPages > 1) {
      pageList.push(totalPages)
    }
  }

  return pageList
})

const startItem = computed(() => {
  return (props.currentPage - 1) * props.pageSize + 1
})

const endItem = computed(() => {
  return Math.min(props.currentPage * props.pageSize, props.totalItems)
})

function goToPage(page) {
  if (page !== props.currentPage && page >= 1 && page <= props.totalPages) {
    emit('page-change', page)
  }
}

function previousPage() {
  if (props.currentPage > 1) {
    goToPage(props.currentPage - 1)
  }
}

function nextPage() {
  if (props.currentPage < props.totalPages) {
    goToPage(props.currentPage + 1)
  }
}
</script>

<template>
  <div v-if="totalPages > 0" class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200">
    <!-- Info Text and Page Size Selector -->
    <div class="flex flex-col sm:flex-row items-center gap-3">
      <div class="text-sm text-gray-600">
        Showing <span class="font-medium">{{ startItem }}</span> to <span class="font-medium">{{ endItem }}</span> of <span class="font-medium">{{ totalItems }}</span> results
      </div>

      <!-- Page Size Selector -->
      <div class="flex items-center gap-2 text-sm">
        <label for="pageSize" class="text-gray-600">Show:</label>
        <select
          id="pageSize"
          :value="pageSize"
          @change="changePageSize"
          class="px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option v-for="size in pageSizeOptions" :key="size" :value="size">
            {{ size }}
          </option>
        </select>
      </div>
    </div>

    <!-- Pagination Controls -->
    <div v-if="totalPages > 1" class="flex items-center gap-2">
      <!-- Previous Button -->
      <button
        @click="previousPage"
        :disabled="currentPage === 1"
        class="pagination-btn"
        :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>

      <!-- Page Numbers -->
      <template v-for="(page, index) in pages" :key="index">
        <button
          v-if="page !== '...'"
          @click="goToPage(page)"
          class="pagination-btn"
          :class="{
            'pagination-btn-active': page === currentPage,
            'pagination-btn-inactive': page !== currentPage
          }"
        >
          {{ page }}
        </button>
        <span v-else class="px-2 text-gray-400">...</span>
      </template>

      <!-- Next Button -->
      <button
        @click="nextPage"
        :disabled="currentPage === totalPages"
        class="pagination-btn"
        :class="{ 'opacity-50 cursor-not-allowed': currentPage === totalPages }"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.pagination-btn {
  @apply flex items-center justify-center min-w-[2.5rem] h-10 px-3 rounded-lg border transition-colors;
}

.pagination-btn-active {
  @apply bg-primary-600 border-primary-600 text-white font-medium;
}

.pagination-btn-inactive {
  @apply bg-white border-gray-300 text-gray-700 hover:bg-gray-50;
}
</style>
