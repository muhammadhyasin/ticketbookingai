import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { auth } from '../config/firebase'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/register',
      component: () => import('../views/RegisterView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin',
      component: () => import('../views/AdminView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('../components/chat/ChatInterface.vue'),
      meta: { 
        requiresAuth: true,
        fullscreen: true 
      }
    },
    {
      path: '/tickets',
      name: 'tickets',
      component: () => import('../views/TicketsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/tickets/:id',
      name: 'ticket-details',
      component: () => import('../views/TicketDetailsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/events/new',
      name: 'new-event',
      component: () => import('../views/NewEventView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/tickets/:id',
      name: 'ticket-details',
      component: () => import('../views/TicketDetailsView.vue'),
    },

    
  ]
})

// Add this variable to track initialization
let authInitialized = false

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Wait for Firebase Auth to initialize
  if (!authInitialized) {
    await new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged(() => {
        authInitialized = true
        unsubscribe()
        resolve()
      })
    })
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/dashboard')
  } else if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/dashboard')
  } else {
    next()
  }
})

// ... rest of router configuration

export default router 