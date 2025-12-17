<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  {
    to: '/invoices',
    name: 'Invoices',
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>`
  },
  {
    to: '/customers',
    name: 'Customers',
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>`
  },
  {
    to: '/products',
    name: 'Products',
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>`
  },
  {
    to: '/company',
    name: 'Company Setup',
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>`
  }
]

const currentTitle = computed(() => route.meta.title || 'Dashboard')

function isActive(path) {
  return route.path === path || route.path.startsWith(path + '/')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-20">
      <!-- Logo -->
      <div class="h-16 flex items-center px-6 border-b border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-lg">₹</span>
          </div>
          <div>
            <h1 class="text-base font-semibold text-gray-900">GST Billing</h1>
            <p class="text-xs text-gray-500">Invoice Management</p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          custom
          v-slot="{ navigate }"
        >
          <a
            @click="navigate"
            :class="[
              'nav-item cursor-pointer',
              isActive(item.to) ? 'nav-item-active' : 'nav-item-inactive'
            ]"
          >
            <span v-html="item.icon"></span>
            <span>{{ item.name }}</span>
          </a>
        </router-link>
      </nav>

      <!-- Footer -->
      <div class="px-4 py-4 border-t border-gray-100">
        <div class="text-xs text-gray-400 text-center">
          <p>GST Billing System v1.0</p>
          <p class="mt-1">© 2024 Your Company</p>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 ml-64">
      <!-- Top Bar -->
      <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
        <div class="flex items-center gap-4">
          <h2 class="text-sm font-medium text-gray-600">
            {{ currentTitle }}
          </h2>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
            FY 2024-25
          </span>
        </div>
      </header>

      <!-- Page Content -->
      <div class="p-8">
        <router-view v-slot="{ Component, route: currentRoute }">
          <transition name="fade" mode="out-in">
            <component :is="Component" :key="currentRoute.path" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>