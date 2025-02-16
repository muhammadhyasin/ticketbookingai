import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth'
import { db } from '../services/firebase'
import { doc, getDoc } from 'firebase/firestore'

export const useAdminStore = defineStore('admin', () => {
  const isAdmin = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const authStore = useAuthStore()

  const checkAdminStatus = async () => {
    if (!authStore.user?.uid) {
      isAdmin.value = false
      return
    }

    try {
      loading.value = true
      error.value = null
      
      const userDoc = await getDoc(doc(db, 'users', authStore.user.uid))
      isAdmin.value = userDoc.data()?.isAdmin || false
    } catch (err: any) {
      console.error('Error checking admin status:', err)
      error.value = err.message
      isAdmin.value = false
    } finally {
      loading.value = false
    }
  }

  return {
    isAdmin,
    loading,
    error,
    checkAdminStatus
  }
}) 