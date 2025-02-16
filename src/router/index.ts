import { createRouter, createWebHistory } from 'vue-router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import HomeView from '../views/HomeView.vue'
import { adminGuard } from './guards'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
      beforeEnter: adminGuard
    },
    {
      path: '/admin/events/new',
      name: 'new-event',
      component: () => import('../views/NewEventView.vue'),
      beforeEnter: adminGuard
    },
    {
      path: '/tickets/:id',
      name: 'ticket-details',
      component: () => import('../views/TicketDetailsView.vue'),
    }
  ]
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const auth = getAuth()
  
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      
      if (to.meta.requiresAuth && !user) {
        // If route requires auth and user is not logged in
        resolve(next({ name: 'login' }))
      } else if (to.meta.requiresGuest && user) {
        // If route requires guest and user is logged in
        resolve(next({ name: 'dashboard' }))
      } else {
        resolve(next())
      }
    })
  })
})

export default router 