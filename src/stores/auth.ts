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

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)

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
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      user.value = userCredential.user
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const userCredential = await signInWithPopup(auth, provider)
      user.value = userCredential.user
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const register = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      user.value = userCredential.user
    } catch (error: any) {
      throw new Error(error.message)
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
    isAuthenticated,
    userEmail,
    setUser,
    login,
    loginWithGoogle,
    register,
    logout
  }
}) 