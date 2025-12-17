import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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

router.beforeEach((to, from, next) => {
  document.title = to.meta.title 
    ? `${to.meta.title} | GST Billing` 
    : 'GST Billing'
  next()
})

export default router
