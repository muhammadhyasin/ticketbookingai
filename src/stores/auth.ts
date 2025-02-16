import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  type User
} from 'firebase/auth'
import { useAdminStore } from './admin'
import { createUserDocument } from '../services/firebase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)
  const userEmail = computed(() => user.value?.email)

  const setUser = (newUser: User | null) => {
    user.value = newUser
  }

  // Initialize auth state
  const auth = getAuth()
  onAuthStateChanged(auth, (firebaseUser) => {
    user.value = firebaseUser
    loading.value = false
  })

  const login = async (email: string, password: string) => {
    try {
      loading.value = true
      error.value = null
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      user.value = userCredential.user
      
      // Check admin status after login
      const adminStore = useAdminStore()
      await adminStore.checkAdminStatus()
      
      return userCredential.user
    } catch (err: any) {
      console.error('Login error:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const loginWithGoogle = async () => {
    try {
      loading.value = true
      error.value = null
      
      const provider = new GoogleAuthProvider()
      const userCredential = await signInWithPopup(auth, provider)
      user.value = userCredential.user

      // Create/update user document in Firestore
      await createUserDocument(userCredential.user.uid, {
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
        isAdmin: false
      })

      return userCredential.user
    } catch (err: any) {
      console.error('Google login error:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const register = async (email: string, password: string) => {
    try {
      loading.value = true
      error.value = null
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      user.value = userCredential.user

      // Create user document in Firestore
      await createUserDocument(userCredential.user.uid, {
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
        isAdmin: false
      })

      return userCredential.user
    } catch (err: any) {
      console.error('Registration error:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      user.value = null
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    userEmail,
    setUser,
    login,
    loginWithGoogle,
    register,
    logout
  }
}) 