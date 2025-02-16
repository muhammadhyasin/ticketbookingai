import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAdminStore } from '../stores/admin'

export const adminGuard = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const adminStore = useAdminStore()
  
  if (!adminStore.isAdmin) {
    next({ name: 'home', query: { error: 'unauthorized' }})
    return
  }
  
  next()
} 