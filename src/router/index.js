import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import { useAuthStore } from '@/stores'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Auth routes (public) - MUST be first to avoid matching issues
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/Login.vue'),
      meta: { title: 'Login', public: true, requiresAuth: false }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/pages/Register.vue'),
      meta: { title: 'Register', public: true, requiresAuth: false }
    },
    // Protected routes
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '',
          name: 'dashboard',
          redirect: '/invoices'
        },
        {
          path: 'company',
          name: 'company-setup',
          component: () => import('@/pages/CompanySetup.vue'),
          meta: { title: 'Company & GSTIN Setup' }
        },
        {
          path: 'products',
          name: 'products',
          component: () => import('@/pages/ProductMaster.vue'),
          meta: { title: 'Product Master' }
        },
        {
          path: 'customers',
          name: 'customers',
          component: () => import('@/pages/CustomerMaster.vue'),
          meta: { title: 'Customer Master' }
        },
        {
          path: 'invoices',
          name: 'invoices',
          component: () => import('@/pages/InvoiceList.vue'),
          meta: { title: 'Invoices' }
        },
        {
          path: 'invoices/create',
          name: 'invoice-create',
          component: () => import('@/pages/InvoiceForm.vue'),
          meta: { title: 'Create Invoice' }
        },
        {
          path: 'invoices/:id/edit',
          name: 'invoice-edit',
          component: () => import('@/pages/InvoiceForm.vue'),
          meta: { title: 'Edit Invoice' }
        },
        {
          path: 'invoices/:id/preview',
          name: 'invoice-preview',
          component: () => import('@/pages/InvoicePreview.vue'),
          meta: { title: 'Invoice Preview' }
        }
      ]
    }
  ]
})

// Initialize auth store once on app startup
let authStoreInitialized = false

router.beforeEach((to, from, next) => {
  // Set page title
  document.title = to.meta.title
    ? `${to.meta.title} | GST Billing`
    : 'GST Billing'

  const authStore = useAuthStore()

  // Initialize auth store only once
  if (!authStoreInitialized) {
    authStore.init()
    authStoreInitialized = true
  }

  // Public routes (login, register)
  const isPublicRoute = to.meta.requiresAuth === false

  if (isPublicRoute) {
    // If already authenticated, redirect to dashboard
    if (authStore.isAuthenticated) {
      next({ name: 'invoices' })
    } else {
      next()
    }
  } else {
    // Protected route - require authentication
    if (authStore.isAuthenticated) {
      next()
    } else {
      next({ name: 'login', query: { redirect: to.fullPath } })
    }
  }
})

export default router
